import { Monad } from "../util/Monad";
import { useAsync } from "./useAsync";

export function usePromise<T>(
  promise: Promise<T>,
  deps?: React.DependencyList
): Monad<T> {
  return useAsync(() => promise, deps);
}
