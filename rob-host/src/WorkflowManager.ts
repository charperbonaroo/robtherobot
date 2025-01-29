import { stringify } from "yaml";
import { AITool } from "./AITool";
import { OpenAIAssistantStream } from "./OpenAIAssistantStream";
import { OpenAIAssistantManager } from "./OpenAIAssistantManager";
import { Reference } from "./Reference";
import { FileWritingShellTool } from "./tools/FileWritingShellTool";
import { ProcessVariableReadTool } from "./tools/ProcessVariableReadTool";
import { ProcessVariableWriteTool } from "./tools/ProcessVariableWriteTool";
import { PromptTool } from "./tools/PromptTool";
import { WorkspaceUploadTool } from "./tools/WorkspaceUploadTool";
import { VectorStoreManager } from "./VectorStoreManager";
import { Process } from "./workflow/Process";
import { YamlConfig } from "./workflow/YamlConfig";
import { Config } from "./workflow/Config";

export class WorkflowManager {
  createProcess(configPath: string, directory?: string | undefined) {
    const config = new YamlConfig(configPath).readSync().get();
    directory = OpenAIAssistantManager.ensureWorkingDirectory(directory);
    console.log("WORKING DIR", directory);

    config.variables["next_step"] = {
      name: "next_step",
      type: "string",
      description: "This variable contains the name of the next step."
    }

    const processRef = new Reference<Process|null>(null);

    const vectorStoreManager = new VectorStoreManager(directory);
    const name = `RobTheRobot Workflow For ${config.name}`;
    const tools = [
      new PromptTool(),
      new FileWritingShellTool(directory, vectorStoreManager, 10_000),
      new WorkspaceUploadTool(vectorStoreManager),
      new ProcessVariableReadTool(processRef),
      new ProcessVariableWriteTool(processRef),
    ] as AITool[];

    const assistant = new OpenAIAssistantStream({
      instructions: this.getInstructions(config),
      name,
      tools,
      directory,
      vectorStoreManager
    });

    return processRef.wrap(new Process(assistant, config))!;
  }

  getInstructions(config: Config) {
    const instructions = [
      `You're an assistant working in a workflow engine.`,
      `Note that you have access to a shell tool, which might upload the output
      to a file. The file is uploaded to your vector store. Use file_search to access it.`,
      "The following variables are available in this workflow:",
      stringify(config.variables),
      "You can read & write them using read-variable and write-variable.",
      "The workflow has the following steps:",
      stringify(config.steps),
      "You can configure the next step by writing to the next_step variable.",
      `The first step, aka the entrypoint, is ${config.entrypoint}`
    ];

    return instructions.join("\n\n");
  }
}
