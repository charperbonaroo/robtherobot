import { html } from "lit";

export namespace Bootstrap {
  export let url = `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`;

  export function link() {
    return html`<link crossorigin="anonymous" rel="stylesheet" href=${Bootstrap.url}>`
  }
}
