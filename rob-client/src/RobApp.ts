import { css, html, LitElement } from "lit";
import { RobWeb } from "rob-web";
import { RobWebClient } from "./service/RobWebClient";
import { Bootstrap } from "rob-gui";
import { Task } from '@lit/task';
import { getGeneratorReturnValue } from "./util/getGeneratorReturnValue";

export class RobApp extends LitElement {
  declare loading: boolean;
  declare responses: RobWeb.Response[];

  static properties = {
    loading: { type: Boolean },
    responses: { type: Array }
  };

  static styles = css`
    :host {
      display: contents;
    }

    .root {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
  `

  constructor() {
    super();
    this.responses = [];
    this.loading = false;
  }

  lastResponsesTask = new Task(this, {
    task: () => getGeneratorReturnValue(RobWebClient.instance.lastResponses(30)),
    args: () => []
  })

  render() {
    return html`
      ${Bootstrap.link()}
      <div class=root>
        <autoscroll-view>
          <div class=p-4>
            ${this.lastResponsesTask.render({
              loading: () => html`<div class="alert alert-info">Loading</div>`,
              error: (e: unknown) => html`<div class="alert alert-danger">Error: ${(e as Error).message}</div>`,
              complete: (lastResponses) => html`<response-list .responses=${lastResponses} />`
            })}
            <response-list .responses=${this.responses} />
          </div>
        </autoscroll-view>
        <div class=p-4>
          <message-form .disabled=${this.loading} @message=${this.onMessage} />
        </div>
      </div>
    `
  }

  async onMessage(event: CustomEvent) {
    const content = event.detail.message as string;
    this.loading = true;
    for await (const response of RobWebClient.instance.send(content))
      this.responses = [...this.responses, response];
    this.loading = false;
  }
}

customElements.define("rob-app", RobApp);
