import { RobTheRobot } from "../../../shared/RobTheRobot";
import { Queryable } from "./Queryable";
import { SocketClient } from "./SocketClient";

export class RobTheRobotClient implements RobTheRobot.Async {
  private static _instance: RobTheRobotClient|null = null;

  public static get instance() {
    if (!this._instance)
      this._instance = new RobTheRobotClient(SocketClient.instance);
    return this._instance;
  }

  protected queryable: Queryable;

  constructor(queryable: Queryable) {
    this.queryable = queryable;
  }
}

export interface RobTheRobotClient extends RobTheRobot.Async {}

for (const key of RobTheRobot.KEYS) {
  (RobTheRobotClient.prototype as any)[key] = function(
    this: RobTheRobotClient,
    ...args: Parameters<RobTheRobot[typeof key]>
  ) {
    return this.queryable.query([ key, ...args ]);
  };
}
