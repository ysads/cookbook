import { BadgeInfoIcon, CalendarDays, Clock10, Salad } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

const formatter = Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

type Props = {
  params: { id: string };
};
export default async function RecipePage({ params }: Props) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: parseInt(params.id) },
    include: { ingredientSets: true, instructionSets: true },
  });

  return recipe ? (
    <div className="grid grid-cols-12">
      <div className="col-span-12 space-y-6">
        <h1 className="text-3xl font-extrabold">{recipe.title}</h1>
        <div className="grid grid-cols-12 gap-4">
          <img
            className="w-full col-span-12 md:col-span-7 aspect-[4/3] object-cover"
            src={recipe.imageUrl}
            alt={recipe.title}
          />
          <div className="col-span-12 md:col-span-5 space-y-4">
            <ul className="flex gap-1 col-span-4">
              {recipe.courses.map((course) => (
                <Link
                  href={`/?courses=${course}`}
                  key={course}
                  aria-label={`See all ${course} recipes`}
                >
                  <li className="font-extrabold text-sm px-2 py-1 bg-pink-200 rounded">
                    {course}
                  </li>
                </Link>
              ))}
            </ul>
            <span className="flex flex-wrap gap-2">
              <Salad
                className="w-4 md:w-6 rounded-full"
                aria-label="Servings"
              />
              {recipe.servings} servings
            </span>
            <span className="flex gap-2">
              <Clock10 className="w-4 md:w-6" aria-label="Total time" />
              {recipe.time}
            </span>
            {recipe.postedAt && (
              <span className="flex gap-2">
                <CalendarDays className="w-4 md:w-6" aria-label="Total time" />
                Posted at {formatter.format(recipe.postedAt)}
              </span>
            )}
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Badge variant="secondary" className="text-base">
                {recipe.source}
              </Badge>
            </a>
          </div>
        </div>
        <DashedSeparator />
        <section className="">
          <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
          {recipe.ingredientSets.map((set) => (
            <>
              {recipe.ingredientSets.length > 1 && (
                <h3 className="text-lg font-bold mt-8 mb-1">
                  {set.name || "<set-name>"}
                </h3>
              )}
              <ul className="space-y-2">
                {set.ingreds.map((ingred, index) => (
                  <li
                    key={`set-${set.id}-ingred-${index}`}
                    className="flex gap-2 items-start"
                  >
                    <Checkbox
                      className="peer accent-pink-500 mt-1.5"
                      id={`set-${set.id}-ingred-${index}`}
                    />
                    <label
                      htmlFor={`set-${set.id}-ingred-${index}`}
                      className="peer-[[data-state='checked']]:bg-pink-200/40 peer-[[data-state='checked']]:underline peer-[[data-state='checked']]:underline-offset-2"
                    >
                      {ingred}
                    </label>
                  </li>
                ))}
              </ul>
            </>
          ))}
        </section>
        <DashedSeparator />
        <section>
          <h2 className="text-2xl font-bold mb-4">Instructions</h2>
          {recipe.instructionSets.map((set) => (
            <>
              {recipe.instructionSets.length > 1 && set.name && (
                <h3 className="text-lg font-bold mt-8 mb-2">{set.name}</h3>
              )}
              <ul className="space-y-4">
                {set.instructions.map((instruction, index) => (
                  <li
                    key={`set-${set.id}-instruction-${index}`}
                    className="flex gap-3 items-start"
                  >
                    <span
                      className="bg-pink-300/50 rounded-full font-bold text-sm mt-1 w-5 h-5 grid place-items-center shrink-0"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div
                      className="peer-[[data-state='checked']]:bg-pink-200/40 peer-[[data-state='checked']]:underline peer-[[data-state='checked']]:underline-offset-2 leading-normal"
                      dangerouslySetInnerHTML={{ __html: instruction }}
                    />
                  </li>
                ))}
              </ul>
            </>
          ))}
        </section>
        {recipe.notes.length > 0 && (
          <>
            <DashedSeparator />
            <section>
              <h2 className="text-2xl font-bold mb-4">Notes</h2>
              <ul className="gap-4 grid grid-cols-1 md:grid-cols-2">
                {recipe.notes.map((note, index) => (
                  <li
                    key={`node-${index}`}
                    className="border-l-4 border-pink-300 bg-pink-50 p-4 flex gap-4 text-sm leading-relaxed"
                  >
                    <BadgeInfoIcon
                      className="w-4 shrink-0"
                      role="presentation"
                    />
                    <div dangerouslySetInnerHTML={{ __html: note }}></div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  ) : null;
}

function DashedSeparator() {
  return (
    <div className="flex flex-col gap-1" aria-hidden>
      <hr className="border-0 border-b border-b-pink-300 border-dashed" />
      <hr className="border-0 border-b border-b-pink-300 border-dashed" />
    </div>
  );
}
