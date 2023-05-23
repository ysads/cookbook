import { Ingredient, Recipe } from "@prisma/client";
import { Unpersisted } from "../types";

const SOURCES = ["fodmap-formula"] as const;

export type Sources = (typeof SOURCES)[number];

export type BaseIngredient = Unpersisted<Ingredient | "recipeId">;

export type BaseRecipe = Unpersisted<Recipe> & {
  source: Sources;
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
