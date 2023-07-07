import { Course } from "@prisma/client";
import { z } from "zod";
import {
  ingredientSetSchema,
  instructionSetSchema,
  persisted,
  recipeSchema,
} from "../schemas";

type Args = {
  term?: string;
  courses?: Course[];
  lastId?: number;
  page: number;
};

const schema = z.array(
  persisted(recipeSchema).extend({
    ingredientSets: persisted(ingredientSetSchema).array().min(1),
    instructionSets: persisted(instructionSetSchema).array().min(1),
  })
);

const TAKE_PER_PAGE = "32";

export async function filterRecipes({
  courses,
  term,
  lastId = undefined,
  page,
}: Args) {
  const params = new URLSearchParams({
    page: String(page),
    take: TAKE_PER_PAGE,
  });

  if (term) {
    params.append("term", term);
  }
  if (courses && courses.length) {
    params.append("courses", courses.join(","));
  }
  if (lastId) {
    params.append("lastId", String(lastId));
  }

  return fetch(`/api/recipes?${params.toString()}`).then(async (res) => {
    if (res.ok) {
      const validation = schema.safeParse(await res.json());

      if (!validation.success) {
        console.error("::: validation errors", validation.error.errors);
        return;
      }
      return validation.data;
    }
  });
}
