import { html, LitElement, TemplateResult } from 'lit';
import { RobWeb } from 'rob-web';
import { Bootstrap } from '../util';

export class ToolResponseItem extends LitElement {
  declare toolCall: RobWeb.ToolCall;
  declare toolResult: RobWeb.ToolResult['result'];

  static properties = {
    toolCall: { type: Object, attribute: false },
    toolResult: { type: Object, attribute: false }
  }

  render() {
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
      <div>
        <div>${header}</div>
        <pre>${content}</pre>
      </div>
    `;
  }
}

customElements.define('tool-response-item', ToolResponseItem);
