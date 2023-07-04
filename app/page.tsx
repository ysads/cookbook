import { Button } from "@/components/ui/button";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Prisma does not support Edge without the Data Proxy currently
// export const runtime = 'edge'
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

export default async function Home() {
  const recipes = await prisma?.recipe.findMany({});

  return (
    <main className="relative flex flex-col items-center ">
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
        Cookbook 🍱
      </h1>

      <h3>all recipes</h3>
      {recipes && recipes.length ? (
        <ul className="grid grid-cols-4">
          {recipes.map((r) => {
            return (
              <li className="appearance-none">
                <img
                  src={r.imageUrl}
                  alt={r.title}
                  className={cn(
                    "h-auto object-cover transition-all hover:scale-105 aspect-[4/3] w-full"
                  )}
                />
                <Badge variant="default">{r.source}</Badge>
                <p>{r.title}</p>
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
