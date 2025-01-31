import { RobWeb } from "rob-web";
import React from "react";
import { classNames } from "../util/classNames";
import { marked } from "marked";
import styles from "./MessageListItem.module.css";

export function MessageListItem(props: MessageListItem.Props) {
  const contentHtml = marked(props.message.content);
  return <div className={classNames(styles.root, "mb-2", "rounded-3", styles[props.message.role])}>
    <div className={styles.content} dangerouslySetInnerHTML={{ __html: contentHtml }} />
  </div>;
}

export namespace MessageListItem {
  export interface Props {
    message: RobWeb.Message;
  }
}
