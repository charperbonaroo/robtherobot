import { RobWeb } from "rob-web";
import React from "react";

export function ToolResponseItem({ toolCall, toolResult }: ToolResponseItem.Props) {
  console.log({ toolResult, toolCall });
  const lines = (toolResult as any).lines;
  const content = lines.map((line: any) => line.content).join("\n").trim();
  let header: React.ReactNode;

  const params = toolCall.params;

  if (toolCall.name === "shell-tool") {
    header = <code className="text-danger">{params.cwd as string}$ {params.command as string}</code>
  } else {
    header = <code>{toolCall.name}</code>
  }

  return <div>
    <div>{header}</div>
    <pre>{content}</pre>
  </div>;
}

export namespace ToolResponseItem {
  export interface Props {
    toolCall: RobWeb.ToolCall;
    toolResult: RobWeb.ToolResult["result"];
  }
}
