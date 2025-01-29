import { useEffect, useState } from "react";
import { MonadResult } from "../util/MonadResult";

export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList = []) {
  const [result, setResult] = useState<MonadResult<T>>({ loading: true, value: null, error: null });

  useEffect(() => {
    (async () => {
      try {
        const value = await fn();
        setResult({ loading: false, error: null, value });
      } catch (error) {
        setResult({ loading: false, error, value: null });
      }
    })();
  }, deps);

  return result;
}
