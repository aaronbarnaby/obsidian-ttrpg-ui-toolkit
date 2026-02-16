import { App, MarkdownPostProcessorContext } from "obsidian";

export abstract class BaseView {
  public app: App;
  public abstract codeblock: string;

  constructor(app: App) {
    this.app = app;
  }

  public abstract render(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): HTMLElement | string | void;

  public register(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const div = el.createEl("div");
    try {
      const result = this.render(source, el, ctx);

      if (result instanceof HTMLElement) {
        div.appendChild(result);
      } else if (typeof result === "string") {
        div.innerHTML = result;
      }
    } catch (e) {
      console.error("Error rendering code block", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      div.innerHTML = `<div class="notice">Error parsing stats block: ${errorMessage}</div>`;
    }
  }
}

