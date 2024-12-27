import OpenAI from "openai";
import { resolve } from "node:path";
import { AITool } from "./AITool";
import { OpenAIAssistant } from "./OpenAIAssistant";
import { ShellTool } from "./tools/ShellTool";
import { mkdirSync, realpathSync } from "node:fs";
import { AssistantTool } from "./tools/AssistantTool";

export class OpenAIAssistantManager {
  #manager: OpenAIAssistant;
  #directory: string;
  #log: (...args: any[]) => void;

  constructor(directory?: string) {
    this.#directory = OpenAIAssistantManager.ensureWorkingDirectory(directory);
    this.#log = (...args: any[]) => console.log(...args);
    this.#log("WORKING DIR", this.#directory);

    const tools = OpenAIAssistantManager.ROLES.map((role) => new AssistantTool(role.id, new OpenAIAssistant({
      name: `RobTheRobot ${role.name}`,
      instructions: role.instructions,
      tools: role.tools,
      directory: this.#directory,
      log: (...args: any[]) => this.#log(role.name, ...args),
    })));

    let instructions = `
    You're a manager of software developers. You're given an arbitrary task
    and you're expected to complete it by tasking other developers. Once the
    developer (claims) it completed a task, you're to task a quality assurance
    agent to verify the task was completed.

    If QA finds the task not completed, you should order the developer to fix it.

    The following roles are available to you (as tools):
    `;

    for (const role of OpenAIAssistantManager.ROLES) {
      instructions += `
        ## ${role.name}

        ID ${role.id}

        The assistant has access to the following tools:\

        ${JSON.stringify(role.tools, null, 2)}

        The assistant is given the following instructions:

        ${role.instructions}
      `;
    }

    this.#manager = new OpenAIAssistant({
      name: `RobTheRobot Manager`,
      tools,
      instructions,
      directory: this.#directory,
      log: (...args: any[]) => this.#log("Manager", ...args),
    });
  }


  async run(prompt: string): Promise<void> {
    await this.#clearAssistants();
    await this.#manager.run(prompt);
  }

  async #clearAssistants() {
    const openai = new OpenAI();
    for (const assistant of (await openai.beta.assistants.list()).data)
      if (assistant.name?.startsWith("Rob"))
        await openai.beta.assistants.del(assistant.id);
  }
}

export namespace OpenAIAssistantManager {
  export function ensureWorkingDirectory(directory?: string|undefined): string {
    if (!directory)
      directory = resolve(`../robtherobot-tmp/tmp-${Math.random().toString(36).substring(7)}`);
    mkdirSync(directory, { recursive: true });
    return realpathSync(directory);
  }

  export interface Role {
    id: string;
    name: string;
    instructions: string;
    tools: AITool[];
  }

  export const ROLES: Role[] = [{
    id: "developer",
    name: "Developer",
    tools: [new ShellTool()],
    instructions: `
      You're a senior developer at a software company. You will be given an arbitrary
      task and you're expected to complete it.

      Your most common problems are related to software development. Be sure to test
      your changes, read the README, and check for any compile or syntax errors.

      You should focus on solving the problem by using the tools provided to you. You
      have access to a shell.

      Be careful installing stuff. Be sure to verify the user has existing tools
      available. Specifically, if the user needs a specific version of a tool, be sure
      to see if there's a known tool manager available (like nvm, asdf, rvm, etc)

      Be sure to continue until the user's problem is solved. Don't ask for
      confirmation, the session is NOT interactive. Just do your job and be sure to
      complete it.

      Be sure not to respond with instructions how to do something. I expect you to
      solve the user's problem. Answer briefly, don't respond with code, just fix it
      yourself.
    `,
  }, {
    id: "qa",
    name: "Quality Assurance",
    tools: [new ShellTool()],
    instructions: `
      You're a senior quality assurance at a software company. You will be given
      an arbitrary task and you're expected to complete it.

      Your most common problems are related to software development. Be sure to test
      your changes, read the README, and check for any compile or syntax errors.

      You should focus on checking the results of a previous developer. Let us
      know whether the job was done by the previous developer.

      The the previous developer's job was to create an application, verify it
      runs. Verify it has tests.
    `,
  }]
}
