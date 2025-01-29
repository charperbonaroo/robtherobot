import { mkdirSync, rmSync } from "node:fs";
import { Workspace } from "../src/Workspace";
import { execFileSync } from "node:child_process";

describe("Workspace", () => {
  let directory: string;

  beforeEach(() => {
    directory = `../robtherobot-tmp/${Math.random().toString(36).substring(7)}`;

    rmSync(directory, { recursive: true, force: true });
    mkdirSync(directory, { recursive: true });
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  describe("with blank workspace", () => {
    it(".isEmpty returns true if the workspace is empty", () => {
      const workspace = new Workspace(directory);
      expect(workspace).toMatchObject({ isEmpty: true });
    });

    it(".isGit returns false if the workspace is empty", () => {
      const workspace = new Workspace(directory);
      expect(workspace).toMatchObject({ isGit: false });
    });

    it(".getGitInfo returns git info", () => {
      const workspace = new Workspace(directory);
      workspace.gitInit();
      expect(workspace.getGitInfo()).toMatchObject({ branch: "master" });
    });

    it(".gitInit initializes a git repository", () => {
      const workspace = new Workspace(directory);
      workspace.gitInit();
      expect(workspace).toMatchObject({ isGit: true });
    });
  });

  describe("with Git+NPM workspace", () => {
    beforeEach(() => {
      const workspace = new Workspace(directory);
      execFileSync("npm", ["init", "--yes"], { cwd: workspace.rootDir });
      workspace.gitInit();
      workspace.gitCommitAll("Initial commit");
    });

    it("describe", () => {
      const workspace = new Workspace(directory);
      workspace.writeFile("README.md", "# Hello, world!");
      workspace.writeFile("index.js", "console.log('Hello, world!');");
      workspace.execFile("git", ["add", "README.md"]);
      expect(workspace.execFile("node", ["index.js"])).toEqual("Hello, world!\n");
    });
  });
});
