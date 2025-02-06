import { RobWeb } from "rob-web";
import React from "react";
import { classNames } from "../util/classNames";
import { marked } from "marked";
import styles from "./MessageListItem.module.css";

export function MessageListItem({ message }: MessageListItem.Props) {
  return <div className={classNames(styles.root, "mb-2", "rounded-3", styles[message.role])}>
    <div className={classNames(styles.content, styles.markdown)}
          dangerouslySetInnerHTML={{ __html: marked(message.content ?? "") }} />
  </div>;
}

export namespace MessageListItem {
  export interface Props {
    message: RobWeb.Message;
  }
}
