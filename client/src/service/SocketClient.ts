import { DeferredValue } from "../util/DeferredValue";
import { Queryable } from "./Queryable";

export class SocketClient implements Queryable {
  private static _instance: SocketClient|null = null;

  public static get instance() {
    if (!this._instance)
      this._instance = new SocketClient();
    return this._instance;
  }

  private socket: WebSocket;
  private nextId = 1;
  private ready = new DeferredValue<boolean>();
  private queryResponses = new Map<number, DeferredValue<any>>();

  constructor() {
    this.socket = new WebSocket("/ws");

    this.socket.addEventListener("message", (event) => this.onMessage(event));

    this.socket.addEventListener("open", () => this.ready.setValue(true));

    this.socket.addEventListener("error", (error) => {
      console.error("SOCKET ERROR", error);
    });

    this.socket.addEventListener("close", (close) => {
      console.error("SOCKET CLOSED", close);
    });
  }

  async query<T>(payload: SocketClient.QueryPayload): Promise<T> {
    const id = this.getNextId();
    const value = new DeferredValue<T>();
    this.queryResponses.set(id, value);
    await this.sendMessage({ id, payload });
    return value.getAsync();
  }

  async sendMessage(message: SocketClient.Message) {
    await this.sendData(JSON.stringify(message));
  }

  async sendData(data: string | ArrayBufferLike | Blob | ArrayBufferView): Promise<void> {
    await this.ready.getAsync();
    this.socket.send(data);
  }

  private onMessage(event: MessageEvent) {
    console.log("onMessage", { event });
    const { id, value, error } = JSON.parse(event.data);
    if (id) {
      const deferred = this.queryResponses.get(id);
      if (!deferred)
        throw new Error(`No deferred value for ID=${id}`);
      if (error)
        deferred.setError(error);
      else
        deferred.setValue(value);
    }
  }

  private getNextId() {
    return this.nextId++;
  }
}

export namespace SocketClient {
  export type QueryPayload = unknown[];
  export type Message = unknown;
}
