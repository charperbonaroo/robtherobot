import { AITool } from "../AITool";
import { OpenAIAssistantStream } from "../OpenAIAssistantStream";
import * as chalk from "chalk";
import { inspect } from "util";

export class AssistantTool implements AITool {
  params: AITool.Params = Object.freeze({
    prompt: {
      type: "string",
      description: "A prompt for your assistant"
    },
  })

  #name: string;
  #assistant: OpenAIAssistantStream;

  constructor(name: string, assistant: OpenAIAssistantStream) {
    this.#name = name;
    this.#assistant = assistant;
  }

  get name() {
    return this.#name;
  }

  get description() {
    return `
      ## ${this.#assistant.name}

      Another AI-backed assistant. You can give this assistant a prompt. Once
      assistant completes its job, you get access to its output.
    `;
  }

  async run(params: Record<string, unknown>) {
    const { prompt } = params as { prompt: string };

    console.log(chalk.red(`$ ${prompt}`));
    const output = await this.#assistant.run(prompt);
    console.log(chalk.gray(inspect(output, false, null, true)));
    return output;
  }
}
