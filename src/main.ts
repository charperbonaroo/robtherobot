import { last } from "lodash";
import { OpenAIChatWorker } from "./OpenAIChatWorker";
import { OpenAIAssistantManager } from "./OpenAIAssistantManager";
import { WorkflowManager } from "./WorkflowManager";

if (false)
  new OpenAIChatWorker().run(last(process.argv) as string);
else if (true) {
  const prompt = process.argv.pop();
  const dir = process.argv.pop();
  new OpenAIAssistantManager(dir).run(prompt!);

} else {
  new WorkflowManager().createProcess("robots/xml-feed-reader.yml").run();
}
