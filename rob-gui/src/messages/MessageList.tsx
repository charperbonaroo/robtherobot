import { RobWeb } from "rob-web";
import styles from "./MessageList.module.css";
import React from "react";
import { MessageListItem } from "./MessageListItem";
import { classNames } from "../util/classNames";

export function MessageList(props: MessageList.Props) {
  return <div className={classNames(styles.root)}>
    {props.messages.map((message, i) => <div key={i} className={classNames(styles.message, styles[message.role])}>
      <MessageListItem message={message} />
    </div>)}
  </div>
}

export namespace MessageList {
  export interface Props {
    messages: RobWeb.Message[];
  }
}
