import { last } from "lodash";
import { OpenAIChatWorker } from "./OpenAIChatWorker";
import { OpenAIAssistantManager } from "./OpenAIAssistantManager";
import { WorkflowManager } from "./WorkflowManager";
import { OpenAIAssistant } from "./OpenAIAssistant";
import { PromptTool } from "./tools/PromptTool";
import { FileTools } from "./tools/FileTools";

if (true) {
  const prompt = process.argv.pop();
  const dir = OpenAIAssistantManager.ensureWorkingDirectory(process.argv.pop());
  console.log("WORKING DIR", dir);

  const assistant = new OpenAIAssistant("gpt-4o", dir);
  assistant.addTools(
    new FileTools.LoggingReader(),
    new FileTools.LoggingWriter(),
    new FileTools.LoggingShellTool(),
    new PromptTool(),
  );
  assistant.send(prompt!).then((x) => console.log(x.content), console.error);
} else if (false)
  new OpenAIChatWorker().run(last(process.argv) as string);
else if (false) {
  const prompt = process.argv.pop();
  const dir = process.argv.pop();
  new OpenAIAssistantManager(dir).run(prompt!);
} else {
  new WorkflowManager().createProcess("robots/xml-feed-reader.yml").run();
}
