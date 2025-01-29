export class Reference<T> {
  constructor(public value: T) {
  }

  wrap(value: T): T {
    this.value = value;
    return this.value;
  }
}
