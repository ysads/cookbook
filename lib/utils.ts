import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K | K[]
): Omit<T, K> {
  const keysToRemove = Array.isArray(keys) ? keys : [keys];
  return Object.entries(obj).reduce((acc, [k, v]) => {
    return keysToRemove.includes(k) ? acc : { ...acc, [k]: v };
  }, {});
}
