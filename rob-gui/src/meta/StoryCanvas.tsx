import React from "react";
import styles from "./StoryCanvas.module.css";
import { classNames } from "../util";

export interface StoryCanvasProps {
  children?: React.ReactNode;
}

export function StoryCanvas(props: StoryCanvasProps) {
  return <div className={classNames("card", styles.root)}>
    <div className={classNames("card-body", styles.body)}>
      {props.children}
    </div>
  </div>;
}
