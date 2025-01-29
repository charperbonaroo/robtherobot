import Fastify, { FastifyInstance, FastifyListenOptions, FastifyServerOptions } from "fastify"
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import { join } from "node:path";
import { RobServer } from "./RobServer";
import { RobWeb } from "rob-web";

export class HttpServer {
  static DEFAULT_FASTIFY_OPTIONS: FastifyServerOptions = {
    logger: true,
  };

  private fastify: FastifyInstance;

  constructor(private server: RobServer, opts: Partial<FastifyServerOptions> = {}) {
    this.fastify = Fastify({ ...HttpServer.DEFAULT_FASTIFY_OPTIONS, ...opts });

    this.fastify.register(fastifyStatic, {
      root: join(__dirname, "..", "..", "rob-client", "public"),
      prefix: "/"
    });

    this.fastify.register(fastifyWebsocket);

    this.fastify.register(async () => {
      this.fastify.get("/ws", { websocket: true }, (socket, req) => {
        req.log.info("/ws client connected");

        socket.on("message", async (messageBuffer: Buffer) => {
          const { id, payload: [command, ...args] } = JSON.parse(messageBuffer.toString("utf-8"));
          let result: any;

          try {
            if (RobWeb.KEYS.includes(command)) {
              result = { id, value: await (this.server as any)[command](...args) };
            } else {
              result = { id, error: { message: `invalid-command`, command, args } };
            }
          } catch (error: any) {
            result = { id, error: { message: error.message, command, args } }
          }

          socket.send(JSON.stringify(result));
        });

        socket.on("close", () => {
          req.log.info("Client disconnected");
        });
      });
    });
  }

  async listen(port: number, host: string, opts: FastifyListenOptions = {}) {
    await this.fastify.listen({ port, host, ...opts });
  }
}
