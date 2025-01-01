export interface Config {
  name: string;
  entrypoint: string;
  variables: Record<string, Config.Variable>;
  steps: Record<string, Config.Step>;
}

export namespace Config {
  export interface Variable {
    name: string;
    type: string;
    description: string;
  }

  export interface Step {
    type: string;
    instruction: string;
    name: string;
    next: string[];
  }
}
