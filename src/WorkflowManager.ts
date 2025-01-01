import { stringify } from "yaml";
import { AITool } from "./AITool";
import { OpenAIAssistant } from "./OpenAIAssistant";
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

const INSTRUCTIONS = `
You're an assistant working in a workflow engine.
`;

export class WorkflowManager {
  createProcess(configPath: string, directory?: string | undefined) {

    const config = new YamlConfig(configPath).readSync().get();
    directory = OpenAIAssistantManager.ensureWorkingDirectory(directory);
    console.log("WORKING DIR", directory);

    const processRef = new Reference<Process|null>(null);

    const vectorStoreManager = new VectorStoreManager(directory);
    const name = `RobTheRobot Workflow For ${config.name}`;
    const tools = [
      new PromptTool(),
      new FileWritingShellTool(directory, vectorStoreManager, 1000),
      new WorkspaceUploadTool(vectorStoreManager),
      new ProcessVariableReadTool(processRef),
      new ProcessVariableWriteTool(processRef),
    ] as AITool[];
    const log = (...args: any[]) => console.log(args);

    let variablesInstructions = `The following variables are available in this workflow:\n\n`
      + stringify(config.variables)
      + "\n\nYou can read & write them using read-variable and write-variable."

    const assistant = new OpenAIAssistant({
      instructions: INSTRUCTIONS + "\n\n" + variablesInstructions,
      name,
      tools,
      directory,
      log,
      vectorStoreManager
    });

    return processRef.wrap(new Process(assistant, config))!;
  }
}
