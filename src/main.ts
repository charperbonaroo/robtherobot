import OpenAI from "openai";
import { Workspace } from "./Workspace";
import { mkdirSync, writeFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { Context } from "./Context";
import { inspect } from "node:util";
import chalk from "chalk";
import { last } from "lodash";
import { limitSize } from "./limitSize";

const openai = new OpenAI();

const directory = `../robtherobot-tmp/${Math.random().toString(36).substring(7)}`;
mkdirSync(directory, { recursive: true });
const workspace = new Workspace(directory);

console.log("WORKING DIR", directory);

workspace.writeFile("index.js", `consoole.log('Hello World');`);

const MESSAGE_LIMIT = 50;

const SYSTEM = `
You're a software developer and you have access to the following tools:

- getGitInfo()
- gitInit(initialBranch?: string) // init a git repo (only when requested by user)
- gitCommitAll(message: string)
- listAllFiles(depth?: number)
- execFile(file: string, args: string[], cwd?: string|{ cwd: string })
- writeFile(file: string, data: string)
- readFile(file: string)

Using these commands, try to fix the user's problem. You'll be given the outputs
of these commands, so you can try many times to actually solve the issue. Other
commands WILL NOT WORK and will break the process. Be sure to ONLY use these
commands.

Use code blocks to execute these functions, eg

\`\`\`javascript
someCommand()
someOtherCommand()
\`\`\`

When executing these commands, you will not have NodeJS globals available:
They're executed inside a VM. Only the listed functions are available. The cwd
will be the root directory and cannot be changed, but you can execute files in a
directory inside the cwd by using the optional cwd param.

Don't assume a user's project will use Javascript. Just list the files and/or
check the README or other docs you might find.

You can combine multiple commands in a single block, but only the output of the
last line will be returned.

If you're confident nothing needs to be done, don't include any code blocks. You
must always test your changes BEFORE GIT COMMIT.

You're limited to ${MESSAGE_LIMIT} responses, so be sure to fix the problem
before that. You don't need to commit the changes unless the user asks you to.
You also don't need to explain what you're doing, nobody will read it.

Be sure to test the changes. Either test it yourself, or create a test. Be sure
to check if your changes build properly and there are no compile or syntax
errors.

The system is running MacOS on an M-chip (ARM).

Don't just blindly fix things. If there's a README or other documentation, read
it first.
`;

const USER = last(process.argv) as string;
const CODE_BLOCK = /```javascript(.*?)```/smg;

function processMessage(content: string) {
  const context = Context.create(workspace);
  createContext(context);
  const blocks = Array.from(content.matchAll(CODE_BLOCK));
  if (blocks.length === 0) {
    return null;
  }
  return blocks
    .map((match) => match[1])
    .map((code) => {
      try {
        return { code, output: runInContext(code, context) };
      } catch (error) {
        if (error instanceof Error)
          return { code, output: `ERROR: ${error.message}` };
        throw error;
      }
    })
    .map(({ code, output }, _, arr) =>
      (arr.length > 1 ? code.trim() + "\n" : "") + (typeof output === "string" ? limitSize(output) : inspect(output, false, Infinity, false)))
    .join("\n");
}

async function main() {
  const messages: (OpenAI.Chat.Completions.ChatCompletionMessage|{role:string, content:string})[] = [
    { role: "developer", content: SYSTEM },
    { role: "user", content: USER },
  ];

  let i = 0;
  while (true) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      // model: "o1-mini",
      messages: messages as any,
    });

    const message = completion.choices[0].message;
    messages.push(message);
    const response = message.content;
    if (!response) {
      console.log("LLM no response?");
      break;
    }

    console.log(chalk.grey(response.replace(CODE_BLOCK,
        (match, code) => chalk.blue(code.trim()))));

    const result = processMessage(response!);
    if (result == null) {
      console.log(chalk.green("LLM considers the problem solved! (no code blocks)"));
      break;
    }

    console.log(chalk.red(result));

    messages.push({ role: "user", content: result } as any);

    if (++i > MESSAGE_LIMIT) {
      console.log("MESSAGE LIMIT - EXIT");
      break;
    }
  }

  mkdirSync("logs", { recursive: true });
  writeFileSync(`logs/${new Date().toISOString().replace(/[\-\:]/g, "")}.json`, JSON.stringify({ rootDir: workspace.rootDir, messages }, null, 2));
}

main();
