export type Unpersisted<T, E extends keyof T = never> = Omit<
  T,
  E | "id" | "createdAt" | "updatedAt"
>;

export type DeepNullish<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepNullish<T[P]>
    : T[P] | null | undefined;
};
