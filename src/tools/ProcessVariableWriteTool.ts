import { Reference } from "@/Reference";
import { AITool } from "../AITool";
import { Process } from "../workflow/Process";

export class ProcessVariableWriteTool implements AITool {
  #process: Reference<Process|null>;

  constructor(process: Reference<Process|null>) {
    this.#process = process;
  }

  name: string = "write-variable";
  description: string = "Writes a process variable. Returns the written value.";
  params: AITool.Params = {
    name: {
      type: "string",
      description: "Name of variable",
    },
    value: {
      type: "string",
      description: "Value of variable"
    }
  };

  async run(params: Record<string, unknown>): Promise<{ value: unknown }> {
    const { name, value } = params as { name: string, value: unknown };
    this.#process.value!.variables.set(name, value);
    console.log(`WRITE ${name} TO`, value);
    return { value: this.#process.value!.variables.get(name) };
  }
}
