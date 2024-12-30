import { VectorStoreManager } from "@/VectorStoreManager";
import { ShellTool } from "./ShellTool";
import { join } from "node:path";
import { formatDateAsISO } from "@/formatDateAsISO";
import { writeFile } from "node:fs/promises";
import { inspect } from "node:util";
import chalk from "chalk";

export class FileWritingShellTool extends ShellTool {
  #vectorStoreManager: VectorStoreManager;
  #threshold: number;
  #directory: string;
  #count: number = 0;

  constructor(
    directory: string,
    vectorStoreManager: VectorStoreManager,
    threshold: number
  ) {
    super();

    this.#directory = directory;
    this.#vectorStoreManager = vectorStoreManager;
    this.#threshold = threshold;

    this.description += `
    If the stderr or stdout exceeds ${threshold} characters, the output is
    written to a file. In that case, the response includes a path to the file.

    The file is also added to your vector store, accessible using file_search.
    You should use file_search to access the file. Alternatively, you can read
    parts of it using command-line tools. Avoid reading the whole thing, as it
    can consume all of the token limit.

    Do not use workspace-upload to re-upload the file. It is already uploaded in
    your vector store.
    `;
  }

  async exec(command: string, cwd: string, timeout: number) {
    const output = await super.exec(command, cwd, timeout);
    const filename = `${formatDateAsISO()}-${(++this.#count).toString().padStart(4, '0')}`;
    const uploadables: string[] = [];

    for (const [prop, suffix] of [["stderr", ".err.txt"], ["stdout", ".out.txt"]] as const) {
      if (output[prop] && output[prop].length >= this.#threshold) {
        const path = filename + suffix;
        const fullPath = join(this.#directory, path);
        await writeFile(fullPath, output[prop]);
        output[prop] = `Written to ${inspect(path)}`;
        uploadables.push(path);
        console.log(chalk.gray(`uploaded ${prop} as ${inspect(path)}`));
      }
    }

    if (uploadables.length > 0)
      await this.#vectorStoreManager.uploadFiles(uploadables);

    return output;
  }
}
