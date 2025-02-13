// import React, { useEffect, useRef } from "react";
// import styles from "./AutoscrollView.module.css";

import { css, html, LitElement } from "lit";

// export function AutoscrollView(props: AutoscrollView.Props) {
//   const ref = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const container = ref.current;
//     if (!container) return;
//     container.scrollTop = container.scrollHeight;
//   }, [props.children]);

//   return <div ref={ref} className={styles.root}>{props.children}</div>;
// }

// export namespace AutoscrollView {
//   export interface Props {
//     children?: React.ReactNode;
//   }
// }


export class AutoscrollView extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    .root {
      flex: 1 1 auto;
      overflow-y: auto;
      max-height: 100%;
    }
  `;

  render() {
    return html`<div class=root><slot /></div>`;
  }
}

customElements.define("autoscroll-view", AutoscrollView);
