import { OpenAIAssistant } from "../OpenAIAssistant";
import { Config } from "./Config";

export class Activity {
  #step: Config.Step;
  #state: Activity.State = "new";
  #nextStep: string|null = null;
  #assistant: OpenAIAssistant;

  constructor(assistant: OpenAIAssistant, step: Config.Step) {
    this.#step = step;
    this.#assistant = assistant;
  }

  async run(): Promise<this> {
    if (this.#state !== "new")
      return this;

    this.#state = "starting";

    const output = await this.#assistant.run(this.#step.instruction);
    console.log(this.#step, output);

    this.#nextStep = this.#step.next[0];
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
