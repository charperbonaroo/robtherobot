import { AITool } from "@/AITool";
import chalk from "chalk";
import { exec } from "node:child_process";
import { mkdirSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { inspect } from "node:util";

export class ShellTool implements AITool {
  name = ShellTool.name;
  description = ShellTool.description;
  params = ShellTool.params;

  async run(params: Record<string, unknown>, directory: string) {
    const { command, cwd, timeout } = params as { command: string, cwd: string, timeout: number };

    const resolvedCwd = resolve(directory, cwd);
    mkdirSync(resolvedCwd, { recursive: true });
    const realpathCwd = realpathSync(resolvedCwd);
    if (!realpathCwd.startsWith(directory))
      throw new Error(`Resolved CWD ${inspect(realpathCwd)} not inside working directory ${inspect(directory)}`);

    return this.exec(command, realpathCwd, timeout);
  }

  async exec(command: string, cwd: string, timeout: number): Promise<ShellTool.ExecResult> {
    console.log(chalk.red(`$ ${command}`));
    return new Promise((resolve) => {
      exec(command, { encoding: "utf-8", cwd, timeout: timeout * 1000 }, (error, stdout, stderr) => {
        if (error)
          console.log(chalk.red(error));
        if (stderr)
          console.log(chalk.red(stderr));
        if (stdout)
          console.log(chalk.grey(stdout));
        resolve({ error, stdout, stderr });
      });
    });
  }
}

export namespace ShellTool {
  export const name = "shell";

  export const description = `
  Execute a shell command inside a temporary folder. You should not escape that
  folder, but you can use it as a working directory. You're given the option to
  set a timeout. Be sure to set a broad timeout, but no more than 9 minutes
  (540 seconds) since we need to supply a function output to the OpenAI API in 10
  minutes.
  `;

  export const params = Object.freeze({
    command: {
      type: "string",
      description: "The shell command to execute"
    },
    cwd: {
      type: "string",
      description: "The working directory relative to your temporary folder"
    },
    timeout: {
      type: "number",
      description: "The process will be killed in this amount of seconds."
    }
  }) as AITool.Params;

  export interface ExecResult {
    stdout: string|null;
    stderr: string|null;
    error: Error|null;
  }
}
