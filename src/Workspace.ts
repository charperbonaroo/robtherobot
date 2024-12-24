import { set } from "lodash";
import { execFileSync } from "node:child_process";
import { PathLike, realpathSync } from "node:fs";

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
    let output: string;
    try {
      output = execFileSync(
        "git", ["status", "--porcelain=v2", "--branch"],
        { cwd: this.#rootDir, encoding: "utf-8", stdio: ['ignore', 'pipe', 'pipe'] }
      );
    } catch (error) {
      if (error.stderr.includes("not a git repository"))
        return null;
      throw error;
    }
    const gitInfo: GitInfo = {};
    for (let line of output.split("\n")) {
      const fragments = line.split(" ");
      const sym = fragments.shift();
      if (sym == "#") {
        set(gitInfo, fragments.shift()!, fragments.length == 1 ? fragments[0] : fragments);
      } else if (sym == "?") {
        gitInfo.untracked ??= [];
        gitInfo.untracked.push(fragments[0]);
      } else if (sym == "A.") {
        console.log(line);
      } else {
        console.log({ line, sym, fragments });
      }
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

  describe(): any {
    return {
      gitInfo: this.getGitInfo(),
    }
  }
}

export interface GitInfo {
  untracked?: string[];
  branch?: {
    head?: string;
    oid?: string;
  };
}
