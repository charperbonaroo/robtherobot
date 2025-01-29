import { RobTheRobot } from "../../../rob-web/src/RobWeb";
import { RobTheRobotClient } from "../service/RobTheRobotClient";
import { Monad } from "../util/Monad";
import { usePromise } from "./usePromise";

export function useClient<K extends keyof RobTheRobot>(
  cmd: K,
  ...args: Parameters<RobTheRobot[K]>
): Monad<ReturnType<RobTheRobot[K]>> {
  return usePromise((RobTheRobotClient.instance[cmd] as any)(...args), []);
}
