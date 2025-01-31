import { RobWeb } from "rob-web";
import styles from "./MessageListItem.module.css";
import React from "react";
import { classNames } from "../util/classNames";

export function MessageListItem(props: MessageListItem.Props) {
  return <div className={classNames("card", "p-1", styles.root, styles[props.message.role])}>
    <div className={styles.content}>{props.message.content}</div>
  </div>
}

export namespace MessageListItem {
  export interface Props {
    message: RobWeb.Message;
  }
}
