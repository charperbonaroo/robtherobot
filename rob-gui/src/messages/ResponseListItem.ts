import { RobWeb } from "rob-web";
import { html, LitElement } from "lit";

export class ResponseListItem extends LitElement {
  static properties = {
    response: { type: Object, attribute: false },
    toolCalls: { type: Object, attribute: false }
  }

  declare response: RobWeb.Response;
  declare toolCalls: Record<string, RobWeb.ToolCall>;

  render() {
    if (this.response.type === "message") {
      const message = this.response.message;
      return html`<message-list-item role=${message.role} content=${message.content} />`;
    } else if (this.response.type === "tool_result") {
      const toolResult = this.response.toolResult.result;
      const toolCall = this.toolCalls && this.toolCalls[this.response.toolResult.id];
      if (toolResult && toolCall) {
        return html`<tool-response-item .toolResult=${toolResult} .toolCall=${toolCall} />`;
      } else {
        return html`<pre>${JSON.stringify({ toolCall, toolResult }, null, 2)}</pre>`
      }
    } else {
      return html`<pre>${JSON.stringify(this.response, null, 2)}</pre>`;
    }
  }
}

customElements.define("response-list-item", ResponseListItem);
