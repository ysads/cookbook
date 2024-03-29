import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function last<T>(arr: T[]) {
  return arr[arr.length - 1];
}

export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  for (const key in source) {
    // @ts-expect-error FIXME: what's wrong?
    if (source[key] instanceof Object) {
      // @ts-expect-error FIXME: what's wrong?
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }

  Object.assign(target || {}, source);
  return target;
}
