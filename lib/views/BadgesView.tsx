import { BaseView } from "./BaseView";
import { App, MarkdownPostProcessorContext } from "obsidian";
import { ReactMarkdown } from "./ReactMarkdown";
import { FileContext, useFileContext } from "./filecontext";
import { parseYamlSafe } from "../utils/yaml";
import { BadgeItem, BadgesBlock, StatItem, StatsBlock } from "../../types/core";
import { hasTemplateVariables, createTemplateContext, TemplateContext, processTemplate } from "../utils/template";

import { BadgesRow } from "../components/badges";
import * as ReactDOM from "react-dom/client";
import * as React from "react";
import { StatsGridItems } from "../components/stat-cards";

export class BadgesView extends BaseView {
  public codeblock = "badges";

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const cmp = new StatsLikeComponent(el, source, this.app, ctx);
    ctx.addChild(cmp);
  }
}

export class StatsView extends BaseView {
  public codeblock = "stats";

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const cmp = new StatsLikeComponent(el, source, this.app, ctx);
    cmp.layout = "cards";
    ctx.addChild(cmp);
  }
}

class StatsLikeComponent extends ReactMarkdown {
  layout: "badges" | "cards" = "badges"; // Default layout
  app: App;
  ctx: FileContext;
  source: string; // The source code of the badges block
  isTemplate: boolean; // Indicates that atleast one badge is a template

  constructor(el: HTMLElement, source: string, app: App, ctx: MarkdownPostProcessorContext) {
    super(el);
    this.source = source;
    this.app = app;
    this.ctx = useFileContext(app, ctx);
  }

  async onload() {
    this.setupListeners();
    await this.render();
  }

  private setupListeners() {
    this.addUnloadFn(
      this.ctx.onFrontmatterChange((_) => {
        if (!this.isTemplate) {
          return;
        }

        // Re-Render
        this.render();
      })
    );

    this.addUnloadFn(
      this.ctx.onAbilitiesChange(() => {
        if (!this.isTemplate) {
          return;
        }

        // Re-Render
        this.render();
      })
    )
  }

  private async render() {
    try {
      const doc = (parseYamlSafe<BadgesBlock | StatsBlock>(this.source));
      const items = Array.isArray(doc.items) ? doc.items : [];

      // Check if any items contain template variables
      const hasTemplates = items.some(
        (item: Partial<BadgeItem>) =>
          hasTemplateVariables(String(item.label || "")) || hasTemplateVariables(String(item.value || ""))
      );

      let templateContext: TemplateContext | null = null;
      if (hasTemplates) {
        templateContext = await createTemplateContext(this.app, this.containerEl, this.ctx);
        this.isTemplate = true;
      }

      if (!this.reactRoot) {
        this.reactRoot = ReactDOM.createRoot(this.containerEl);
      }

      if (this.layout === "badges") {
        const badgesBlock: BadgesBlock = {
          items: items.map((item: Partial<BadgeItem>) => {
            let label = String(item.label || "");
            let value = String(item.value || "");
  
            if (templateContext) {
              if (hasTemplateVariables(label)) {
                label = processTemplate(label, templateContext);
              }
              if (hasTemplateVariables(value)) {
                value = processTemplate(value, templateContext);
              }
            }
  
            return {
              label,
              value,
            };
          }),
          dense: Boolean(doc.dense),
        };
        
        this.reactRoot.render(React.createElement(BadgesRow, { data: badgesBlock }));
      } else if (this.layout === "cards") {
        const statsBlock: StatsBlock = {
          items: items.map((item: Partial<StatItem>) => {   
            let label = String(item.label || "");
            let value = String(item.value || "");
            let sublabel = String(item.sublabel || "");
  
            if (templateContext) {
              if (hasTemplateVariables(label)) {
                label = processTemplate(label, templateContext);
              }
              if (hasTemplateVariables(value)) {
                value = processTemplate(value, templateContext);
              }
              if (hasTemplateVariables(sublabel)) {
                sublabel = processTemplate(sublabel, templateContext);
              }
            } 
  
            return {
              label,
              value,
              sublabel,
            };
          }),
          dense: Boolean(doc.dense),
          grid: {
            columns: (doc as StatsBlock).grid?.columns ?? 1,
          },
        };

        this.reactRoot.render(React.createElement(StatsGridItems, statsBlock));
      }
    } catch {
      // TODO: Invalid Block
      throw new Error("Invalid badges block");
    }
  }
}
