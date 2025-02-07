import { RobWeb } from "rob-web";
import styles from "./ResponseList.module.css";
import React, { useMemo } from "react";
import { classNames } from "../util/classNames";
import { ResponseListItem } from "./ResponseListItem";

export function ResponseList(props: ResponseList.Props) {
  const className = (response: RobWeb.Response) => classNames(
    styles.response,
    styles[response.type],
    response.type == "message" ? styles[response.message.role] : ""
  );

  const toolCalls = useMemo(() => Object.fromEntries(props.responses
    .flatMap((response) => response.type === "message"
      ? response.message.toolCalls.map((toolCall) => [toolCall.id, toolCall])
      : [])), [props.responses]);

  return <div className={classNames(styles.root)}>
    {props.responses.map((response, i) => <div key={i} className={className(response)}>
      <ResponseListItem response={response} toolCalls={toolCalls} />
    </div>)}
  </div>
}

export namespace ResponseList {
  export interface Props {
    responses: RobWeb.Response[];
  }
}
