import { readdir } from "node:fs/promises";
import { RobTheRobot } from "../../shared/RobTheRobot";
import { join } from "node:path";

export class RobTheRobotServer implements RobTheRobot.Async {
  constructor(private _cwd: string) {
  }

  cwd(): Promise<string> {
    return Promise.resolve(this._cwd);
  }

  ls(path: string[]): Promise<string[]> {
    readdir(join())
  }
}
