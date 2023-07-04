import { JSDOM } from "jsdom";
import { fodmapFormulaNew } from "./parsers/fodmap-formula-new";
import { fodmapFormulaOld } from "./parsers/fodmap-formula-old";
import { fodmapEveryday } from "./parsers/fodmap-everyday";
import {
  RecipeImport,
  RecipeLead,
  recipeImportSchema,
  recipeLeadSchema,
} from "./types";
import { DeepNullish } from "../types";
import axios from "axios";

const parsers = [fodmapFormulaNew, fodmapFormulaOld, fodmapEveryday];

export type ParserOutput =
  | {
      url: string;
      status: "success";
      recipe: RecipeImport;
    }
  | {
      url: string;
      status: "partial";
      recipe: DeepNullish<RecipeImport>;
      errors: { path: string; message: string }[];
    }
  | {
      url: string;
      status: "error";
      recipe: null;
      errors: { message: string }[];
    };

export async function parseRecipe(url: string): Promise<ParserOutput> {
  const page = await axios.get(url);
  const dom = new JSDOM(page.data);
  const input = { document: dom.window.document, url };
  const parser = parsers.find((p) => p.canParse(input));

  if (!parser) {
    return {
      url,
      errors: [{ message: "No parser found" }],
      recipe: null,
      status: "error",
    };
  }

  const nullishRecipe = parser.parse(input);
  const validation = recipeImportSchema.safeParse(nullishRecipe);
  if (!validation.success) {
    return {
      url,
      errors: validation.error.issues.map((i) => ({
        message: i.message,
        path: i.path.join("."),
      })),
      recipe: nullishRecipe,
      status: "partial",
    };
  }

  return {
    url,
    recipe: validation.data,
    status: "success",
  };
}

export type ListOutput = {} & (
  | {
      status: "success";
      list: RecipeLead[];
    }
  | {
      status: "partial";
      list: RecipeLead[];
      errors: { path: string; message: string }[];
    }
  | {
      status: "error";
      list: [];
      errors: { message: string }[];
    }
);

export async function listRecipes(url: string): Promise<ListOutput> {
  const page = await axios
    .get(url)
    .then((res) => res.data)
    .catch((e) => {
      if ((e.response.status = 404)) return null;
      throw e;
    });

  if (!page)
    return {
      status: "error",
      list: [],
      errors: [{ message: "Page not found" }],
    };

  const dom = new JSDOM(page);
  const input = { document: dom.window.document, url };
  const parser = parsers.find((p) => p.canList(input));

  if (!parser) {
    return {
      status: "error",
      list: [],
      errors: [{ message: "No parser found" }],
    };
  }

  const validation = recipeLeadSchema.array().safeParse(parser.list(input));
  if (!validation.success) {
    return {
      status: "partial",
      list: [],
      errors: validation.error.issues.map((i) => ({
        message: i.message,
        path: i.path.join("."),
      })),
    };
  }

  return {
    status: "success",
    list: validation.data,
  };
}
