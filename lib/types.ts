export type Unpersisted<T, E extends keyof T = never> = Omit<
  T,
  E | "id" | "createdAt" | "updatedAt"
>;
