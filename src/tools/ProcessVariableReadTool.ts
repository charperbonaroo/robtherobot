import { Reference } from "@/Reference";
import { AITool } from "../AITool";
import { Process } from "../workflow/Process";

export class ProcessVariableReadTool implements AITool {
  #process: Reference<Process|null>;

  constructor(process: Reference<Process|null>) {
    this.#process = process;
  }

  name: string = "read-variable";
  description: string = "Reads a process variable";
  params: AITool.Params = {
    name: {
      type: "string",
      description: "Name of variable",
    },
  };

  async run(params: Record<string, unknown>): Promise<{ value: unknown }> {
    const { name } = params as { name: string };
    const value = this.#process.value!.variables.get(name);
    console.log(`READ ${name}:`, value);
    return { value };
  }
}
