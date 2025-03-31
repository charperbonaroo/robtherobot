import { css, html, LitElement, PropertyValues } from "lit";
import { RobWeb } from "rob-web";
import { customElement, property } from 'lit/decorators.js';

@customElement("response-list")
export class ResponseList extends LitElement {
  @property({ type: Array, attribute: false })
  public responses?: RobWeb.Response[]|null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }

    response-list-item {
      margin-bottom: 8px;
      max-width: 80%;
    }

    response-list-item[data-role=user] {
      align-self: flex-end;
    }
  `

  private toolCalls: Record<string, RobWeb.ToolCall> = {};

  render() {
    return this.responses?.map(this.renderResponse.bind(this));
  }

  private renderResponse(response: RobWeb.Response) {
    const role = response.type === "message" ? response.message.role : response.type;
    return html`<response-list-item data-role=${role} .response=${response} .toolCalls=${this.toolCalls} />`
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has("responses")) {
      const entries = this.responses?.flatMap((response) => response.type === "message"
        ? response.message.toolCalls.map((toolCall) => [toolCall.id, toolCall])
        : []) ?? [];
      this.toolCalls = Object.fromEntries(entries);
    }
  }
}
