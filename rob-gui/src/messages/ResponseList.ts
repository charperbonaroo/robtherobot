import { css, html, LitElement, PropertyValues } from "lit";
import { RobWeb } from "rob-web";

export class ResponseList extends LitElement {
  declare responses: RobWeb.Response[]|null;

  static properties = {
    responses: { type: Array }
  };

  static styles = css`
    .root {
      display: flex;
      flex-direction: column;
    }

    .response {
      margin-bottom: 8px;
      max-width: 80%;
    }

    .response[type=user] {
      align-self: flex-end;
    }
  `

  private toolCalls: Record<string, RobWeb.ToolCall> = {};

  render() {
    return html`
      <div class=root>
        ${this.responses?.map((response) => html`
          <div class=response data-type=${response.type}>
            <response-list-item .response=${response} .toolCalls=${this.toolCalls} />
          </div>
        `)}
      </div>
    `
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

customElements.define("response-list", ResponseList);
