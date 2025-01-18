import { last } from "lodash";
import { OpenAIChatWorker } from "./OpenAIChatWorker";
import { OpenAIAssistantManager } from "./OpenAIAssistantManager";
import { WorkflowManager } from "./WorkflowManager";
import { OpenAIAssistant } from "./OpenAIAssistant";
import { PromptTool } from "./tools/PromptTool";
import { FileTools } from "./tools/FileTools";
import { program } from "commander";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { formatDateAsISO } from "./formatDateAsISO";
import * as chalk from "chalk";
import { execSync } from "node:child_process";
import { ChatCompletionMessageParam } from "openai/resources";

async function runAssistant() {
  program
    .name("robtherobot")
    .option("-c, --continue", "Continue the last conversation", false)
    .option("-d, --cwd <cwd>", "The working directory", process.cwd())
    .argument('[prompt]')
    .action((prompt, opts) => {
      console.log("DEFAULT", { prompt, opts });
    })
    .command("serve [port]")
    .option("-d, --cwd <cwd>", "The working directory", process.cwd())
    .description("Run HTTP server at a given port")
    .action((port, opts) => {
      console.log("serve", { port, opts });
    })

  program.addHelpText('after', HELP_TEXT);

  program.parse();

  // const opts = program.opts();

  // const prompt = program.args.pop();
  // const dir = OpenAIAssistantManager.ensureWorkingDirectory(opts.cwd);
  // console.log("WORKING DIR", dir);

  // const assistant = new OpenAIAssistant("gpt-4o", dir);

  // if (opts.continue) {
  //   const logFile = execSync("ls -t logs/*.json | head -n 1", { encoding: "utf-8" }).trimEnd();
  //   if (!logFile) {
  //     throw new Error(`Can't continue - there is no log file?`);
  //   }
  //   const content = readFileSync(logFile, { encoding: "utf-8" });
  //   const messages = JSON.parse(content) as ChatCompletionMessageParam[];

  //   let index = Math.max(messages.length - 4, 1);
  //   const messagesSlice = messages.slice(index);

  //   // ensure the tool message is paired with a tool_calls message
  //   while (index > 0 && messagesSlice[0].role == "tool")
  //     messagesSlice.unshift(messages[--index]);

  //   // insert the first message
  //   if (index > 0)
  //     messagesSlice.unshift(messages[0]);

  //   console.log(`Restored ${messagesSlice.length} of ${messages.length} messages from the previous conversation.`);
  //   assistant.pushMessage(...messagesSlice);

  //   console.log(chalk.grey(last(messagesSlice)?.content));
  // }

  // try {
  //   assistant.addTools(
  //     new FileTools.LoggingReader(),
  //     new FileTools.LoggingWriter(),
  //     new FileTools.LoggingShellTool(),
  //     new PromptTool(),
  //   );
  //   const result = await assistant.send(prompt!);
  //   console.log(result.content);

  //   await assistant.sendMessage({
  //     role: "system",
  //     content: [{ type: "text", text: `
  //       Summerize the conversation so a future AI agent or human can continue to
  //       work on it. Include technical details!
  //     `.replace(/\s+/g, " ") }]
  //   });
  // } finally {
  //   const messages = assistant.getMessages();
  //   const log = `logs/${formatDateAsISO()}.json`;
  //   try {
  //     writeFileSync(log, safeStringify(messages));
  //     console.log(chalk.gray(`LOG: ${realpathSync(log)}`));
  //   } catch (error) {
  //     console.error(`Failed to write log:`);
  //     console.error(error);
  //   }
  // }

  // process.exit(0);

  return "";
}

function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return; // Skip circular reference
      }
      seen.add(value);
    }
    return value;
  }, 2);
}

if (true) {
  runAssistant().then((x) => x && console.log(x), console.error);
} else if (false)
  new OpenAIChatWorker().run(last(process.argv) as string);
else if (false) {
  const prompt = process.argv.pop();
  const dir = process.argv.pop();
  new OpenAIAssistantManager(dir).run(prompt!);
} else {
  new WorkflowManager().createProcess("robots/xml-feed-reader.yml").run();
}

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
