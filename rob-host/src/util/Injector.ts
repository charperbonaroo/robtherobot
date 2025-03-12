export class Injector {
  private values: Map<any, () => any> = new Map();

  constructor(private parent?: object) {
    if (parent)
      this.set(parent);
  }

  public set(value: object) {
    this.values.set(value.constructor, () => value);
  }

  public get<T>(constructor: new (...args: any[]) => T): T {
    const value = this.values.get(constructor);
    if (!value)
      throw new Error(`No value set for ${constructor.name} in ${this.parent?.constructor.name}'s injector`);
    return value();
  }
}
