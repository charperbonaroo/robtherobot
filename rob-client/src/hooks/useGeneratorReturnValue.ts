import { Monad } from "../util/Monad";
import { useAsync } from "./useAsync";

export function useGeneratorReturnValue<T, TReturn, TNext>(
  stream: AsyncGenerator<T, TReturn, TNext>,
  deps?: React.DependencyList
): Monad<TReturn> {
  return useAsync(async () => {
    let result: IteratorResult<T, TReturn>;
    while (result = await stream.next())
      if (result.done)
        return result.value;

    throw new Error(`Unexpected no return value`);
  }, deps);
}
