import { Course } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SOURCES } from "@/lib/schemas";

const getSchema = z.object({
  take: z.coerce.number().min(1),
  lastId: z.coerce.number().nullish(),
  term: z.string().nullish(),
  page: z.coerce.number().min(1).default(1),
  courses: z
    .string()
    .transform((val, _) => (val ? val.split(",") : []))
    .pipe(z.nativeEnum(Course).array())
    .nullish(),
});

export async function GET(request: NextRequest) {
  const args = getSchema.parse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );

  const termFilter = args.term
    ? ({ title: { contains: `%${args.term}%`, mode: "insensitive" } } as const)
    : {};
  const courseFilter = args.courses
    ? { courses: { hasSome: args.courses } }
    : {};

  const baseQuery = {
    where: { ...termFilter, ...courseFilter },
    orderBy: { createdAt: "asc" },
  } as const;

  const count = await prisma.recipe.count(baseQuery);

  const recipes = await prisma.recipe.findMany({
    ...baseQuery,
    take: args.take,
    skip: (args.page - 1) * args.take,
    include: { ingredientSets: true, instructionSets: true },
  });

  return NextResponse.json({
    meta: {
      count,
      pages: Math.ceil(count / args.take),
    },
    recipes,
  });
}

const postSchema = z.object({
  title: z.string().nonempty(),
  time: z.string().nonempty(),
  servings: z.coerce.number().min(1),
  ingredientSets: z
    .array(
      z.object({
        value: z.object({
          name: z.string().optional(),
          ingreds: z
            .array(
              z.object({
                value: z
                  .string()
                  .min(1, "You have an empty ingredient, is that right?"),
              })
            )
            .min(1, "You need at least one ingredient"),
        }),
      })
    )
    .min(1),
  instructionSets: z
    .array(
      z.object({
        value: z.object({
          name: z.string().optional(),
          instructions: z
            .array(
              z.object({
                value: z
                  .string()
                  .min(1, "You have an empty instruction, is that right?"),
              })
            )
            .min(1, "You need at least one instruction"),
        }),
      })
    )
    .min(1),
  imageUrl: z.string().url(),
  notes: z.array(
    z.object({
      value: z.string().min(1, "You have an empty note, is that right?"),
    })
  ),
  postedAt: z.string().datetime().nullish(),
  // keywords: z.string().array(),
  courses: z.array(z.nativeEnum(Course)).min(1),
  sourceUrl: z.string().url(),
  source: z.enum(SOURCES),
});

export async function POST(request: NextRequest) {
  const validation = postSchema.safeParse(await request.json());

  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.issues },
      { status: 400 }
    );
  }

  const { ingredientSets, instructionSets, notes, ...recipe } = validation.data;

  const result = await prisma
    .$transaction(async (tx) => {
      const existingImports = await tx.recipeImport.findMany({
        where: { url: recipe.sourceUrl },
      });

      console.log(
        "::: deleting following imports",
        existingImports.map((i) => i.id)
      );

      const existingRecipe = await tx.recipe.findFirst({
        where: { sourceUrl: recipe.sourceUrl },
      });
      if (existingRecipe) {
        throw new Error(
          "This recipe has already been imported! ID: " + existingRecipe.id
        );
      }

      await tx.recipeImport.deleteMany({
        where: { id: { in: existingImports.map((i) => i.id) } },
      });
      await tx.recipeImport.create({
        data: {
          url: recipe.sourceUrl,
          title: recipe.title,
          status: "success",
        },
      });
      return tx.recipe.create({
        data: {
          ...recipe,
          notes: notes.map((n) => n.value),
          ingredientSets: {
            createMany: {
              data: ingredientSets.map((set) => ({
                name: set.value.name,
                ingreds: set.value.ingreds.map((i) => i.value),
              })),
            },
          },
          instructionSets: {
            createMany: {
              data: instructionSets.map((set) => ({
                name: set.value.name,
                instructions: set.value.instructions.map((i) => i.value),
              })),
            },
          },
        },
      });
    })
    .then((recipe) => ({ success: true, recipe } as const))
    .catch((err) => ({ success: false, error: err.message } as const));

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.recipe, { status: 201 });
}
