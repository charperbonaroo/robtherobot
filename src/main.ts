import { last } from "lodash";
import { OpenAIChatWorker } from "./OpenAIChatWorker";
import { OpenAIAssistantManager } from "./OpenAIAssistantManager";

if (false)
  new OpenAIChatWorker().run(last(process.argv) as string);
else
  new OpenAIAssistantManager().run(last(process.argv) as string);
