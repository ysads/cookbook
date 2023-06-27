import { Course } from "@prisma/client";

export type Unpersisted<T, E extends keyof T = never> = Omit<
  T,
  E | "id" | "createdAt" | "updatedAt"
>;

export type DeepNullish<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepNullish<T[P]>
    : T[P] | null | undefined;
};

export const COURSES = [
  Course.BREAKFAST,
  Course.DESSERT,
  Course.DRINK,
  Course.MAIN,
  Course.SALAD,
  Course.SIDE,
  Course.SNACK,
  Course.SOUP,
  Course.OTHER,
] as const;
