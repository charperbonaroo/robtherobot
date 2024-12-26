import chalk from "chalk";
import { execSync } from "child_process";
import { appendFileSync, mkdirSync, realpathSync, writeFileSync } from "fs";
import { add } from "lodash";
import OpenAI from "openai";
import { resolve } from "path";
import { inspect } from "util";

const instructions = `
You're a senior developer at a software company. You will be given an arbitrary
task and you're expected to complete it.

Your most common problems are related to software development. Be sure to test
your changes, read the README, and check for any compile or syntax errors.

You should focus on solving the problem by using the tools provided to you. You
have access to a shell.

Be careful installing stuff. Be sure to verify the user has existing tools
available. Specifically, if the user needs a specific version of a tool, be sure
to see if there's a known tool manager available (like nvm, asdf, rvm, etc)

Be sure to continue until the user's problem is solved. Don't ask for
confirmation, the session is NOT interactive. Just do your job and be sure to
complete it.
`;

export class OpenAIAssistant {
  #openai: OpenAI;
  #assistant: OpenAI.Beta.Assistants.Assistant|null = null;
  #directory: string;
  #thread: OpenAI.Beta.Threads.Thread | null = null;
  #stream: ReturnType<OpenAI.Beta.Threads.Runs["stream"]> | null = null;

  constructor() {
    this.#openai = new OpenAI();

    const directory = resolve(`../robtherobot-tmp/tmp-${Math.random().toString(36).substring(7)}`);
    mkdirSync(directory, { recursive: true });
    this.#directory = realpathSync(directory);
    console.log("WORKING DIR", this.#directory);

    mkdirSync("logs", { recursive: true });
  }

  async run(prompt: string): Promise<void> {
    this.#thread = await this.#openai.beta.threads.create();

    writeFileSync(
      `logs/${this.#thread!.id}.jsonl`,
      JSON.stringify({ directory: this.#directory }) + "\n");

    await this.#openai.beta.threads.messages.create(
      this.#thread.id, { role: "user", content: prompt });

      await this.#loadAssistant();

    this.#stream = this.#openai.beta.threads.runs.stream(this.#thread!.id, {
      assistant_id: this.#assistant!.id
    });

    await this.#handleStream(this.#stream);
  }

  async #handleStream(stream: ReturnType<OpenAI.Beta.Threads.Runs["stream"]>): Promise<void> {
    stream.on("event", async (event) => {
      if (event.event !== "thread.message.delta" && event.event !== "thread.run.step.delta")
        appendFileSync(`logs/${this.#thread!.id}.jsonl`, `${JSON.stringify(event)}\n`);

      if (event.event === "thread.run.requires_action") {
        const tool_outputs = [] as { output: string, tool_call_id: string }[];

        for (const call of event.data.required_action!.submit_tool_outputs.tool_calls) {
          if (call.type === "function" && call.function.name === "shell") {
            const { command, cwd } = JSON.parse(call.function.arguments);
            const result = await this.#handleShellFunction(command, cwd);
            const output = { tool_call_id: call.id, output: JSON.stringify(result) };
            tool_outputs.push(output);
          }
        }

        this.#stream = this.#openai.beta.threads.runs.submitToolOutputsStream(
          this.#thread!.id, event.data.id, { tool_outputs });
        this.#handleStream(this.#stream);
      }
    });

    stream.on("textCreated", (text) => this.#onTextCreated(text));
    stream.on("textDelta", (textDelta, snapshot) => this.#onTextDelta(textDelta, snapshot));
    stream.on("toolCallCreated", (toolCall) => this.#onToolCallCreated(toolCall));

    stream.on("end", async () => {
      if (stream !== this.#stream) return;

      // this.#stream = this.#openai.beta.threads.runs.stream(this.#thread!.id, {
      //   assistant_id: this.#assistant!.id
      // });

      // await this.#handleStream(this.#stream);

      console.log(chalk.blue(
        `\n\nAssistant ended session. Working directory was:\n` + this.#directory
        ));

      for (const assistant of (await this.#openai.beta.assistants.list()).data) {
        if (assistant.name!.startsWith("Rob the Robot"))
          await this.#openai.beta.assistants.del(assistant!.id);
      }
    });
  }

  async #loadAssistant(): Promise<OpenAI.Beta.Assistants.Assistant> {
    this.#assistant ??= await this.#openai.beta.assistants.create({
      name: `Rob the Robot - ${new Date().toISOString()}`,
      instructions,
      tools: [{
        type: "function",
        function: {
          strict: true,
          name: "shell",
          description: `
            Execute a shell command inside a temporary folder.
            You should not escape that folder, but you can use it as a working
            directory.
          `,
          parameters: {
            type: "object",
            required: ["command", "cwd"],
            additionalProperties: false,
            properties: {
              command: {
                type: "string",
                description: "The shell command to execute."
              },
              cwd: {
                type: "string",
                description: "The working directory, relative to your root directory"
              }
            }
          }
        }
      }],
      model: "gpt-4o"
    });
    return this.#assistant;
  }

  async #onTextCreated(text: OpenAI.Beta.Threads.Messages.Text): Promise<void> {
  }

  async #onTextDelta(
    textDelta: OpenAI.Beta.Threads.Messages.TextDelta,
    snapshot: OpenAI.Beta.Threads.Messages.Text
  ): Promise<void> {
    process.stdout.write(textDelta.value!);
  }

  async #onToolCallCreated(toolCall: OpenAI.Beta.Threads.Runs.Steps.ToolCall): Promise<void> {
  }

  async #handleShellFunction(command: string, cwd: string) {
    const resolvedCwd = resolve(this.#directory, cwd);
    mkdirSync(resolvedCwd, { recursive: true });
    const realpathCwd = realpathSync(resolvedCwd);
    if (!realpathCwd.startsWith(this.#directory))
      throw new Error(`Resolved CWD ${inspect(realpathCwd)} not inside working directory ${inspect(this.#directory)}`);

    try {
      console.log(chalk.red(`$ ${command}`));
      const stdout = execSync(command, { cwd: realpathCwd, stdio: ["pipe"], encoding: "utf-8" });
      console.log(chalk.grey(`${stdout}`));
      return { command, cwd, code: 0, stdout, stderr: null };
    } catch (error: any) {
      console.log(chalk.red(`${error.message}`));
      console.log(chalk.red(`${error.stdout}`));
      return { command, cwd, code: error.code, stdout: error.stdout, stderr: error.stderr };
    }
  }
}
