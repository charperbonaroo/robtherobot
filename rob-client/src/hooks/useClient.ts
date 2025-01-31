import { RobWeb } from "rob-web";
import { RobWebClient } from "../service/RobWebClient";
import { Monad } from "../util/Monad";
import { usePromise } from "./usePromise";

export function useClient<K extends keyof RobWeb>(
  cmd: K,
  ...args: Parameters<RobWeb[K]>
): Monad<ReturnType<RobWeb[K]>> {
  return usePromise((RobWebClient.instance[cmd] as any)(...args), []);
}
