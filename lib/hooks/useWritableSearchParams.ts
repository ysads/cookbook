import { useSearchParams } from "next/navigation";

export function useWritableSearchParams() {
  const searchParams = useSearchParams();

  function getUpdatedQueryString<T extends string | number | boolean>(
    args: Record<string, T | T[]>,
    overrideExisting = false
  ) {
    const newParams = new URLSearchParams(
      overrideExisting ? "" : searchParams.toString()
    );
    Object.entries(args).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => newParams.append(key, v.toString()));
      } else {
        newParams.set(key, value.toString());
      }
    });
    return newParams.toString();
  }

  return { searchParams, getUpdatedQueryString };
}
