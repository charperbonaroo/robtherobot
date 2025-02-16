import { FileTools } from "../../src/tools/FileTools";
import { mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs";

describe("tools/FileTools", () => {
  let path: string;

  beforeAll(() => {
    path = `.tmp/${Math.random()}`;
    mkdirSync(path, { recursive: true });
    path = realpathSync(path);
  });

  afterAll(() => rmSync(path, { recursive: true, force: true }))

  describe("Reader", () => {
    let reader = new FileTools.Reader();

    it("reads a file", async () => {
      writeFileSync(path + "/001.txt", ["a", "b", "c"].join("\n"));

      const result = await reader.run({ path: "001.txt", lineNumber: 0, lineCount: 100, maxLineLength: 200 }, path);
      expect(result).toEqual({
        lines: [
          { content: "a", index: 0, length: 1 },
          { content: "b", index: 1, length: 1 },
          { content: "c", index: 2, length: 1 },
        ],
        totalLineCount: 3,
      });
    });
  });

  describe("Writer", () => {
    let writer = new FileTools.Writer();

    it("writes a file", async () => {
      writeFileSync(path + "/001.txt", ["a", "b", "c"].join("\n"));

      const result = await writer.run({
        path: "001.txt",
        lineNumber: 1,
        deleteLineCount: 1,
        maxLineLength: 200,
        contextLineCount: 7,
        appendContent: "1\n2",
      }, path);
      expect(readFileSync(path + "/001.txt", { encoding: "utf-8" })).toEqual(`a\n1\n2\nc`);
      expect(result).toEqual({
        lines: [
          { content: "a", index: 0, length: 1 },
          { content: "1", index: 1, length: 1 },
          { content: "2", index: 2, length: 1 },
          { content: "c", index: 3, length: 1 },
        ],
        totalLineCount: 4,
      });
    });
  });

  describe("ShellTool", () => {
    let shellTool = new FileTools.ShellTool();

    it("executes a shell command", async () => {
      writeFileSync(path + "/001.txt", ["a", "b", "c"].join("\n"));

      const result = await shellTool.run({
        command: "cat 001.txt",
        cwd: ".",
        execute: true,
        timeout: 1,
        lineNumber: 0,
        lineCount: 100,
        maxLineLength: 200,
      }, path);
      expect(result).toEqual({
        error: null,
        lines: [
          { content: "a", index: 0, length: 1 },
          { content: "b", index: 1, length: 1 },
          { content: "c", index: 2, length: 1 },
          { content: "", index: 3, length: 0 },
        ],
        totalLineCount: 4,
      });
    });
  });
});
