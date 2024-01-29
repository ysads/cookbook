import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useSearchParams } from "next/navigation";

export function useWritableSearchParams<T extends Record<string, any>>(
  router: AppRouterInstance
) {
  const searchParams = useSearchParams();

  function getUpdatedQueryString(args: Partial<T>, overrideExisting = false) {
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

  function setSearchParams(args: Partial<T>, overrideExisting = false) {
    router.push(
      `${window.location.pathname}?${getUpdatedQueryString(
        args,
        overrideExisting
      )}`
    );
  }

  return { searchParams, getUpdatedQueryString, setSearchParams };
}
