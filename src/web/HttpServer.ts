import Fastify, { FastifyInstance, FastifyListenOptions, FastifyServerOptions } from 'fastify'
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import { join } from 'path';

export class HttpServer {
  static DEFAULT_FASTIFY_OPTIONS: FastifyServerOptions = {
    logger: true,
  };

  private fastify: FastifyInstance;

  constructor(private cwd: string, opts: Partial<FastifyServerOptions> = {}) {
    this.fastify = Fastify({ ...HttpServer.DEFAULT_FASTIFY_OPTIONS, ...opts });

    this.fastify.register(fastifyStatic, {
      root: join(__dirname, "..", "client", "public"),
      prefix: "/"
    });

    this.fastify.register(fastifyWebsocket);

    this.fastify.register(async () => {
      this.fastify.get("/ws", { websocket: true }, (socket, req) => {
        req.log.info("/ws client connected");

        socket.on("message", (messageBuffer: Buffer) => {
          const { id, payload } = JSON.parse(messageBuffer.toString("utf-8"));
          let result: any;

          if (payload[0] === "cwd") {
            result = { id, payload: this.cwd };
          } else {
            result = { id, error: { message: `invalid-payload`, payload } };
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
