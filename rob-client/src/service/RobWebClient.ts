import { RobWeb } from "rob-web";
import { Queryable } from "./Queryable";
import { SocketClient } from "./SocketClient";

export class RobWebClient implements RobWeb.Async {
  private static _instance: RobWebClient|null = null;

  public static get instance() {
    if (!this._instance)
      this._instance = new RobWebClient(SocketClient.instance);
    return this._instance;
  }

  protected queryable: Queryable;

  constructor(queryable: Queryable) {
    this.queryable = queryable;
  }
}

export interface RobWebClient extends RobWeb.Async {}

for (const key of RobWeb.KEYS) {
  (RobWebClient.prototype as any)[key] = function(
    this: RobWebClient,
    ...args: Parameters<RobWeb[typeof key]>
  ) {
    return this.queryable.query([ key, ...args ]);
  };
}
