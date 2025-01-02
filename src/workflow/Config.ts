import { chain } from "lodash";

export interface Config {
  name: string;
  entrypoint: string;
  variables: Record<string, Config.Variable>;
  steps: Record<string, Config.Step>;
}

export namespace Config {
  export function of(config: Config): Config {
    return {
      name: config.name,
      entrypoint: config.entrypoint,
      variables: chain(config.variables)
        .values()
        .map((variable) => [variable.name, Variable.of(variable)])
        .fromPairs()
        .value(),
      steps: chain(config.steps)
        .values()
        .map((step) => [step.name, Step.of(step)])
        .fromPairs()
        .value()
    };
  }

  export interface Variable {
    name: string;
    type: string;
    description: string;
  }

  export namespace Variable {
    export function of(variable: Variable): Variable {
      return {
        name: variable.name,
        type: variable.type,
        description: variable.description,
      };
    }
  }

  export interface Step {
    type: string;
    instruction: string;
    name: string;
    next: string[];
  }

  export namespace Step {
    export function of(step: Step): Step {
      return {
        name: step.name,
        type: step.type,
        instruction: step.instruction,
        next: step.next.slice(),
      };
    }
  }
}
