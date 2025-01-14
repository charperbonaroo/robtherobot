import { last } from "lodash";
import { OpenAIChatWorker } from "./OpenAIChatWorker";
import { OpenAIAssistantManager } from "./OpenAIAssistantManager";
import { WorkflowManager } from "./WorkflowManager";
import { OpenAIAssistant } from "./OpenAIAssistant";
import { PromptTool } from "./tools/PromptTool";
import { FileTools } from "./tools/FileTools";

import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { formatDateAsISO } from "./formatDateAsISO";
import chalk from "chalk";
import { execSync } from "node:child_process";
import { ChatCompletionMessageParam } from "openai/resources";

async function runAssistant() {
  const prompt = process.argv.pop();
  const dirOrContinue = process.argv.pop();
  const cont = dirOrContinue && dirOrContinue.includes("--continue");
  const dir = OpenAIAssistantManager.ensureWorkingDirectory(cont ? process.argv.pop() : dirOrContinue);
  console.log("WORKING DIR", dir);

  const assistant = new OpenAIAssistant("gpt-4o", dir);

  if (cont) {
    const logFile = execSync("ls -t logs/*.json | head -n 1", { encoding: "utf-8" }).trimEnd();
    if (!logFile) {
      throw new Error(`Can't continue - there is no log file?`);
    }
    const content = readFileSync(logFile, { encoding: "utf-8" });
    const messages = JSON.parse(content) as ChatCompletionMessageParam[];
    const messagesSlice = [messages[0]].concat(messages.slice(Math.max(messages.length - 4, 1)));

    console.log(`Restored ${messagesSlice.length} of ${messages.length} messages from the previous conversation.`);
    assistant.pushMessage(...messagesSlice);

    console.log(chalk.grey(last(messagesSlice)?.content));
  }

  try {
    assistant.addTools(
      new FileTools.LoggingReader(),
      new FileTools.LoggingWriter(),
      new FileTools.LoggingShellTool(),
      new PromptTool(),
    );
    const result = await assistant.send(prompt!);
    console.log(result.content);

    const summary = await assistant.sendMessage({
      role: "system",
      content: [{ type: "text", text: `
        Summerize the conversation so a future AI agent or human can continue to
        work on it. Include technical details!
      `.replace(/\s+/g, " ") }]
    });

    console.log(chalk.gray(summary.content));
  } finally {
    const messages = assistant.getMessages();
    const log = `logs/${formatDateAsISO()}.json`;
    try {
      writeFileSync(log, safeStringify(messages));
      console.log(chalk.gray(`LOG: ${realpathSync(log)}`));
    } catch (error) {
      console.error(`Failed to write log:`);
      console.error(error);
    }
  }

  process.exit(0);

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
  runAssistant().then(console.log, console.error);
} else if (false)
  new OpenAIChatWorker().run(last(process.argv) as string);
else if (false) {
  const prompt = process.argv.pop();
  const dir = process.argv.pop();
  new OpenAIAssistantManager(dir).run(prompt!);
} else {
  new WorkflowManager().createProcess("robots/xml-feed-reader.yml").run();
}
