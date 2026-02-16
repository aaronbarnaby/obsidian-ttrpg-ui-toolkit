import { App, MarkdownPostProcessorContext } from "obsidian";
import * as React from "react";
import { BaseView } from "@/features/shared/BaseView";
import { ReactMarkdown } from "@/features/shared/ReactMarkdown";
import { parseYamlSafe } from "@/lib/utils/yaml";
import { Feature } from "@/types/features";
import { FeaturesBlock } from "@/components/features/FeaturesBlock";
import { ensureReactRoot } from "@/lib/utils/react-root";

export class FeaturesView extends BaseView {
  public codeblock = "features";

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    ctx.addChild(new FeaturesMarkdown(el, source, this.app));
  }
}

class FeaturesMarkdown extends ReactMarkdown {
  constructor(
    el: HTMLElement,
    private readonly source: string,
    private readonly app: App
  ) {
    super(el);
  }

  async onload(): Promise<void> {
    this.renderBlock();
  }

  private renderBlock(): void {
    try {
      const doc = parseYamlSafe<Feature>(this.source);
      const data: Feature = {
        passives: Array.isArray(doc.passives) ? doc.passives : [],
        actions: Array.isArray(doc.actions) ? doc.actions : [],
        styles: doc.styles,
      };
      this.reactRoot = ensureReactRoot(this.reactRoot, this.containerEl);
      this.reactRoot.render(React.createElement(FeaturesBlock, { data }));
    } catch {
      throw new Error("Invalid features block");
    }
  }
}

