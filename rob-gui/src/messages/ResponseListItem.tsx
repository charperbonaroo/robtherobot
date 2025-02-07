import { RobWeb } from "rob-web";
import React from "react";
import { MessageListItem } from "./MessageListItem";
import { ToolResponseItem } from "./ToolResponseItem";

export function ResponseListItem({ response, toolCalls }: ResponseListItem.Props) {
  if (response.type === "message")
    return <MessageListItem message={response.message} />
  else if (response.type === "tool_result") {
    const toolResult = response.toolResult.result;
    const toolCall = toolCalls && toolCalls[response.toolResult.id];
    if (toolResult && toolCall) {
      return <ToolResponseItem toolResult={toolResult} toolCall={toolCall} />;
    } else {
      return <pre>{JSON.stringify({ toolCall, toolResult }, null, 2)}</pre>
    }
  } else {
    return <pre>{JSON.stringify(response, null, 2)}</pre>
  }
}

export namespace ResponseListItem {
  export interface Props {
    response: RobWeb.Response;
    toolCalls?: Record<string, RobWeb.ToolCall>;
  }
}
