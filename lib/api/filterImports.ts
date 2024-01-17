import { z } from "zod";
import { persisted, recipeImportSchema } from "../schemas";

type Args = {
  url?: string;
  status?: string[];
  term?: string;
  // courses?: Course[];
  lastId?: number;
  page: number;
  take: number;
};

const schema = z.object({
  meta: z.object({ count: z.coerce.number(), pages: z.number() }),
  imports: persisted(recipeImportSchema).array(),
  //   recipes: z.array(
  //     persisted(recipeSchema).extend({
  //       ingredientSets: persisted(ingredientSetSchema).array().min(1),
  //       instructionSets: persisted(instructionSetSchema).array().min(1),
  //     })
  //   ),
});

const TAKE_PER_PAGE = 36;

export async function filterImports({
  status,
  url,
  term,
  lastId = undefined,
  take = TAKE_PER_PAGE,
  page,
}: Args) {
  const params = new URLSearchParams({
    page: String(page),
    take: String(take),
  });

  if (url) {
    params.append("url", url);
  }
  if (status) {
    params.append("status", status[0]);
  }
  if (term) {
    params.append("term", term);
  }
  if (lastId) {
    params.append("lastId", String(lastId));
  }

  return fetch(`/api/imports?${params.toString()}`).then(async (res) => {
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
