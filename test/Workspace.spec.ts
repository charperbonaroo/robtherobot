import { mkdirSync, rmSync, writeFileSync } from "node:fs";
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
      expect(workspace.getGitInfo()).toEqual({ branch: { head: "master", oid: "(initial)" } });
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
      writeFileSync(`${workspace.rootDir}/README.md`, "# Hello, world!");
      writeFileSync(`${workspace.rootDir}/index.js`, "console.log('Hello, world!');");
      execFileSync("git", ["add", "README.md"], { cwd: workspace.rootDir });
      console.log(workspace.describe());
    });
  });
});
