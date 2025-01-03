import { AITool } from "@/AITool";
import { formatDateAsISO } from "@/formatDateAsISO";
import { VectorStoreManager } from "@/VectorStoreManager";
import chalk from "chalk";
import { fromPairs } from "lodash";
import { exec } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { inspect } from "node:util";
import { stringify } from "yaml";

const description = `
List or Uploads a list of files to your vector store.

The pattern is passed to \`find $PATTERN -type f\`. A value of "**/*" uploads all
files. All matching files are returned, and all matching files are uploaded
unless 'preview' was true.

Some files might be renamed to bypass the filetype restrictions of the vector
storage.

The pattern is always executed relative to the root of the workspace.
`;

const params: AITool.Params = {
  preview: {
    type: "boolean",
    description: `If truthy, no files are upload. Only matching files are returned.`
  },
  pattern: {
    type: "string",
    description: `The file(s) or directories to upload.`
  },
};

const TRUNCATE_THRESHOLD = 100;

export class WorkspaceUploadTool implements AITool {
  #vectorStoreManager: VectorStoreManager;

  name = "workspace-upload";
  description = description;
  params = params;

  constructor(vectorStoreManager: VectorStoreManager) {
    this.#vectorStoreManager = vectorStoreManager;
  }

  async run(params: Record<string, unknown>, directory: string):
  Promise<{
    filesList?: string;
    files?: Record<string, { ok: string }|{error: string}|"">;
    message: string;
    uploaded: boolean;
  }> {
    const { pattern, preview } = params as { pattern: string, preview: boolean };
    let files = await new Promise<Record<string, { ok: string }|{error: string}|"">>((resolve, reject) => {
      const command = `find ${pattern} -type f`;
      console.log(this.name, chalk.red(`$ ${command}`));
      exec(command, { cwd: directory, encoding: "utf-8" }, (error, stdout, stderr) => {
        if (error)
          console.log(this.name, chalk.red(error));
        if (stderr)
          console.log(this.name, chalk.red(stderr));
        if (stdout)
          console.log(this.name, chalk.grey(stdout));
        if (error) {
          console.log({ error });
          reject(error);
        }
        else resolve(fromPairs(stdout.split(/\n/g).filter((_) => _).map((_) => [_, ""])));
      });
    });
    let uploaded = false;
    if (!preview) {
      files = await this.#vectorStoreManager.uploadFiles(Object.keys(files));
      uploaded = true;
      console.log(this.name, chalk.grey(`Uploaded ${Object.keys(files).length} files matching ${pattern}`));
    }
    if (Object.keys(files).length > TRUNCATE_THRESHOLD) {
      const filename = `${formatDateAsISO()}-files-${pattern.replace(/[^a-z]+/g, "-")}.txt`;
      const filesList = join(directory, filename);
      await writeFile(filesList, stringify(files));
      await this.#vectorStoreManager.uploadFiles([filename]);
      return { filesList, uploaded,
        message: `Because there were a large number of files, `
         + `I've uploaded the file-list to ${inspect(filename)} in your vector store.` };
    }
    return {
      files,
      uploaded,
      message: "Here's the filelist. The files are stored in your vector store!"
    };
  }
}
