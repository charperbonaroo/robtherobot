import { inspect } from "util";
import { Activity } from "./Activity";
import { Config } from "./Config";
import { VariablesMap } from "./VariablesMap";
import { last } from "lodash";
import { OpenAIAssistant } from "../OpenAIAssistant";

export class Process {
  #config: Config;
  #activities: Activity[] = [];
  #variables: VariablesMap;
  #assistant: OpenAIAssistant;

  constructor(assistant: OpenAIAssistant, config: Config, variables?: Record<string, unknown>) {
    this.#assistant = assistant;
    this.#config = config;

    this.#variables = new VariablesMap(this.#config.variables);
    if (variables)
      this.#variables.assign(variables);
  }

  get variables() {
    return this.#variables;
  }

  async run() {
    if (!this.#activity)
      this.#assignNextActivity();

    while(true) {
      const result = await this.#activity!.run();
      if (!result.nextStep) return;

      this.#activity = new Activity(this.#assistant, this.#config.steps[result.nextStep]);
    }
  }

  #assignNextActivity() {
    this.#activity = new Activity(this.#assistant, this.#entrypointStep);
  }

  get #activity(): Activity|null {
    return last(this.#activities) ?? null;
  }

  set #activity(activity: Activity) {
    if (last(this.#activities) === activity)
      return;
    this.#activities.push(activity);
  }

  get #entrypointStep(): Config.Step {
    const step = this.#config.steps[this.#config.entrypoint];
    if (!step) throw new Error(`Entrypoint ${inspect(this.#config.entrypoint)} not found in config`);
    return step;
  }
}
