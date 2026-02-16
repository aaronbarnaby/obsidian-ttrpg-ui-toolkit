import { BaseView } from "./BaseView";
import { App, MarkdownPostProcessorContext } from "obsidian";
import { ReactMarkdown } from "./ReactMarkdown";
import { parseYamlSafe } from "../utils/yaml";
import { Feature } from "../../types/features";
import { FeaturesBlock } from "../components/features";
import * as ReactDOM from "react-dom/client";
import * as React from "react";

export class FeaturesView extends BaseView {
  public codeblock = "features";

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const cmp = new FeaturesComponent(el, source);
    ctx.addChild(cmp);
  }
}

class FeaturesComponent extends ReactMarkdown {
  source: string;

  constructor(el: HTMLElement, source: string) {
    super(el);
    this.source = source;
  }

  async onload() {
    this.render();
  }

  private render() {
    try {
      const doc = parseYamlSafe<Feature>(this.source);

      const data: Feature = {
        passives: Array.isArray(doc.passives) ? doc.passives : [],
        actions: Array.isArray(doc.actions) ? doc.actions : [],
        styles: doc.styles,
      };

      if (!this.reactRoot) {
        this.reactRoot = ReactDOM.createRoot(this.containerEl);
      }

      this.reactRoot.render(React.createElement(FeaturesBlock, { data }));
    } catch {
      throw new Error("Invalid features block");
    }
  }
}
