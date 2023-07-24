import RecipeForm from "@/components/recipes/recipe-form";
import { prisma } from "@/lib/prisma";
import { parseRecipe } from "@/lib/sources";

type Props = {
  params: { id: string };
};
export default async function SingleImportPage({ params }: Props) {
  const recipeImport = await prisma.recipeImport.findUnique({
    where: { id: parseInt(params.id) },
  });
  if (!recipeImport) return <p>not found</p>;

  const parsed = await parseRecipe(recipeImport.url);

  return (
    <main className="relative flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Editing {recipeImport.title}
        </h1>
      </div>
      <RecipeForm parsed={parsed} />
    </main>
  );
}
