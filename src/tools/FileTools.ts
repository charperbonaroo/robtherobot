import { AITool } from "@/AITool";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { inspect } from "util";
import chalk from "chalk";

export namespace FileTools {
  function getPath(directory: string, path: string): string {
    const resolvedPath = resolve(directory, path);
    const resolvedDir = dirname(resolvedPath);
    mkdirSync(resolvedDir, { recursive: true });
    const realDir = realpathSync(resolvedDir);
    if (!realDir.startsWith(directory))
      throw new Error(`Resolved CWD ${inspect(realDir)} not inside working directory ${inspect(directory)}`);

    return resolvedPath;
  }

  function linesToFileFragment(
    lineNumber: number,
    lineCount: number,
    maxLineLength: number,
    lines: string[]
  ): FileFragment {
    const lineEnd = lineNumber + lineCount;
    if (lineNumber < 0) lineNumber = 0;
    return {
      totalLineCount: lines.length,
      lines: lines.slice(lineNumber, lineEnd).map((line, index) => ({
        index: index + lineNumber,
        content: line.substring(0, maxLineLength),
        length: line.length,
      })),
    };
  }

  export class Reader implements AITool {
    name: string = "read-file";
    description: string = `
      Read a number of lines in a file, starting at lineNumber, with a maximum
      of lineCount lines. Lines longer than maxLineLength are truncated to that
      length.

      The return value is an object which includes an array of objects with
      (truncated) line content, index (line number) and original line length.
      The return value also includes the total number of lines.
    `;
    params: AITool.Params = {
      path: {
        type: "string",
        description: "File path relative to working directory",
      },
      lineNumber: {
        type: "number",
        description: "Which line to start reading at. Use 0 to start at top of file.",
      },
      lineCount: {
        type: "number",
        description: "Maximum number of lines to read. Recommended: 100"
      },
      maxLineLength: {
        type: "number",
        description: "Maximum number of characters to return per line. Recommended: 200",
      },
    };

    async run(params: Record<string, unknown>, directory: string): Promise<FileFragment|ErrorResponse> {
      const path = params.path as string;
      const { lineNumber, lineCount, maxLineLength } = params as Record<string, number>;
      return await this.exec({ directory, path, lineCount, lineNumber, maxLineLength });
    }

    protected async exec(
      { directory, path, lineCount, lineNumber, maxLineLength }: ReaderExecParams
    ): Promise<FileFragment|ErrorResponse> {
      const realPath = getPath(directory, path);
      if (!existsSync(realPath))
        return { error: "not-found", message: `File ${inspect(path)} not found!` };

      const lines = readFileSync(realPath, { encoding: "utf-8" }).split(/\n/g);
      return linesToFileFragment(lineNumber, lineCount, maxLineLength, lines);
    }
  }

  export function formatFragmentLines(fragment: FileFragment): string {
    const lineNumberLength = `${fragment.totalLineCount}`.length;
    return fragment.lines
      .map((line) => `${line.index.toString().padStart(lineNumberLength, "0")} ${line.content}`)
      .join("\n");
  }

  export class LoggingReader extends Reader {
    protected async exec(params: ReaderExecParams): Promise<FileFragment|ErrorResponse> {
      console.log(chalk.red(`READ ${inspect(params.path)}:${params.lineNumber} ${params.lineCount} ${params.maxLineLength}`));
      const result = await super.exec(params);
      if ("error" in result) {
        console.error(chalk.red(`READ ERROR: ${result.error}: ${result.message}`));
      } else {
        console.log(chalk.gray(formatFragmentLines(result)));
      }
      return result;
    }
  }

  export interface ReaderExecParams {
    directory: string;
    path: string;
    lineNumber: number;
    lineCount: number;
    maxLineLength: number;
  }

  export class Writer implements AITool {
    name: string = "modify-file";
    description: string = `
      Write or replace lines in a file by deleting lines at a given line number,
      and appending content at that location, similar how Array.prototype.splice
      would work on an array of lines.

      As a confirmation, part of the modified file is returned, including
      \`contextLineCount\` lines of code above and below the updated content.

      The returned lines are truncated to \`maxLineLength\` characters.

      The return value is an object which includes an array of objects with
      (truncated) line content, index (line number) and original line length.
      The return value also includes the total number of lines.
    `;
    params: AITool.Params = {
      path: {
        type: "string",
        description: "File path relative to working directory. If the file does not exist, it is created.",
      },
      lineNumber: {
        type: "number",
        description: `The content is written starting at this line. If the
          lineNumber is greater than the number of lines in the file, it is
          appended to the file.`.replace(/\s+/g, " "),
      },
      deleteLineCount: {
        type: "number",
        description: `The number of lines to delete at the line number before
          writing the content at the line. Use 0 to delete no lines.`.replace(/\s+/g, " "),
      },
      appendContent: {
        type: "string",
        description: "The content to inject at the line number, as a string. Can be multiple lines."
      },
      maxLineLength: {
        type: "number",
        description: "Maximum number of characters to return per line. Recommended: 200",
      },
      contextLineCount: {
        type: "number",
        description: "The number of lines returned around the modified lines. Recommended: 7"
      }
    };

    async run(params: Record<string, unknown>, directory: string): Promise<FileFragment|ErrorResponse> {
      const { path, appendContent } = params as Record<string, string>;
      const { lineNumber, deleteLineCount, maxLineLength, contextLineCount } = params as Record<string, number>;
      return await this.exec({ directory, path, appendContent, lineNumber, deleteLineCount, maxLineLength, contextLineCount });
    }

    protected async exec(
      { directory, path, appendContent, lineNumber, deleteLineCount, maxLineLength, contextLineCount }: WriterExecParams
    ): Promise<FileFragment|ErrorResponse> {
      const realPath = getPath(directory, path);
      const lines = existsSync(realPath) ? readFileSync(realPath, { encoding: "utf-8" }).split(/\n/g) : [];
      const newLines = appendContent.split(/\n/g);

      lines.splice(Math.max(lineNumber, 0), deleteLineCount, ...newLines);
      writeFileSync(realPath, lines.join("\n"));

      lineNumber -= contextLineCount;
      const lineCount = newLines.length + contextLineCount * 2;

      return linesToFileFragment(lineNumber, lineCount, maxLineLength, lines);
    }
  }

  export interface WriterExecParams {
    directory: string;
    path: string;
    appendContent: string;
    lineNumber: number;
    deleteLineCount: number;
    maxLineLength: number;
    contextLineCount: number;
  }

  export class LoggingWriter extends Writer {
    protected async exec(params: WriterExecParams): Promise<FileFragment|ErrorResponse> {
      console.log(chalk.red(`WRITE ${inspect(params.path)}:${params.lineNumber}, DEL ${params.deleteLineCount}, APPEND\n${params.appendContent}`));
      const result = await super.exec(params);
      if ("error" in result) {
        console.error(chalk.red(`WRITE ERROR: ${result.error}: ${result.message}`));
      } else {
        console.log(chalk.gray(formatFragmentLines(result)));
      }
      return result;
    }
  }

  export interface ErrorResponse {
    error: string;
    message: string;
  }

  export interface FileFragment {
    totalLineCount: number;
    lines: Line[];
  }

  export interface Line {
    index: number;
    content: string;
    length: number;
  }
}
