import { css, html, LitElement, unsafeCSS } from "lit"
import { Bootstrap } from "../util"
import checkerboardUrl from "./checkerboard.png";
import { customElement } from 'lit/decorators.js';

@customElement("story-canvas")
export class StoryCanvas extends LitElement {
  static styles = css`
    .root {
      overflow: hidden;
    }

    .body {
      background-image: url(${unsafeCSS(checkerboardUrl)});
      background-position: top left;
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
