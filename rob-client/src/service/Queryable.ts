export interface Queryable {
  query<T>(payload: unknown[]): Promise<T>;
}
