import { HttpServer } from "./HttpServer";
import { RobServer } from "./RobServer";
import { program } from "commander";

const HELP_TEXT = `
ROB THE ROBOT is an AI powered footgun that has complete, unlimited access to
your machine, your machine's shell and any file. It should be capable of
performing simple code-related tasks and it is instructed not to escape the
current working directory, but nothing is guaranteed.

Every time you call robtherobot, a new context is created and it will attempt to
perform the task you've given it. You might need to order it to actually use the
tools given to it, and you might need to order it to read the documentation or
README of your repo.

If you want robtherobot to continue working on something, you can use
--continue. Using --continue, it will load a slice of the last conversation and
attempt to improve upon the last conversation.

Results are widely unpredictable. Use git to rollback changes it made. You might
need to re-run the tool multiple times to get the desired result, optionally
altering your prompt to clarify.

EXAMPLES

robtherobot "Describe this repo"
robtherobot --continue "You made an oopsie, fix it"
`;

program
  .name("robtherobot")
  .option("-c, --continue", "Continue the last conversation", false)
  .option("-d, --cwd <cwd>", "The working directory", process.cwd())
  .argument('[prompt]')
  .action(async (prompt, opts) => {
    const server = new RobServer(opts.cwd);
    for await (const res of server.send(prompt)) {
      if (res.type === "message" && res.message.role === "assistant") {
        console.log(res.message.content);
      }
    }
  })
  .command("serve")
  .option("-p, --port <port>", "HTTP port", "1815")
  .option("-h, --host <host>", "Host", "127.0.0.1")
  .option("-d, --cwd <cwd>", "The working directory", process.cwd())
  .description("Run HTTP server at a given port")
  .action(async (port, opts) => {
    const server = new RobServer(opts.cwd);
    await new HttpServer(server).listen(port, opts.host);
  })

program.addHelpText('after', HELP_TEXT);

program.parse();
