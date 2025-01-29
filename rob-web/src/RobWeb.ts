export interface RobWeb {
  cwd(): string;
  ls(path: string[]): string[];
  send(prompt: string): RobWeb.Message;
}

export namespace RobWeb {
  export const KEYS = ["cwd", "ls", "send"] as const;

  export interface Message {
    content: string;
  }

  export type Async = {
    [K in keyof RobWeb]: RobWeb[K] extends (...args: any[]) => infer R
      ? (...args: Parameters<RobWeb[K]>) => Promise<R>
      : never;
  };
}
