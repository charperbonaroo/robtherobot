import { readdir } from "node:fs/promises";
import { RobWeb } from "rob-web";
import { join, resolve } from "node:path";
import { isNotJunk } from "./util/junk";
import { OpenAIAssistant, OpenAIAssistantManager } from "rob-host";

export class RobServer implements RobWeb.Async {
  private _cwd: string;
  private assistant: OpenAIAssistant;

  constructor(cwd: string) {
    this._cwd = OpenAIAssistantManager.ensureWorkingDirectory(cwd);
    this.assistant = new OpenAIAssistant("gpt-4o", this._cwd);
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
