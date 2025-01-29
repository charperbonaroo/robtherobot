import { HttpServer } from "./HttpServer";
import { RobServer } from "./RobServer";

async function main() {
  const rob = new RobServer(process.cwd());
  const server = new HttpServer(rob);
  await server.listen(1815, "127.0.0.1");
}

main();
