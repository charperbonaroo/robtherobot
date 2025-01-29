export interface RobTheRobot {
  cwd(): string;
  hello(): string;
}

export namespace RobTheRobot {
  export const KEYS = ["cwd", "hello"] as const;

  export type Async = {
    [K in keyof RobTheRobot]: RobTheRobot[K] extends (...args: any[]) => infer R
      ? (...args: Parameters<RobTheRobot[K]>) => Promise<R>
      : never;
  };
}
