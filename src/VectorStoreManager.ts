import { Uploadable } from "openai/uploads";
import { Lazy } from "./Lazy";
import OpenAI from "openai";
import { createReadStream } from "fs";
import { extname, join } from "path";

const EXTS = ["c", "cpp", "css", "csv", "doc", "docx", "gif", "go", "html", "java", "jpeg", "jpg", "js", "json", "md", "pdf", "php", "pkl", "png", "pptx", "py", "rb", "tar", "tex", "ts", "txt", "webp", "xlsx", "xml", "zip"];

export class VectorStoreManager {
  #openai = new OpenAI();
  #vectorStore = new Lazy(() => this.#openai.beta.vectorStores.create({ name: "Working Directory" }));
  #directory: string;

  constructor(directory: string) {
    this.#directory = directory;
  }

  // Uploading clubi seems to trigger token limit; maybe limit no. of files, and
  // let assistant know only a subset of files were uploaded?
  async uploadFiles(filePaths: string[]) {
    const id = await this.getId();
    const files: Uploadable[] = [];

    for (const filePath of filePaths) {
      const ext = extname(filePath).slice(1);
      if (!EXTS.includes(ext)) {
        // TODO: notify assistant the file is skipped
        console.warn(`Ignoring ${filePath} because it has an invalid extension .${ext}`);
        continue;
      }
      const absoluteFilePath = join(this.#directory, filePath);
      const stream = createReadStream(absoluteFilePath);
      files.push(Object.assign(stream, { name: filePath }));
    }
    await this.#openai.beta.vectorStores.fileBatches.uploadAndPoll(id, { files });
  }

  async getId() {
    return (await this.#vectorStore.get()).id;
  }
}
