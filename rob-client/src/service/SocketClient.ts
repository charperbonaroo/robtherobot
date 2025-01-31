import { DeferredValue } from "../util/DeferredValue";
import { Queryable } from "./Queryable";

export class SocketClient implements Queryable {
  private static _instance: SocketClient|null = null;

  public static get instance() {
    if (!this._instance)
      this._instance = new SocketClient();
    return this._instance;
  }

  private nextId = 1;
  private socket: WebSocket|null = null;
  private ready: DeferredValue<boolean>|null = null;
  private queryResponses = new Map<number, DeferredValue<any>>();

  constructor() {
    this.connect();
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
    await this.ready!.getAsync();
    this.socket!.send(data);
  }

  private connect() {
    console.debug("Connecting");
    const ready = new DeferredValue<boolean>();
    this.ready = ready;
    this.socket = new WebSocket("/ws");

    this.socket.addEventListener("message", (event) => this.onMessage(event));

    this.socket.addEventListener("open", () => {
      console.debug("Connected");
      ready.setValue(true);
    });

    this.socket.addEventListener("error", (event: Event) => {
      console.error(event);
    });

    this.socket.addEventListener("close", (event) => {
      console.debug("Closed");
      this.onClose(event);
    });
  }

  private onMessage(event: MessageEvent) {
    console.debug("Message", event);
    const { id, value, error } = JSON.parse(event.data);
    if (id) {
      const deferred = this.queryResponses.get(id);
      if (!deferred)
        throw new Error(`No deferred value for ID=${id}`);
      if (error)
        deferred.setError(error);
      else
        deferred.setValue(value);
      this.queryResponses.delete(id);
    }
  }

  private onClose(event: CloseEvent) {
    this.rejectAndClearQueryResponses(new SocketClient.SocketClosedError());
    setTimeout(() => { this.connect(); }, 500)
  }

  private rejectAndClearQueryResponses(error: Error) {
    for (const value of this.queryResponses.values())
      value.setError(error);
    this.queryResponses.clear();
  }

  private getNextId() {
    return this.nextId++;
  }
}

export namespace SocketClient {
  export type QueryPayload = unknown[];
  export type Message = unknown;

  export class SocketClosedError extends Error {}
}
