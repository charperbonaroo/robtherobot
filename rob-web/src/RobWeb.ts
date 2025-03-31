export interface RobWeb {
  cwd(): AsyncGenerator<void, string, void>;
  ls(path: string[]): AsyncGenerator<void, string[], void>;
  send(prompt: string): AsyncGenerator<RobWeb.Response, true, void>;
  lastResponses(limit: number): AsyncGenerator<void, RobWeb.Response[], void>;
}

export namespace RobWeb {
  export const KEYS = ["cwd", "ls", "send", "lastResponses"] as const;

  export interface ToolCall {
    id: string;
    name: string,
    params: Record<string, unknown>,
  }

  export interface Message {
    toolCalls: ToolCall[];
    content: string|null;
    role: string;
  }

  export interface MessageResponse {
    type: "message";
    message: Message;
  }

  export interface ToolResult {
    id: string;
    result: unknown;
  }

  export interface ToolResultResponse {
    type: "tool_result",
    toolResult: ToolResult;
  }

  export type Response = MessageResponse|ToolResultResponse;
}
