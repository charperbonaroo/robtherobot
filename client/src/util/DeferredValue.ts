export class DeferredValue<T> {
  private ready = false;
  private value: T|null = null;
  private promise: Promise<T>|null = null;
  private resolve: ((val: T) => void)|null = null;

  getAsync() {
    if (this.ready)
      return Promise.resolve(this.value!);
    if (!this.promise)
      this.promise = new Promise<T>((resolve) => { this.resolve = resolve; });
    return this.promise;
  }

  get(): T {
    if (!this.ready)
      throw new Error(`DeferredValue not ready yet`);
    return this.value!;
  }

  set(value: T) {
    this.ready = true;
    this.value = value;
    if (this.resolve)
      this.resolve(value);
  }
}
