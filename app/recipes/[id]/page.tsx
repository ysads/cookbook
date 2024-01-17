import { prisma } from "@/lib/prisma";
import { Checkbox } from "@/components/ui/checkbox";
import { Calistoga, Taviraj } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";
import MaxWSize from "@/components/ui/max-w-size";
import { ArrowUpRight } from "lucide-react";

const taviraj = Taviraj({
  weight: ["600", "700", "800"],
  subsets: ["latin-ext"],
});

const calistoga = Calistoga({ weight: ["400"], subsets: ["latin-ext"] });

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

  const [timeStart, ...timeRest] = recipe?.time.includes(" ")
    ? recipe.time.split(" ")
    : [null, recipe?.time];

  return recipe ? (
    <div>
      <div className="w-full relative">
        <div className="bg-gradient-to-b from-black/50 w-full h-1/2 absolute top-0 left-0"></div>
        <img
          className="w-full aspect-[4/3] object-cover"
          src={recipe.imageUrl}
          alt={recipe.title}
        />
        <div className="w-full absolute top-0 left-0">
          <MaxWSize>
            <h1 className="text-4xl font-bold lowercase text-white">
              {recipe.title}
            </h1>
          </MaxWSize>
        </div>
      </div>
      <MaxWSize>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <span className="text-slate-500 lowercase">Courses</span>
            <div className="flex items-center gap-2">
              {recipe.courses.map((c) => (
                <>
                  <Link
                    href={`/?courses=${c}`}
                    className="font-semibold lowercase text-black text-2xl outline-none transition-all hover:border-b-slate-400 focus:border-b-slate-400 border-b-4 border-b-transparent"
                  >
                    <span key={`recipe-${recipe.id}-${c}`}>{c}</span>
                  </Link>
                  <span
                    className="last:hidden text-slate-300 font-semibold select-none"
                    aria-hidden
                  >
                    /
                  </span>
                </>
              ))}
            </div>
          </div>
          <DashedSeparator className="md:hidden" />
          <div>
            <span className="block text-slate-500 lowercase text-left">
              Source
            </span>
            <Link
              href={recipe.sourceUrl}
              className="font-semibold lowercase text-black text-2xl outline-none transition-all hover:border-b-slate-400 focus:border-b-slate-400 border-b-4 border-b-transparent inline-flex gap-1 items-center"
            >
              {recipe.source}
              <ArrowUpRight width={24} className="mt-1 text-slate-400" />
            </Link>
          </div>
        </div>
        <DashedSeparator className="my-10" />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="my-2 space-x-1.5">
            <span className="font-bold text-4xl text-gray-900">
              {timeStart}
            </span>
            <span>
              {Array.isArray(timeRest) ? timeRest.join(" ") : timeRest}
            </span>
          </div>
          <DashedSeparator className="md:hidden" />
          <div className="my-2 space-x-1.5">
            <span className="font-bold text-4xl text-gray-900">
              {recipe.servings}
            </span>
            <span>{recipe.servings > 1 ? "servings" : "serving"}</span>
          </div>
        </div>
        <DashedSeparator className="my-10" />
        <div className="grid grid-cols-2 gap-8 col-span-12">
          <section>
            <div className="sticky top-0">
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
                        className="flex items-start"
                      >
                        <Checkbox
                          className="peer accent-pink-500 mt-3 cursor-pointer"
                          id={`set-${set.id}-ingred-${index}`}
                        />
                        <label
                          htmlFor={`set-${set.id}-ingred-${index}`}
                          className="pl-2 peer-[[data-state='checked']]:decoration-2 peer-[[data-state='checked']]:underline peer-[[data-state='checked']]:decoration-pink-400 peer-[[data-state='checked']]:underline-offset-2 py-1.5 cursor-pointer"
                        >
                          <span
                            dangerouslySetInnerHTML={{ __html: ingred }}
                          ></span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4">Instructions</h2>
            {recipe.instructionSets.map((set) => (
              <>
                {recipe.instructionSets.length > 1 && set.name && (
                  <h3 className="text-lg font-bold mt-8 mb-2">{set.name}</h3>
                )}
                <ul className="space-y-8">
                  {set.instructions.map((instruction, index) => (
                    <li
                      key={`set-${set.id}-instruction-${index}`}
                      className="flex gap-9 items-start"
                    >
                      <span
                        className="font-bold text-4xl mt-1 grid place-items-center shrink-0 text-slate-400"
                        aria-hidden
                      >
                        {index + 1}.
                      </span>
                      <div
                        className="leading-normal"
                        dangerouslySetInnerHTML={{ __html: instruction }}
                      />
                    </li>
                  ))}
                </ul>
              </>
            ))}
          </section>
        </div>
        {recipe.notes.length > 0 && (
          <>
            <DashedSeparator className="my-10" />
            <section className="col-span-12">
              <h2 className="text-2xl font-bold mb-4">Notes</h2>
              <ul className="gap-4 grid grid-cols-1 md:grid-cols-2">
                {recipe.notes.map((note, index) => (
                  <li key={`node-${index}`} className="flex gap-9 items-start">
                    <span
                      className="font-bold text-4xl mt-1 w-5 h-5 grid place-items-center shrink-0 text-slate-400"
                      aria-hidden
                    >
                      /
                    </span>

                    <div dangerouslySetInnerHTML={{ __html: note }}></div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </MaxWSize>
    </div>
  ) : null;
}

function DashedSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn("bg-repeat-x h-[5px]", className)}
      style={{
        background:
          "radial-gradient(circle closest-side, rgb(210 210 210) calc(100% - 0.5px), transparent 100%)",
        backgroundSize: "10px 5px",
      }}
      aria-hidden
    />
  );
}
