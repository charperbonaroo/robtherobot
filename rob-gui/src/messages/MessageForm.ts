import { css, html, LitElement } from "lit";
import { Bootstrap, TextAreas } from "../util";
import { customElement, property } from 'lit/decorators.js';

@customElement("message-form")
export class MessageForm extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    form {
      display: contents;
    }
  `

  @property()
  public disabled?: boolean;

  render() {
    return html`
      ${Bootstrap.link()}
      <form @submit=${this.onSubmit}>
        <div class=input-group>
          <textarea class=form-control rows=1 name=message></textarea>
          <button type="submit" .disabled=${this.disabled} class="btn btn-primary">Send</button>
        </div>
      </form>
    `;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.handleSubmit();
  }

  handleSubmit() {
    const form = this.shadowRoot!.querySelector("form") as HTMLFormElement;
    const detail = Object.fromEntries(new FormData(form).entries());
    form.reset();

    this.dispatchEvent(new CustomEvent("message", {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  firstUpdated() {
    const textarea = this.shadowRoot!.querySelector("textarea") as HTMLTextAreaElement;
    TextAreas.autogrow(textarea);
    TextAreas.onEnter(textarea, () => this.handleSubmit());
  }
}
