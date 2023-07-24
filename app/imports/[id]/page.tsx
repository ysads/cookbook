import { prisma } from "@/lib/prisma";

type Props = {
  params: { id: string };
};
export default async function SingleImportPage({ params }: Props) {
  const recipeImport = await prisma.recipeImport.findUnique({
    where: { id: parseInt(params.id) },
  });
  if (!recipeImport) return <p>not found</p>;

  return (
    <main>
      {recipeImport.title} - {recipeImport.url}
    </main>
  );
}
