export interface AITool {
  name: string;
  description: string;
  params: AITool.Params;
  run: (params: Record<string, unknown>, directory: string) => Promise<unknown>;
}

export namespace AITool {
  export type Params = Record<string, Param>;
  export type Param = { type: string, enum?: string[], description: string };
}
