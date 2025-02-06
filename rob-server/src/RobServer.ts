import { readdir } from "node:fs/promises";
import { RobWeb } from "rob-web";
import { join, resolve } from "node:path";
import { isNotJunk } from "./util/junk";
import { OpenAIAssistant, OpenAIAssistantManager, FileTools } from "rob-host";

export class RobServer implements RobWeb {
  private _cwd: string;
  private assistant: OpenAIAssistant;

  constructor(cwd: string) {
    this._cwd = OpenAIAssistantManager.ensureWorkingDirectory(cwd);
    this.assistant = new OpenAIAssistant("gpt-4o", this._cwd);

    this.assistant.addSystemMessage(`
      You're an assistant, ready to assist a developer. Before doing anything,
      be sure to read and navigate the repo to get an idea what kind of project
      you're in. Use ls to find potentially relevant files, and be sure to read
      documentation.

      If you modify a file, always re-read the file after changing to make sure
      you didn't make any mistakes. Always double-check everything you do. Be
      sure to complete whatever task given to you before responding.
    `);

    this.assistant.addTools(
      new FileTools.LoggingReader(),
      new FileTools.LoggingWriter(),
      new FileTools.LoggingShellTool(),
    )
  }

  async *cwd() {
    return this._cwd;
  }

  async *ls(path: string[]) {
    const files = await readdir(this.safeJoin(path), { encoding: "utf-8" });
    return files.filter((path) => isNotJunk(path) && !path.startsWith("."));
  }

  async *send(prompt: string): AsyncGenerator<RobWeb.Response, true, void> {
    const stream = this.assistant.runMessageStream({
      role: "user", content: [{ type: "text", text: prompt }]
    });
    for await (const message of stream)
      yield this.convertOpenaiMessage(message);

    return true;
  }

  async *lastResponses(limit: number): AsyncGenerator<void, RobWeb.Response[], void> {
    return this.assistant.getOpenaiMessages()
      .slice(-limit)
      .map((message) => this.convertOpenaiMessage(message));
  }

  private convertOpenaiMessage(message: OpenAIAssistant.Message): RobWeb.Response {
    if (message.role === "tool") {
      // ... ToolResultResponse
      console.warn(message);
      throw new Error("FOO");
    }

    let content: string|null = null;
    if (typeof message.content === "undefined" || message.content === null)
      content = null;
    else if (typeof message.content === "string")
      content = message.content;
    else if (message.content.length === 1 && message.content[0].type === "text")
      content = message.content[0].text;
    else {
      console.warn(`Don't know how to handle: `, message.content);
      content = JSON.stringify(message.content);
    }

    const toolCalls: RobWeb.ToolCall[] = [];
    if (message.role === "assistant" && message.tool_calls) {
      for (const tool_call of message.tool_calls) {
        if (tool_call.type !== "function") {
          console.warn(`Don't know how to handle tool_call: `, tool_call);
          continue;
        }
        toolCalls.push({
          id: tool_call.id,
          name: tool_call.function.name,
          params: JSON.parse(tool_call.function.arguments),
        })
      }
    }

    return { type: "message", message: { role: message.role, content, toolCalls } };
  }

  private safeJoin(path: string[]): string {
    const resolved = resolve(join(this._cwd, ...path));
    if (!resolved.startsWith(this._cwd))
      throw new Error(`Path "${join(...path)}" resolves to "${resolved}", which is not a subdirectory of "${this._cwd}"`);
    return resolved;
  }
}
