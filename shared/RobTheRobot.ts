export interface RobTheRobot {
  cwd(): string;
  ls(path: string[]): string[];
}

export namespace RobTheRobot {
  export const KEYS = ["cwd", "ls"] as const;

  export type Async = {
    [K in keyof RobTheRobot]: RobTheRobot[K] extends (...args: any[]) => infer R
      ? (...args: Parameters<RobTheRobot[K]>) => Promise<R>
      : never;
  };
}
