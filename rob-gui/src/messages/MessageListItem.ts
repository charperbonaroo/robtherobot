import { css, html, LitElement } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import { Bootstrap } from "../util";
import { customElement, property } from 'lit/decorators.js';

@customElement("message-list-item")
export class MessageListItem extends LitElement {
  @property()
  public content?: string|null;

  @property()
  public messageRole?: string;

  static styles = css`
    :host {
      display: block;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      overflow: hidden;
    }

    :host([message-role="user"]) {
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
