export class Lazy<T> {
  #fn: () => Promise<T>;
  #promise: Promise<T>|null = null;
  #value: T|null = null;
  #done = false;

  constructor(fn: () => Promise<T>) {
    this.#fn = fn;
  }

  async get(): Promise<T> {
    if (this.#done)
      return this.#value!;
    if (!this.#promise) {
      this.#promise = this.#fn.call(null);
      this.#value = await this.#promise;
      this.#done = true;
    }
    await this.#promise;
    return this.#value!;
  }
}
