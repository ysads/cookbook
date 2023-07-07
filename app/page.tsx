"use client";

import RecipeFilterToolbar, {
  RecipeFilters,
} from "@/components/recipe-filter-toolbar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BookmarkPlus, Clock10, Salad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Queries } from "@/lib/queries";
import { filterRecipes } from "@/lib/api/filterRecipes";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Recipe } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Unpersisted } from "@/lib/types";
import PageNavigation from "@/components/page-navigation";

//  Prisma does not support Edge without the Data Proxy currently
// export const runtime = "edge";
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

type PageFilters = RecipeFilters & { page: number };

export default function Home() {
  const [filters, setFilters] = useState<PageFilters>({
    term: "",
    page: 1,
    courses: [],
  });
  const recipes = useQuery({
    queryKey: [Queries.filteredRecipes, filters],
    queryFn: () => filterRecipes(filters),
  });

  return (
    <main className="relative flex flex-col items-center">
      <div className="space-y-4 w-full">
        {/* <pre className="pre text-xs">{JSON.stringify(filters, null, 2)}</pre> */}
        <RecipeFilterToolbar
          filters={filters}
          onFilter={(newFilters) => {
            setFilters({
              ...newFilters,
              page: 1,
            });
          }}
        />
        <PageNavigation
          page={filters.page}
          onNavigate={(newPage) =>
            setFilters((prev) => ({ ...prev, page: newPage }))
          }
        />
        {recipes.isFetching || recipes.isLoading ? (
          <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
          </ul>
        ) : recipes.data?.length ? (
          <>
            <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {recipes.data.map((r) => (
                <SingleRecipe recipe={r} key={"recipe-" + r.id} />
              ))}
            </ul>
            <PageNavigation
              page={filters.page}
              onNavigate={(newPage) =>
                setFilters((prev) => ({ ...prev, page: newPage }))
              }
            />
          </>
        ) : (
          <p>No recipe found</p>
        )}
      </div>
    </main>
  );
}

function RecipeSkeleton() {
  return (
    <li className="space-y-3">
      <Skeleton className="rounded-xl aspect-[4/3] w-full"></Skeleton>
      <div className="space-y-1">
        <Skeleton className="rounded w-11/12 h-6" />
        <Skeleton className="rounded w-9/12 h-6" />
      </div>
      <div className="flex space-x-3">
        <Skeleton className="rounded w-3/12 h-3" />
        <Skeleton className="rounded w-5/12 h-3" />
      </div>
    </li>
  );
}

function SingleRecipe({ recipe }: { recipe: Unpersisted<Recipe> }) {
  return (
    <li className="appearance-none overflow-hidden transition-all">
      <Link href={`/recipes/${recipe.id}`}>
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className={cn(
            "h-auto object-cover rounded-xl transition-all hover:scale-105 aspect-[4/3] w-full "
          )}
        />
      </Link>
      <div className="pl-3 pr-0 py-4 flex flex-col gap-2 mb-6">
        <span className="flex gap-2">
          {recipe.courses.map((c) => (
            <span className="uppercase text-xs rounded-lg font-bold text-pink-400">
              {c}
            </span>
          ))}
        </span>
        <div className="flex justify-between">
          <p className="text-md font-bold line-clamp-2">
            <Link href={`/recipes/${recipe.id}`}>{recipe.title}</Link>
          </p>
          <Button variant="ghost">
            <BookmarkPlus width={24} />
          </Button>
        </div>
        <div className="flex gap-3 flex-wrap">
          <span className="flex gap-1">
            <Clock10 width={16} />
            {recipe.servings} servings
          </span>
          <span className="flex gap-1">
            <Salad width={16} /> {recipe.time}
          </span>
        </div>
      </div>
    </li>
  );
}
