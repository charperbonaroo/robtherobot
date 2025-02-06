import { RobWeb } from "rob-web";
import styles from "./ResponseList.module.css";
import React from "react";
import { classNames } from "../util/classNames";
import { ResponseListItem } from "./ResponseListItem";

export function ResponseList(props: ResponseList.Props) {
  const className = (response: RobWeb.Response) => classNames(
    styles.response,
    styles[response.type],
    response.type == "message" ? styles[response.message.role] : ""
  );
  return <div className={classNames(styles.root)}>
    {props.responses.map((response, i) => <div key={i} className={className(response)}>
      <ResponseListItem response={response} />
    </div>)}
  </div>
}

export namespace ResponseList {
  export interface Props {
    responses: RobWeb.Response[];
  }
}
