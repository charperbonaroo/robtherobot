import { last } from "lodash";
import { OpenAIChatWorker } from "./OpenAIChatWorker";

new OpenAIChatWorker().run(last(process.argv) as string);
