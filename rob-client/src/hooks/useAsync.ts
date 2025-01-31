import { useEffect, useState } from "react";
import { Monad } from "../util/Monad";

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [result, setResult] = useState<Monad<T>>(Monad.LOADING);

  useEffect(() => {
    (async () => {
      try {
        setResult(Monad.ofValue(await fn()));
      } catch (error) {
        setResult(Monad.ofError(error as Error));
      }
    })();
  }, deps);

  return result;
}
