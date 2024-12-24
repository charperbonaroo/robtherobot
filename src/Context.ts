import { Workspace } from "./Workspace";

export namespace Context {
  export function create(workspace: Workspace) {
    return {
      getGitInfo: workspace.getGitInfo.bind(workspace),
      gitInit: workspace.gitInit.bind(workspace),
      gitCommitAll: workspace.gitCommitAll.bind(workspace),
      listAllFiles: workspace.listAllFiles.bind(workspace),
      execFile: workspace.execFile.bind(workspace),
      writeFile: workspace.writeFile.bind(workspace),
      readFile: workspace.readFile.bind(workspace),
    }
  }
}
