import { JSDOM } from "jsdom";
import { fodmapFormulaNew } from "./fodmap-formula-new";
import { fodmapFormulaOld } from "./fodmap-formula-old";
import { fodmapEveryday } from "./fodmap-everyday";
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
      status: "skipped";
    }
  | {
      url: string;
      status: "success";
      recipe: RecipeImport;
    }
  | {
      url: string;
      status: "error";
      recipe: DeepNullish<RecipeImport>;
      errors: { path: string; message: string }[];
    };

export async function importRecipe(url: string): Promise<ParserOutput> {
  const page = await axios.get(url);
  const dom = new JSDOM(page.data);
  const input = { document: dom.window.document, url };
  const parser = parsers.find((p) => p.canParse(input));

  if (!parser) {
    return {
      url,
      status: "skipped",
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
      status: "error",
    };
  }

  return {
    url,
    recipe: validation.data,
    status: "success",
  };
}

export type ListOutput = {
  status: "success" | "error";
  list: RecipeLead[];
};

export async function listRecipes(url: string): Promise<ListOutput> {
  const page = await axios.get(url);
  const dom = new JSDOM(page.data);
  const input = { document: dom.window.document, url };
  const parser = parsers.find((p) => p.canList(input));

  if (!parser) {
    return {
      status: "error",
      list: [],
    };
  }

  const validation = recipeLeadSchema.array().safeParse(parser.list(input));
  if (!validation.success) {
    return { status: "error", list: [] };
  }

  return {
    status: "success",
    list: validation.data,
  };
}
