import { Course } from "@prisma/client";
import { z } from "zod";

export const SOURCES = [
  "fodmap-formula",
  "fodmap-everyday",
  "karlijns",
] as const;

export const ingredientSetSchema = z.object({
  name: z.string(),
  ingreds: z.string().array().min(1),
});

export const instructionSetSchema = z.object({
  name: z.string(),
  instructions: z.string().array().min(1),
});

export const recipeSchema = z.object({
  title: z.string().nonempty(),
  time: z.string().nonempty(),
  servings: z.coerce.number().min(1),
  imageUrl: z.string().url(),
  notes: z.string().array(),
  postedAt: z.string().datetime().nullable(),
  keywords: z.string().array(),
  courses: z.nativeEnum(Course).array().min(1),
  sourceUrl: z.string().url(),
  source: z.enum(SOURCES),
});

export function persisted<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.extend({
    id: z.number(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  });
}
