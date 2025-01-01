import { last } from "lodash";
import { OpenAIChatWorker } from "./OpenAIChatWorker";
import { OpenAIAssistantManager } from "./OpenAIAssistantManager";
import { WorkflowManager } from "./WorkflowManager";

if (false)
  new OpenAIChatWorker().run(last(process.argv) as string);
else if (false)
  new OpenAIAssistantManager().run(last(process.argv) as string);
else {
  new WorkflowManager().createProcess("robots/xml-feed-reader.yml").run();
}
