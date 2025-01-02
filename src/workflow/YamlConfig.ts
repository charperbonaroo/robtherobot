import { get, mapValues } from 'lodash';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml'
import { Config } from './Config';

/**
 * Creates a read-only config based on a YAML file. Use `readAsync` to read the
 * YAML file in a promise. Otherwise, `readSync` is automatically used to read
 * the config file when the config is accessed.
 */
export class YamlConfig implements Config {
  #path: string;
  #data: any;

  constructor(configFilePath: string) {
    this.#path = configFilePath;
  }

  async readAsync(): Promise<this> {
    this.#data = parse(await readFile(this.#path, { encoding: "utf-8" }));
    return this;
  }

  readSync(): this {
    this.#data = parse(readFileSync(this.#path, { encoding: "utf-8" }));
    return this;
  }

  /**
   * Get a mutable copy of this config as a plain object
   * @returns
   */
  get(): Config {
    return Config.of(this);
  }

  get name(): string {
    return this.#require("name");
  }

  get entrypoint(): string {
    return this.#require("entrypoint");
  }

  get variables(): Record<string, Config.Variable> {
    this.#requireData();
    return mapValues(
      get(this.#data, "variables", {}) as Record<string, YamlConfig.RawVariable>,
      (value, key) => {
        if (typeof value === "string")
          value = { description: value };
        if (!value.type)
          value.type = "string";
        value.name = key;
        return Object.freeze(value) as Config.Variable;
      },
    );
  }

  get steps(): Record<string, Config.Step> {
    this.#requireData();
    return mapValues(
      get(this.#data, "steps", {}) as Record<string, YamlConfig.RawStep>,
      (value, key) => {
        if (typeof value === "string")
          value = { instruction: value };
        if (!value.type)
          value.type = "llm-gpt4o";
        value.name = key;
        if (typeof value.next === "string")
          value.next = [value.next];
        if (!value.next)
          value.next = [];
        Object.freeze(value.next);
        return Object.freeze(value) as Config.Step;
      },
    );
  }

  #require(path: string|string[]) {
    this.#requireData();
    return get(this.#data, path, () => {
      throw new Error("Missing property " + (typeof path === "string" ? path : path.join(".")))
    });
  }

  #requireData() {
    if (!this.#data) this.readSync();
  }
}

export namespace YamlConfig {
  export type RawVariable = string|Partial<Config.Variable>;

  export type RawStep = string|Partial<RawStepData>;

  export interface RawStepData extends Omit<Config.Step, "next"> {
    next: string|string[];
  }
}
