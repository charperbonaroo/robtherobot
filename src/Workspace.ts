import { execFileSync } from "node:child_process";
import { PathLike, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export class Workspace {
  #rootDir: string;

  constructor(rootDir: PathLike) {
    this.#rootDir = realpathSync(rootDir);
  }

  get rootDir(): string {
    return this.#rootDir;
  }

  get isEmpty(): boolean {
    return true;
  }

  get isGit(): boolean {
    return !!this.getGitInfo();
  }

  getGitInfo(): GitInfo|null {
    let porcelainv1: string;
    try {
      porcelainv1 = this.execFile("git", ["status", "--porcelain=v1"]);
    } catch (error) {
      if (error
        && typeof error === "object"
        && "stderr" in error
        && typeof error.stderr === "string"
        && error.stderr.includes("not a git repository"))
        return null;
      throw error;
    }

    const branch = this.execFile("git", ["branch", "--show-current"]).trim();
    const gitInfo: GitInfo = {
      porcelainv1,
      branch
    };
    return gitInfo;
  }

  gitInit(initialBranch?: string): void {
    const argv = ["init", "--quiet"];
    if (initialBranch)
      argv.push(`--initial-branch=${initialBranch}`);
    execFileSync("git", argv, { cwd: this.#rootDir });
  }

  gitCommitAll(message: string): void {
    execFileSync("git", ["add", "--all"], { cwd: this.#rootDir });
    execFileSync("git", ["commit", "--message", message], { cwd: this.#rootDir });
  }

  listAllFiles(depth?: number) {
    const argv = [".", "-path", "./.git", "-prune", "-o", "-print"];
    if (typeof depth !== "undefined")
      argv.push("-maxdepth", depth.toString());
    return this.execFile("find", argv)
      .split("\n")
      .map((line) => resolve(this.#rootDir, line).replace(this.#rootDir, "").replace(/^\//, ""))
      .filter((line) => line !== "");
  }

  execFile(file: string, args: readonly string[], cwd?: string|{ cwd: string }) {
    if (cwd && typeof cwd === "object") {
      if (Object.keys(cwd).length > 1) {
        throw new Error(`execFile's 3rd param only supports object with cwd property`)
      }
      cwd = cwd.cwd;
    }
    try {
      return execFileSync(
        file, args,
        { cwd: cwd ? join(this.#rootDir, cwd) : this.#rootDir,
          encoding: "utf-8",
          stdio: ['ignore', 'pipe', 'pipe']
        });
    } catch (error: unknown) {
      if (!(error instanceof Error))
        throw error;
      if ("stdout" in error)
        error.message += "\n" + error.stdout;
      throw error;
    }
  }

  writeFile(file: string, data: string | NodeJS.ArrayBufferView): void {
    writeFileSync(resolve(this.#rootDir, file), data);
  }

  readFile(file: string): string {
    return readFileSync(resolve(this.#rootDir, file), { encoding: "utf-8" });
  }
}

export interface GitInfo {
  porcelainv1?: string;
  branch?: string;
}
