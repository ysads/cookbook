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
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
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
            <span
              key={`recipe-${recipe.id}-${c}`}
              className="uppercase text-xs rounded-lg font-bold text-pink-400"
            >
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
