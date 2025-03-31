export namespace AsyncGeneratorPipe {
  export function create<T, TReturn, TNext>(): [
    callback: (value: CallbackValue<T, TReturn>) => void,
    generator: AsyncGenerator<T, TReturn, TNext>
  ] {
    let queue: Array<{ done: boolean; value: T | TReturn }> = [];
    let resolveQueue: Array<(value: IteratorResult<T, TReturn>) => void> = [];
    let done = false;
    let error: Error|null = null;

    const generator: AsyncGenerator<T, TReturn, TNext> = {
      [Symbol.asyncIterator]() {
        return this;
      },

      async next(): Promise<IteratorResult<T, TReturn>> {
        if (queue.length) {
          const { done, value } = queue.shift()!;
          return done ? { done: true, value: value as TReturn } : { done: false, value: value as T };
        }

        if (done) {
          if (error)
            throw error;
          return { done: true, value: undefined as unknown as TReturn };
        }

        return new Promise<IteratorResult<T, TReturn>>((resolve) => {
          resolveQueue.push(resolve);
        });
      },

      async return(value: TReturn): Promise<IteratorResult<T, TReturn>> {
        done = true;
        resolveQueue.forEach((resolve) => resolve({ done: true, value }));
        resolveQueue = [];
        return { done: true, value };
      },

      async throw(error: any): Promise<IteratorResult<T, TReturn>> {
        done = true;
        resolveQueue.forEach((resolve) => resolve({ done: true, value: undefined as unknown as TReturn }));
        resolveQueue = [];
        throw error;
      },

      async [Symbol.asyncDispose]() {
        done = true;
        resolveQueue.forEach((resolve) => resolve({ done: true, value: undefined as unknown as TReturn }));
        resolveQueue = [];
      }
    };

    const callback = (input: Value<T, TReturn>|ErrorValue) => {
      if (done) throw new Error(`Can't append value: Pipe already done`);

      if ("error" in input) {
        error = input.error;
        done = true;
        return;
      }

      if (resolveQueue.length) {
        const resolve = resolveQueue.shift()!;
        resolve(input.done ? { done: true, value: input.value as TReturn } : { done: false, value: input.value as T });
      } else {
        queue.push(input);
      }

      if (input.done) {
        done = true;
      }
    };

    return [callback, generator];
  }

  export type Callback<T, TReturn> = (value: CallbackValue<T, TReturn>) => void;
  export type CallbackValue<T, TReturn> = Value<T, TReturn>|ErrorValue;
  export type Value<T, TReturn> = NextValue<T>|ReturnValue<TReturn>;
  export type NextValue<T> = { done: false, value: T };
  export type ReturnValue<TReturn> = { done: true, value: TReturn };
  export type ErrorValue = { error: Error };
}
