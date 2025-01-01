import { get, mapValues } from 'lodash';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml'
import { Config } from './Config';

export class YamlConfig {
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

  get(): Config {
    return {
      name: this.name,
      entrypoint: this.entrypoint,
      variables: this.variables,
      steps: this.steps,
    };
  }

  get name(): string {
    return this.#require("name");
  }

  get entrypoint(): string {
    return this.#require("entrypoint");
  }

  get variables(): Record<string, Config.Variable> {
    return mapValues(
      get(this.#data, "variables", {}) as Record<string, YamlConfig.RawVariable>,
      (value, key) => {
        if (typeof value === "string")
          value = { description: value };
        if (!value.type)
          value.type = "string";
        value.name = key;
        return value as Config.Variable;
      },
    );
  }

  get steps(): Record<string, Config.Step> {
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
        return value as Config.Step;
      },
    );
  }

  #require(path: string|string[]) {
    return get(this.#data, path, () => {
      throw new Error("Missing property " + (typeof path === "string" ? path : path.join(".")))
    });
  }
}

export namespace YamlConfig {
  export type RawVariable = string|Partial<Config.Variable>;

  export type RawStep = string|Partial<RawStepData>;

  export interface RawStepData extends Omit<Config.Step, "next"> {
    next: string|string[];
  }
}
