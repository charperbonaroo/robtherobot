import { join } from "node:path";
import { RobServer } from "./RobServer";
import { RobWeb } from "rob-web";
import express from "express";
import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import morgan from "morgan";

export class HttpServer {
  private app: ReturnType<typeof express>;
  private wss: WebSocketServer;
  private server: http.Server;

  constructor(private rob: RobServer) {
    this.app = express();

    this.app.use(morgan('combined'));

    this.app.use("/", express.static(join(__dirname, "..", "..", "rob-client", "public")));
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.wss.on("connection", (socket, request) => this.onSocket(socket, request));
  }

  async listen(port: number, hostname: string) {
    return new Promise<void>((resolve) => {
      this.server.listen(port, hostname, () => {
        console.info(`Listening at http://${hostname}:${port}/`);
        resolve();
      });
    });
  }

  private onSocket(socket: WebSocket, request: http.IncomingMessage) {
    console.debug(`CONNECTED ${request.socket.remoteAddress}`);

    socket.on("message", async (messageBuffer: Buffer) => {
      const { id, payload: [command, ...args] } = JSON.parse(messageBuffer.toString("utf-8"));
      let result: any;

      try {
        if (RobWeb.KEYS.includes(command)) {
          result = { id, value: await (this.rob as any)[command](...args) };
        } else {
          result = { id, error: { message: `invalid-command`, command, args } };
        }
      } catch (error: any) {
        result = { id, error: { message: error.message, command, args } }
      }

      socket.send(JSON.stringify(result));
    });

    socket.on("close", () => {
      console.debug(`CONNECTED ${request.socket.remoteAddress}`);
    });
  }
}

export namespace HttpServer {
}
