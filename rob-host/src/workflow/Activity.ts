import { inspect } from "util";
import { OpenAIAssistantStream } from "../OpenAIAssistantStream";
import { Config } from "./Config";
import { VariablesMap } from "./VariablesMap";

export class Activity {
  #step: Config.Step;
  #state: Activity.State = "new";
  #nextStep: string|null = null;
  #assistant: OpenAIAssistantStream;
  #variables: VariablesMap;

  constructor(assistant: OpenAIAssistantStream, variables: VariablesMap, step: Config.Step) {
    this.#step = step;
    this.#assistant = assistant;
    this.#variables = variables;
  }

  async run(): Promise<this> {
    if (this.#state !== "new")
      return this;

    this.#state = "starting";

    this.#nextStep = this.#step.next[0];
    this.#variables.set("next_step", this.#nextStep);

    const prompt = [
      `You're currently at step ${this.#step.name}, which has the following instruction:`,
      this.#step.instruction,
      `Variables currently are:`,
      inspect(this.#variables.toObject())
    ];

    const output = await this.#assistant.run(prompt.join("\n\n"));
    console.log(output);

    this.#nextStep = this.#variables.get("next_step") as string;
    this.#state = "success";
    return this;
  }

  get nextStep() {
    if (this.#state !== "success")
      throw new Error(`nextStep can only be called on success`);

    return this.#nextStep;
  }
}

export namespace Activity {
  export type State = "new"|"starting"|"running"|"success"|"failed";
}
