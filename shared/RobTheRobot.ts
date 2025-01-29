export interface RobTheRobot {
  cwd(): string;
  ls(path: string[]): string[];
  send(prompt: string): RobTheRobot.Message;
}

export namespace RobTheRobot {
  export const KEYS = ["cwd", "ls", "send"] as const;

  export interface Message {
    content: string;
  }

  export type Async = {
    [K in keyof RobTheRobot]: RobTheRobot[K] extends (...args: any[]) => infer R
      ? (...args: Parameters<RobTheRobot[K]>) => Promise<R>
      : never;
  };
}
