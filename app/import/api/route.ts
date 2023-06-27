import { importRecipe, listRecipes } from "@/lib/sources";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { zfd } from "zod-form-data";

export async function GET(req: NextRequest) {
  const { url } = zfd
    .formData({ url: z.string().url() })
    .parse(req.nextUrl.searchParams);
  const result = await listRecipes(url);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const form = z.object({ url: z.string().url() }).parse(await req.json());
  const result = await importRecipe(form.url);

  if (result.status === "success") {
    // await prisma?.recipe.create({
    //   data: {
    //     title: result.recipe.title,
    //     time: result.recipe.time,
    //     servings: result.recipe.servings,
    //     imageUrl: result.recipe.imageUrl,
    //     notes: result.recipe.notes,
    //     postedAt: result.recipe.postedAt,
    //     keywords: result.recipe.keywords,
    //     courses: result.recipe.courses,
    //     sourceUrl: result.recipe.sourceUrl,
    //     source: result.recipe.source,
    //     ingredientSets: {
    //       create: result.recipe.ingredientSets.map((set) => ({
    //         name: set.name,
    //         ingredients: set.ingreds,
    //       })),
    //     },
    //     instructionSets: {
    //       create: result.recipe.instructionSets.map((set) => ({
    //         name: set.name,
    //         instructions: set.instructions,
    //       })),
    //     },
    //   },
    // });
  }

  return NextResponse.json(result);
}
