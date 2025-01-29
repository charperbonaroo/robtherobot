export interface MonadResult<T> {
  loading: boolean;
  value: T|null;
  error: Error|null;
}

export namespace MonadResult {
  export function isSuccess<T>(result: MonadResult<T>): result is { value: T, error: null, loading: false } {
    return result.loading === false && result.error === null;
  }

  export function isError(result: MonadResult<any>): result is { value: null, error: Error, loading: false } {
    return result.loading === false && result.error !== null;
  }

  export function isLoading(result: MonadResult<any>): result is { value: null, error: null, loading: true } {
    return result.loading === true;
  }
}
