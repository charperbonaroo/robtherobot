import React, { useEffect, useRef } from "react";
import styles from "./AutoscrollView.module.css";

export function AutoscrollView(props: AutoscrollView.Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [props.children]);

  return <div ref={ref} className={styles.root}>{props.children}</div>;
}

export namespace AutoscrollView {
  export interface Props {
    children?: React.ReactNode;
  }
}
