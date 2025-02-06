import { RobWeb } from "rob-web";
import { RobWebClient } from "../service/RobWebClient";
import { Monad } from "../util/Monad";
import { useGeneratorReturnValue } from "./useGeneratorReturnValue";

type AsyncGeneratorReturnType<T> = T extends AsyncGenerator<any, infer U, any> ? U : never;

export function useClient<K extends keyof RobWeb>(
  cmd: K,
  ...args: Parameters<RobWeb[K]>
): Monad<AsyncGeneratorReturnType<RobWeb[K]>> {
  if (!RobWeb.KEYS.includes(cmd))
    throw new Error(`useClient called with command ${cmd}, which is invalid`);
  return useGeneratorReturnValue((RobWebClient.instance[cmd] as any)(...args), []);
}
