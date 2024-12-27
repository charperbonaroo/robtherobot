import { appendFileSync, mkdirSync, writeFileSync } from "fs";
import OpenAI from "openai";
import { AITool } from "./AITool";
import { chain, omit } from "lodash";

export class OpenAIAssistant {
  #openai: OpenAI;
  #assistant: OpenAI.Beta.Assistants.Assistant|null = null;
  #directory: string;
  #thread: OpenAI.Beta.Threads.Thread | null = null;
  #stream: ReturnType<OpenAI.Beta.Threads.Runs["stream"]> | null = null;
  #instructions: string;
  #name: string;
  #tools: AITool[];
  #log: (...args: any[]) => void;
  #logFile: string|null = null;
  #messages: Map<string, OpenAI.Beta.Threads.Message> = new Map();
  #steps: OpenAIAssistant.Step[] = [];
  #complete: ((resolveValue: OpenAIAssistant.Step[]|null, rejectValue: Error|null) => void)|null = null;

  constructor({ instructions, name, tools, directory, log }: OpenAIAssistant.Props) {
    this.#openai = new OpenAI();
    this.#instructions = instructions;
    this.#name = name;
    this.#tools = tools;
    this.#directory = directory;
    this.#log = log;
  }

  get name() { return this.#name; }
  get instructions() { return this.#instructions; }
  get steps() { return this.#steps; }
  get tools() { return this.#tools; }

  async run(prompt: string): Promise<OpenAIAssistant.Step[]> {
    return new Promise(async (resolve, reject) => {
      this.#complete = (resolveValue, rejectValue) => {
        if (resolveValue) resolve(resolveValue);
        else reject(rejectValue ?? new Error(`Rejected without error`));
      };

      this.#thread = await this.#openai.beta.threads.create();
      this.#logFile = `logs/${formatDateAsISO(new Date())}-${this.#thread!.id}.jsonl`;

      mkdirSync("logs", { recursive: true });
      writeFileSync(this.#logFile, JSON.stringify({ directory: this.#directory }, null, 2) + "\n\n");

      await this.#openai.beta.threads.messages.create(
        this.#thread.id, { role: "user", content: prompt });

      await this.#loadAssistant();

      this.#stream = this.#openai.beta.threads.runs.stream(this.#thread!.id, {
        assistant_id: this.#assistant!.id
      });

      await this.#handleStream(this.#stream);
    })
  }

  async #handleStream(stream: ReturnType<OpenAI.Beta.Threads.Runs["stream"]>): Promise<void> {
    stream.on("event", async (event) => {
      if (event.event === "thread.message.delta" || event.event === "thread.run.step.delta")
        return;

      appendFileSync(this.#logFile!, `${JSON.stringify(event, null, 2)}\n\n`);

      const fnName = `\#ON_${event.event}`;
      if (fnName in this)
        await (this as any)[fnName](event.data, event);
    });

    stream.on("textDelta", (textDelta, snapshot) => this.#onTextDelta(textDelta, snapshot));
    stream.on("textDone", (text) => this.#onTextDone(text));
  }

  async "#ON_thread.run.requires_action"(run: OpenAI.Beta.Threads.Runs.Run) {
    const tool_outputs = [] as { output: string, tool_call_id: string }[];

    for (const call of run.required_action!.submit_tool_outputs.tool_calls) {
      if (call.type === "function") {
        const params = JSON.parse(call.function.arguments);
        const tool = this.#tools.find((tool) => tool.name === call.function.name);
        if (!tool) throw new Error(`Tool "${call.function.name}" not found?`);

        const result = await tool.run(params, this.#directory);
        tool_outputs.push({ tool_call_id: call.id, output: JSON.stringify(result) });
      }
    }

    this.#stream = this.#openai.beta.threads.runs.submitToolOutputsStream(
      this.#thread!.id, run.id, { tool_outputs });
    this.#handleStream(this.#stream);
  }

  async "#ON_thread.run.failed"(run: OpenAI.Beta.Threads.Runs.Run) {
    this.#complete!(null,
      new Error(`RUN FAILED: ${(run.last_error?.code ?? "no error")} - ${run.last_error?.message}`));
  }

  async "#ON_thread.run.step.completed"(step: OpenAI.Beta.Threads.Runs.RunStep) {
    if (step.step_details.type === "tool_calls") {
      const functionCallsStep: OpenAIAssistant.FunctionCallsStep = {
        functionCalls: step.step_details.tool_calls
          .filter((toolCall) => toolCall.type === "function")
          .map((toolCall) => ({
            name: toolCall.function.name,
            params: JSON.parse(toolCall.function.arguments),
            output: JSON.parse(toolCall.function.output!),
          }))
      };
      this.#steps.push(functionCallsStep);
    } else if (step.step_details.type === "message_creation") {
      const message = this.#messages.get(step.step_details.message_creation.message_id);
      if (!message) throw new Error("Message not found?");

      const messageCreationStep: OpenAIAssistant.MessageCreationStep = {
        role: message.role,
        content: message.content,
      };
      this.#steps.push(messageCreationStep);
    }
  }

  async "#ON_thread.run.completed"(run: OpenAI.Beta.Threads.Runs.Run) {
    this.#complete!(this.#steps, null);
  }

  async "#ON_thread.message.completed"(message: OpenAI.Beta.Threads.Message) {
    this.#messages.set(message.id, message);
  }

  async #loadAssistant(): Promise<OpenAI.Beta.Assistants.Assistant> {
    this.#assistant ??= await this.#openai.beta.assistants.create({
      name: `Rob the Robot - ${this.#name}`,
      instructions: this.#instructions,
      tools: this.#tools.map((tool) => ({
        type: "function",
        function: {
          strict: true,
          name: tool.name,
          description: tool.description,
          parameters: {
            type: "object",
            required: chain(tool.params).keys().value(),
            additionalProperties: false,
            properties: chain(tool.params).mapValues((param) => omit(param, "required", "run")).value()
          }
        }
      })),
      model: "gpt-4o"
      // model: "gpt-4o-mini"
      // model: "o1-mini"
    });
    return this.#assistant;
  }

  async #onTextDelta(
    textDelta: OpenAI.Beta.Threads.Messages.TextDelta,
    snapshot: OpenAI.Beta.Threads.Messages.Text
  ): Promise<void> {
    process.stdout.write(textDelta.value!);
  }

  async #onTextDone(text: OpenAI.Beta.Threads.Messages.Text): Promise<void> {
    process.stdout.write("\n");
  }
}

export namespace OpenAIAssistant {
  export interface Props {
    name: string;
    instructions: string;
    tools: AITool[];
    directory: string;
    log: (...args: any[]) => void;
  }

  export interface FunctionCall {
    name: string;
    params: Record<string, unknown>;
    output: object;
  }

  export interface FunctionCallsStep {
    functionCalls: FunctionCall[];
  }

  export interface MessageCreationStep {
    role: OpenAI.Beta.Threads.Message["role"];
    content: OpenAI.Beta.Threads.Message["content"];
  }

  export type Step = FunctionCallsStep | MessageCreationStep;
}

function formatDateAsISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}
