import { Course } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
    ? { title: { search: args.term.split(" ").join(" & ") } }
    : {};
  const courseFilter = args.courses
    ? { courses: { hasSome: args.courses } }
    : {};

  const baseQuery = {
    where: { ...termFilter, ...courseFilter },
    orderBy: { createdAt: "asc" },
  };

  console.warn("::: applying filters", {
    take: args.take,
    where: { ...termFilter, ...courseFilter },
    skip: (args.page - 1) * args.take,
    orderBy: { createdAt: "asc" },
    include: { ingredientSets: true, instructionSets: true },
  });

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
