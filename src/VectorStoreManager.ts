import { Uploadable } from "openai/uploads";
import { Lazy } from "./Lazy";
import OpenAI from "openai";
import { createReadStream } from "fs";
import { extname, join } from "path";

const EXTS = ["c", "cpp", "css", "csv", "doc", "docx", "gif", "go", "html",
  "java", "jpeg", "jpg", "js", "json", "md", "pdf", "php", "pkl", "png", "pptx",
  "py", "rb", "tar", "tex", "ts", "txt", "webp", "xlsx", "zip"];

const APPEND = { "xml": ".txt" } as Record<string, string>;

export class VectorStoreManager {
  #openai = new OpenAI();
  #vectorStore = new Lazy(() => this.#openai.beta.vectorStores.create({ name: "Working Directory" }));
  #directory: string;

  constructor(directory: string) {
    this.#directory = directory;
  }

  // Uploading clubi seems to trigger token limit; maybe limit no. of files, and
  // let assistant know only a subset of files were uploaded?
  async uploadFiles(filePaths: string[]): Promise<Record<string, { ok: string }|{error: string}>> {
    const id = await this.getId();
    const files: Uploadable[] = [];
    const uploadedFiles: Record<string, { ok: string }|{error: string}> = {};

    for (let filePath of filePaths) {
      let ext = extname(filePath).slice(1);
      const append = APPEND[ext] || "";

      if (!append && !EXTS.includes(ext)) {
        uploadedFiles[filePath] = { error: "Invalid extension" };
        console.warn(`Ignoring ${filePath} because it has an invalid extension .${ext}`);
        continue;
      }

      const absoluteFilePath = join(this.#directory, filePath);
      const stream = createReadStream(absoluteFilePath);
      files.push(Object.assign(stream, { name: filePath + append }));
      uploadedFiles[filePath] = { ok: filePath + append };
    }
    const result = await this.#openai.beta.vectorStores.fileBatches.uploadAndPoll(id, { files });
    console.log(result);
    return uploadedFiles;
  }

  async getId() {
    return (await this.#vectorStore.get()).id;
  }
}
