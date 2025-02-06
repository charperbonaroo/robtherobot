import { RobWeb } from "rob-web";
import React from "react";
import { MessageListItem } from "./MessageListItem";

export function ResponseListItem({ response }: ResponseListItem.Props) {
  if (response.type === "message")
    return <MessageListItem message={response.message} />
  else if (response.type === "tool_call") {
    const toolCall = response.toolCall;
    if (toolCall.name === "read-file") {
      const lines = (toolCall.result as any).lines;
      return <div>
        <div>Read <code>
          <strong>{toolCall.params.path as any}</strong>:{toolCall.params.lineNumber as any}:{toolCall.params.lineCount as any}</code>
        </div>
        {lines
          ? <pre>{lines.map((line: any) => line.content + "\n")}</pre>
          : <pre>{JSON.stringify(toolCall, null, 2)}</pre>}
      </div>;
    }
    else {
      return <pre>{JSON.stringify(response.toolCall, null, 2)}</pre>
    }
  }
}

export namespace ResponseListItem {
  export interface Props {
    response: RobWeb.Response;
  }
}
