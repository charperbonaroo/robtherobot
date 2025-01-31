import { RobWeb } from "rob-web";
import styles from "./MessageListItem.module.css";
import React from "react";
import { classNames } from "../util/classNames";
import { marked } from "marked";

export function MessageListItem(props: MessageListItem.Props) {
  const contentHtml = marked(props.message.content);
  return <div className={classNames("card", "p-1", styles.root, styles[props.message.role])}>
    <div className={styles.content} dangerouslySetInnerHTML={{ __html: contentHtml }} />
  </div>;
}

export namespace MessageListItem {
  export interface Props {
    message: RobWeb.Message;
  }
}
