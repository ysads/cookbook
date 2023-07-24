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

// INFO: necessary because TS compares the parts of `Date | null` separately, which
// makes it fail to realise it extends `Date`.
type DateToString<T> = T extends Date ? string : T;
export type StringifiedDates<T> = {
  [K in keyof T]: DateToString<T[K]>;
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

export const IMPORT_STATUS = ["partial", "success", "error"] as const;
export type ImportStatus = (typeof IMPORT_STATUS)[number];
