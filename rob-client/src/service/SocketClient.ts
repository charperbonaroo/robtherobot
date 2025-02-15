import { DeferredValue } from "../util/DeferredValue";
import { AsyncGeneratorPipe } from "../util/AsyncGeneratorPipe";
import { Queryable } from "./Queryable";

export class SocketClient implements Queryable {
  public static url = "/ws";

  private static _instance: SocketClient|null = null;

  public static get instance() {
    if (!this._instance)
      this._instance = new SocketClient();
    return this._instance;
  }

  private nextId = 1;
  private socket: WebSocket|null = null;
  private ready: DeferredValue<boolean>|null = null;
  private queryResponses = new Map<number, AsyncGeneratorPipe.Callback<any, any>>();

  constructor() {
    this.connect();
  }

  query<T, TReturn>(payload: SocketClient.QueryPayload): AsyncGenerator<T, TReturn, void> {
    const id = this.getNextId();
    const [callback, generator] = AsyncGeneratorPipe.create<T, TReturn, void>();
    this.queryResponses.set(id, callback);
    this.sendMessage({ id, payload });
    return generator;
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
    this.socket = new WebSocket(SocketClient.url);

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
    const data = JSON.parse(event.data);
    const { id, value, done, error } = data;
    if (id) {
      const deferred = this.queryResponses.get(id);
      if (!deferred)
        throw new Error(`No deferred value for ID=${id}`);

      if (error)
        deferred({ error });
      else
        deferred({ done, value });
      if (done)
        this.queryResponses.delete(id);
    }
  }

  private onClose(event: CloseEvent) {
    this.rejectAndClearQueryResponses(new SocketClient.SocketClosedError());
    setTimeout(() => { this.connect(); }, 500)
  }

  private rejectAndClearQueryResponses(error: Error) {
    for (const value of this.queryResponses.values())
      value({ error });
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
