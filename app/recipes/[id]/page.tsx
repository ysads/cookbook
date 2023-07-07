type Props = {
  params: { id: string };
};
export default async function RecipePage({ params }: Props) {
  const recipe = await prisma?.recipe.findUnique({
    where: { id: parseInt(params.id) },
  });

  return recipe ? (
    <div className="grid grid-cols-12">
      <aside className="col-span-6 md:col-span-5">
        <img
          className="rounded-xl w-full"
          src={recipe.imageUrl}
          alt={recipe.title}
        />
      </aside>
      <div className="col-span-12 md:col-span-7">
        <h2 className="text-2xl font-bold">{recipe.title}</h2>
      </div>
    </div>
  ) : null;
}
