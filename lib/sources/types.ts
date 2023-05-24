import { Ingredient, Recipe } from "@prisma/client";
import { Unpersisted } from "../types";

const SOURCES = ["fodmap-formula", "fodmap-everyday"] as const;

export type Source = (typeof SOURCES)[number];

export type BaseIngredient = Unpersisted<Ingredient | "recipeId">;

export type BaseRecipe = Unpersisted<Recipe> & {
  source: Source;
  ingredients?: BaseIngredient[];
};

export type ParserInput = {
  document: Document;
  url: string;
};

export type Parser = {
  canParse: (input: ParserInput) => boolean;
  parse: (input: ParserInput) => BaseRecipe;
};
