import { css, html, LitElement } from "lit";

export class AutoscrollView extends LitElement {
  static styles = css`
    :host {
      flex: 1 1 auto;
      overflow-y: auto;
      max-height: 100%;
    }
  `;

  render() {
    return html`<div class=content><slot /></div>`;
  }

  firstUpdated() {
    new ResizeObserver(() => this.scrollToBottom()).observe(
      this.shadowRoot!.querySelector(".content")!);

    this.scrollToBottom();
  }

  private scrollToBottom() {
    this.scrollTop = this.scrollHeight;
  }
}

customElements.define("autoscroll-view", AutoscrollView);
