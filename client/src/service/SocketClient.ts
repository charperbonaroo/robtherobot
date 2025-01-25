import { DeferredValue } from "../util/DeferredValue";

export class SocketClient {
  private socket: WebSocket;
  private nextId = 1;
  private ready = new DeferredValue<boolean>();
  private queryResponses = new Map<number, DeferredValue<any>>();

  constructor() {
    this.socket = new WebSocket("/ws");

    this.socket.addEventListener("message", (event) => {
      console.log("message", event);
      this.onMessage(event);
    });

    this.socket.addEventListener("open", (event) => {
      console.log("open", event);
      this.ready.set(true);
    });

    this.socket.addEventListener("error", (error) => {
      console.error("SOCKET ERROR", error);
    })

    this.socket.addEventListener("close", (close) => {
      console.error("SOCKET CLOSED", close);
    })
  }

  async query<T>(payload: any): Promise<T> {
    const id = this.getNextId();
    const value = new DeferredValue<T>();
    this.queryResponses.set(id, value);
    await this.sendPayload({ id, payload });
    return value.getAsync();
  }

  async sendPayload(payload: any) {
    await this.sendData(JSON.stringify(payload));
  }

  async sendData(data: string | ArrayBufferLike | Blob | ArrayBufferView): Promise<void> {
    await this.ready.getAsync();
    this.socket.send(data);
  }

  private onMessage(event: MessageEvent) {
    console.log("onMessage", { event });
    const { id, payload } = JSON.parse(event.data);
    if (id) {
      const value = this.queryResponses.get(id);
      if (value) value.set(payload);
    }
  }

  private getNextId() {
    return this.nextId++;
  }
}
