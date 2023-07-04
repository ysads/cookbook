type Props = {
  params: { id: string };
};
export default async function RecipePage({ params }: Props) {
  const recipe = await prisma?.recipe.findUnique({
    where: { id: parseInt(params.id) },
  });

  return recipe ? <div>{recipe.title}</div> : null;
}
