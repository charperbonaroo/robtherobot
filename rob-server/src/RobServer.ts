import { readdir } from "node:fs/promises";
import { RobWeb } from "rob-web";
import { join, resolve } from "node:path";
import { isNotJunk } from "./util/junk";
import { OpenAIAssistant, OpenAIAssistantManager, FileTools } from "rob-host";

export class RobServer implements RobWeb.Async {
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

  cwd() {
    return Promise.resolve(this._cwd);
  }

  async ls(path: string[]) {
    const files = await readdir(this.safeJoin(path), { encoding: "utf-8" });
    return files.filter((path) => isNotJunk(path) && !path.startsWith("."));
  }

  send(prompt: string): Promise<RobWeb.Message> {
    return this.assistant.send(prompt);
  }

  private safeJoin(path: string[]): string {
    const resolved = resolve(join(this._cwd, ...path));
    if (!resolved.startsWith(this._cwd))
      throw new Error(`Path "${join(...path)}" resolves to "${resolved}", which is not a subdirectory of "${this._cwd}"`);
    return resolved;
  }
}
