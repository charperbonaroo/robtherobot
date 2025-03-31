import { Monad } from "./Monad";

export class DeferredValue<T> implements Monad<T> {
  private ready = false;
  private _value: T|null = null;
  private _error: Error|null = null;
  private promise: Promise<T>|null = null;
  private resolve: ((val: T) => void)|null = null;
  private reject: ((error: Error) => void)|null = null;

  public get loading() {
    return !this.ready;
  }

  public get value() {
    return this._value;
  }

  public get error() {
    return this._error;
  }

  getAsync(): Promise<T> {
    if (this.ready)
      if (this._error)
        return Promise.reject(this._error);
      else
        return Promise.resolve(this._value!);

    if (!this.promise)
      this.promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });

    return this.promise;
  }

  get(): T {
    if (!this.ready)
      throw new Error(`DeferredValue not ready yet`);
    return this.value!;
  }

  setError(error: Error) {
    if (this.ready)
      throw new Error(`Failed to setError: DeferredValue did complete`);

    this.ready = true;
    this._value = null;
    this._error = error;

    if (this.reject)
      this.reject(error);
  }

  setValue(value: T) {
    if (this.ready)
      throw new Error(`Failed to setValue: DeferredValue did complete`);

    this.ready = true;
    this._value = value;
    this._error = null;

    if (this.resolve)
      this.resolve(value);
  }
}
