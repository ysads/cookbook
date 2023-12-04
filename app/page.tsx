"use client";

import RecipeFilterToolbar, {
  RecipeFilters,
} from "@/components/recipe-filter-toolbar";
import Link from "next/link";
import PageNavigation from "@/components/page-navigation";
import { cn } from "@/lib/utils";
import { BookmarkPlus, Clock10, Salad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Queries } from "@/lib/queries";
import { filterRecipes } from "@/lib/api/filterRecipes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Course, Recipe } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { StringifiedDates } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useWritableSearchParams } from "@/lib/hooks/useWritableSearchParams";

//  Prisma does not support Edge without the Data Proxy currently
// export const runtime = "edge";
export const preferredRegion = "home";
export const dynamic = "force-dynamic";

type PageFilters = RecipeFilters & { page: number };

function getFiltersFromSearchParams(params: URLSearchParams) {
  const page = params.get("page");

  return {
    term: params.get("term") || "",
    page: page ? parseInt(page) : 1,
    courses: params.getAll("courses") as Course[],
  };
}

export default function ListRecipes() {
  const { searchParams, getUpdatedQueryString } = useWritableSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<PageFilters>(
    getFiltersFromSearchParams(searchParams)
  );
  const recipes = useQuery({
    queryKey: [Queries.filteredRecipes, filters],
    queryFn: () => filterRecipes(filters),
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      ...getFiltersFromSearchParams(searchParams),
    }));
  }, [searchParams]);

  return (
    <main className="relative flex flex-col items-center">
      <div className="space-y-4 w-full">
        {/* <pre className="pre text-xs">{JSON.stringify(session, null, 2)}</pre> */}
        <RecipeFilterToolbar
          filters={filters}
          onFilter={(newFilters) => {
            router.push(
              "/?" + getUpdatedQueryString({ ...newFilters, page: 1 }, true)
            );
          }}
        />
        {recipes.isLoading ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
          </ul>
        ) : recipes.data ? (
          <>
            <Alert role="status">
              <AlertDescription className="font-semibold">
                {recipes.data.meta.count} results found
              </AlertDescription>
            </Alert>
            {recipes.data.meta.pages > 0 ? (
              <PageNavigation
                currPage={filters.page}
                pages={recipes.data.meta.pages}
              />
            ) : null}
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {recipes.data.recipes.map((r) => (
                <SingleRecipe recipe={r} key={"recipe-" + r.id} />
              ))}
            </ul>
            {recipes.data.meta.pages > 0 ? (
              <PageNavigation
                currPage={filters.page}
                pages={recipes.data.meta.pages}
              />
            ) : null}
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

function SingleRecipe({ recipe }: { recipe: StringifiedDates<Recipe> }) {
  return (
    <li className="appearance-none overflow-hidden">
      <div className="relative bg-gradient-to-b rounded-t-xl">
        <Link
          href={`/recipes/${recipe.id}`}
          className="appearance-none outline-none"
        >
          {/* from-black/75 via-gray-800/50 to-gray-500/5 */}
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className={cn(
              "h-auto object-cover rounded-xl transition-all w-full aspect-square"
            )}
          />
          <div className="absolute top-0 left-0 p-2 pb-8 flex w-full justify-between text-white font-semibold text-sm ">
            <span>{recipe.time}</span>
            <span>{recipe.servings}</span>
          </div>
        </Link>
      </div>
      <div className="pr-0 pt-2 flex flex-col">
        <span className="text-medium lowercase font-bold">
          <Link href={`/recipes/${recipe.id}`}>{recipe.title}</Link>
        </span>
      </div>
      <div className="pr-0 pt-1 mb-8 flex flex-col">
        <span className="flex gap-2 items-center">
          {recipe.courses.map((c) => (
            <>
              <Link href={`/?courses=${c}`}>
                <span
                  key={`recipe-${recipe.id}-${c}`}
                  className="font-semibold lowercase text-slate-500 text-sm"
                >
                  {c}
                </span>
              </Link>
              <span
                className="last:hidden text-slate-300 font-semibold select-none"
                aria-hidden
              >
                /
              </span>
            </>
          ))}
        </span>
      </div>
    </li>
  );
}
