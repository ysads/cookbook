import { Course, IngredientSet, InstructionSet, Recipe } from "@prisma/client";
import { DeepNullish, Unpersisted } from "../types";
import { z } from "zod";

export const SOURCES = ["fodmap-formula", "fodmap-everyday"] as const;

export type Source = (typeof SOURCES)[number];

export type RecipeImport = Unpersisted<Recipe> & {
  source: Source;
  ingredientSets: Unpersisted<IngredientSet, "recipeId">[];
  instructionSets: Unpersisted<InstructionSet, "recipeId">[];
};

export const recipeImportSchema = z.object({
  title: z.string().nonempty(),
  time: z.string().nonempty(),
  servings: z.coerce.number().min(1),
  ingredientSets: z
    .object({ name: z.string(), ingreds: z.string().array().min(1) })
    .array()
    .min(1),
  instructionSets: z
    .object({ name: z.string(), instructions: z.string().array().min(1) })
    .array()
    .min(1),
  imageUrl: z.string().url(),
  notes: z.string().array(),
  postedAt: z.date().nullable(),
  keywords: z.string().array(),
  courses: z.nativeEnum(Course).array().min(1),
  sourceUrl: z.string().url(),
  source: z.enum(SOURCES),
});

export type RecipeLead = {
  imageUrl: string;
  title: string;
  url: string;
};

export const recipeLeadSchema = z.object({
  imageUrl: z.string().url(),
  title: z.string().nonempty(),
  url: z.string().url(),
});

export type SourceInput = {
  document: Document;
  url: string;
};

export type Parser = {
  name: string;
  canParse: (input: SourceInput) => boolean;
  canList: (input: SourceInput) => boolean;
  list: (input: SourceInput) => DeepNullish<RecipeLead[]>;
  parse: (input: SourceInput) => DeepNullish<RecipeImport>;
};
