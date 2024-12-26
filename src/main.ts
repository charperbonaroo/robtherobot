import { last } from "lodash";
import { OpenAIChatWorker } from "./OpenAIChatWorker";
import { OpenAIAssistant } from "./OpenAIAssistant";

if (false)
  new OpenAIChatWorker().run(last(process.argv) as string);
else
  new OpenAIAssistant().run(last(process.argv) as string);
