import { html, LitElement, nothing, TemplateResult } from 'lit';
import { RobWeb } from 'rob-web';
import { Bootstrap } from '../util';
import { customElement, property } from "lit/decorators.js";

@customElement("tool-response-item")
export class ToolResponseItem extends LitElement {
  @property({ type: Object, attribute: false })
  public toolCall?: RobWeb.ToolCall;

  @property({ type: Object, attribute: false })
  public toolResult?: RobWeb.ToolResult['result'];

  render() {
    if (!this.toolCall) return nothing;

    const lines = (this.toolResult as any).lines as { content: string }[];
    const content = lines.map((line: any) => line.content).join('\n').trim();
    let header: TemplateResult<1>;

    const params = this.toolCall.params;

    if (this.toolCall.name === 'shell-tool') {
      header = html`<code class="text-danger">${params.cwd}$ ${params.command}</code>`;
    } else {
      header = html`<code>${this.toolCall.name}</code>`;
    }

    return html`
      ${Bootstrap.link()}
      <div>${header}</div>
      <pre>${content}</pre>
    `;
  }
}
