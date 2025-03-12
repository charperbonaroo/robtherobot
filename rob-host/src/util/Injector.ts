export class Injector {
  private values: Map<any, () =>any> = new Map();

  public set(value: object) {
    this.values.set(value.constructor, () => value);
  }

  public get<T>(constructor: new (...args: any[]) => T): T {
    const value = this.values.get(constructor);
    if (!value)
      throw new Error(`No value set for ${constructor.name}`);
    return value();
  }
}
