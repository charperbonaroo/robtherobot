import { inspect } from "util";
import { Config } from "./Config";

export class VariablesMap {
  #config: Record<string, Config.Variable>;
  #values: Map<string, unknown> = new Map();

  constructor(config: Record<string, Config.Variable>) {
    this.#config = config;
  }

  get(key: string): unknown {
    return this.#values.get(key);
  }

  set(key: string, value: unknown) {
    if (!this.#config[key])
      throw new Error(`Cannot set value for ${inspect(key)}: Key does not exist`);
    const [ok, newValue] = this.validate(key, value);
    if (!ok)
      throw new Error(`Invalid value for variable ${inspect(key)}: ${inspect(value)}`);
    this.#values.set(key, newValue);
  }

  validate(key: string, value: unknown): [boolean, unknown] {
    const variable = this.#config[key];
    if (!variable)
      return [false, value];

    if (variable.type === "string") {
      if (value === null || typeof value === "undefined")
        return [true, ""];
      return [true, `${value}`];
    }

    return [false, value];
  }

  assign(variables: Record<string, unknown>) {
    for (const key in variables)
      if (Object.hasOwn(variables, key))
        this.set(key, variables[key]);
  }
}
