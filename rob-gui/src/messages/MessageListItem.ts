import { css, html, LitElement } from "lit";
import { RobWeb } from "rob-web";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import { Bootstrap } from "../util";

export class MessageListItem extends LitElement implements Pick<RobWeb.Message, "role"|"content"> {
  declare content: string|null;
  declare role: string;

  static properties = {
    content: { type: String },
    role: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      overflow: hidden;
    }

    :host([role="user"]) {
      background-color: #eee;
      padding: 10px;
    }

    p:last-child {
      margin-bottom: 0;
    }
  `;

  render() {
    return html`
      ${Bootstrap.link()}
      ${unsafeHTML(marked(this.content ?? "", { async: false }))}
    `;
  }
}

customElements.define('message-list-item', MessageListItem);
