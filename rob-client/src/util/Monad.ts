export interface Monad<T> {
  loading: boolean;
  value: T|null;
  error: Error|null;
}

type GlobalError = Error;

export namespace Monad {
  export interface Success<T> extends Monad<T> {
    value: T;
    error: null;
    loading: false;
  }

  export interface Error extends Monad<never> {
    value: null;
    error: GlobalError;
    loading: false;
  }

  export interface Loading extends Monad<never> {
    loading: true;
    error: null;
    value: null;
  }

  export const LOADING: Monad<never> =
    Object.freeze({ value: null, error: null, loading: true });

  export function ofValue<T>(value: T): Success<T> {
    return { value, error: null, loading: false };
  }

  export function ofError(error: GlobalError): Error {
    return { value: null, error, loading: false };
  }

  export function isSuccess<T>(result: Monad<T>): result is Success<T> {
    return result.loading === false && result.error === null;
  }

  export function isError(result: Monad<any>): result is Error {
    return result.loading === false && result.error !== null;
  }

  export function isLoading(result: Monad<any>): result is Loading {
    return result.loading === true;
  }
}
