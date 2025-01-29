import { AITool } from "../AITool";
import readline from "node:readline/promises";

export class PromptTool implements AITool {
  name: string = "prompt";
  description: string = "Prompts the user to enter some input.";
  params: AITool.Params = {
    question: {
      type: "string",
      description: "The question visible to the user. Keep it short!",
    },
  };

  async run(params: Record<string, unknown>): Promise<{ answer: string }> {
    const { question } = params as { question: string };

    const rl = readline.createInterface(process.stdin, process.stdout);
    const answer = await rl.question(question + " ");
    return { answer };
  }
}
