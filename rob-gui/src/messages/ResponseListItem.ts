import { RobWeb } from "rob-web";
import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("response-list-item")
export class ResponseListItem extends LitElement {
  @property({ type: Object, attribute: false })
  public response?: RobWeb.Response;

  @property({ type: Object, attribute: false })
  public toolCalls?: Record<string, RobWeb.ToolCall>;

  render() {
    if (!this.response)
      return nothing;
    if (this.response.type === "message") {
      const message = this.response.message;
      return message.content
        ? html`<message-list-item message-role=${message.role} content=${message.content} />` : ``;
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
