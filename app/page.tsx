import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { BookmarkPlus, Clock10, Salad } from "lucide-react";

// Prisma does not support Edge without the Data Proxy currently
// export const runtime = 'edge'
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

export default async function Home() {
  const recipes = await prisma?.recipe.findMany({
    take: 24,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="relative flex flex-col items-center ">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
        Cookbook 🍱
      </h1>
      {recipes && recipes.length ? (
        <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          {recipes.map((r) => {
            return (
              <li className="appearance-none rounded-3xl bg-purple-50 overflow-hidden border border-purple-200 focus-within:bg-purple-100 hover:bg-purple-100 transition-all hover:rounded-[2.5rem]">
                <Link href={`/recipes/${r.id}`}>
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    className={cn(
                      "h-auto object-cover transition-all hover:scale-105 aspect-[4/3] w-full rounded-3xl"
                    )}
                  />
                </Link>
                <div className="px-5 py-6 flex flex-col gap-3">
                  {/* <Badge variant="default">{r.source}</Badge> */}
                  <span className="flex gap-2">
                    {r.courses.map((c) => (
                      <span className="uppercase text-sm rounded-lg font-bold text-purple-600">
                        {c}
                      </span>
                    ))}
                  </span>
                  <div className="flex justify-between">
                    <p className="text-xl font-bold line-clamp-2">
                      <Link href={`/recipes/${r.id}`}>{r.title}</Link>
                    </p>
                    <Button variant="ghost">
                      <BookmarkPlus width={24} />
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex gap-1">
                      <Clock10 width={16} />
                      {r.servings} servings
                    </span>
                    <span className="flex gap-1">
                      <Salad width={16} /> {r.time}
                    </span>
                    {/* {r.courses.map((c) => (
                        <span className="lowercase bg-purple-300/40 hover:bg-purple-300/75 px-2 py-1 rounded-lg">
                          {c}
                        </span>
                      ))} */}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>no recipe found</p>
      )}
    </main>
  );
}
