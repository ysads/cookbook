import RecipeForm from "@/components/recipes/recipe-form";
import ImportHeader from "@/components/imports/import-header";
import RecipeParsingOutput from "@/components/recipes/recipe-parsing-output";
import MaxWSize from "@/components/ui/max-w-size";

import { prisma } from "@/lib/prisma";
import { parseRecipe } from "@/lib/sources";
import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipeImport = await prisma.recipeImport.findUnique({
    where: { id: parseInt(params.id) },
  });

  return {
    title: recipeImport ? `Importing ${recipeImport.title}` : "Cookbook",
  };
}

export default async function SingleImportPage({ params }: Props) {
  const recipeImport = await prisma.recipeImport.findUnique({
    where: { id: parseInt(params.id) },
  });
  if (!recipeImport) return <p>not found</p>;

  const parsed = await parseRecipe(recipeImport.url);

  return (
    <MaxWSize>
      <main className="relative flex h-full flex-col space-y-4">
        <ImportHeader recipeImport={recipeImport} />
        <RecipeParsingOutput parsed={parsed} />
        <RecipeForm parsed={parsed} />
      </main>
    </MaxWSize>
  );
}
