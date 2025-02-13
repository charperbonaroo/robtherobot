import { css, html, LitElement, unsafeCSS } from "lit"
import { Bootstrap } from "../util"
import checkerboardUrl from "./checkerboard.png";

export class StoryCanvas extends LitElement {
  static styles = css`
    .root {
      overflow: hidden;
    }

    .body {
      background-image: url(${unsafeCSS(checkerboardUrl)});
      background-position: center center;
    }
  `

  render() {
    return html`
      ${Bootstrap.link()}
      <div class="card root">
        <div class="card-body body">
          <slot />
        </div>
      </div>
    `
  }
}

customElements.define("story-canvas", StoryCanvas);
