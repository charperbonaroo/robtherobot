export interface Queryable {
  query<T, TReturn>(payload: unknown[]): AsyncGenerator<T, TReturn, void>;
}
