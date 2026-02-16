import { BaseView } from "./BaseView";
import { App, MarkdownPostProcessorContext } from "obsidian";
import { ReactMarkdown } from "./ReactMarkdown";
import { parseYamlSafe } from "../utils/yaml";
import { useFileContext } from "./filecontext";
import { resolveEquipmentList } from "../utils/equipment";
import { EquipmentBlock, EquipmentBlockStyles } from "../components/equipment";
import { diceInlinePostProcessor } from "../features/dice/dicePostProcessor";
import * as ReactDOM from "react-dom/client";
import { flushSync } from "react-dom";
import * as React from "react";
import { DHEquipmentWithPath } from "../utils/equipment";

export type EquipmentBlockYaml = {
  type?: "daggerheart" | "dnd";
  items?: unknown[];
  styles?: EquipmentBlockStyles
};

type PluginLike = { settings: { diceResultDuration: number } };

export class EquipmentView extends BaseView {
  public codeblock = "equipment";
  private plugin: PluginLike;

  constructor(app: App, plugin: PluginLike) {
    super(app);
    this.plugin = plugin;
  }

  public render(
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): void {
    const cmp = new EquipmentComponent(
      el,
      source,
      this.app,
      ctx,
      this.plugin.settings.diceResultDuration
    );
    ctx.addChild(cmp);
  }
}

class EquipmentComponent extends ReactMarkdown {
  source: string;
  app: App;
  ctx: MarkdownPostProcessorContext;
  diceResultDuration: number;
  resolvedItems: DHEquipmentWithPath[] = [];
  blockType: "daggerheart" | "dnd" = "daggerheart";

  constructor(
    el: HTMLElement,
    source: string,
    app: App,
    ctx: MarkdownPostProcessorContext,
    diceResultDuration: number
  ) {
    super(el);
    this.source = source;
    this.app = app;
    this.ctx = ctx;
    this.diceResultDuration = diceResultDuration;
  }

  async onload() {
    await this.loadAndRender();
    this.setupListeners();
  }

  private setupListeners() {
    const fc = useFileContext(this.app, this.ctx);
    this.addUnloadFn(
      fc.onFrontmatterChange(() => {
        this.loadAndRender();
      })
    );
  }

  private async loadAndRender() {
    try {
      const doc = parseYamlSafe<EquipmentBlockYaml>(this.source);
      const blockType =
        doc.type === "dnd" ? "dnd" : ("daggerheart" as const);
      const blockItems = Array.isArray(doc.items) ? doc.items : [];
      const fc = useFileContext(this.app, this.ctx);
      const frontmatter = fc.frontmatter();
      const equipped = frontmatter.equipped;

      this.resolvedItems = await resolveEquipmentList(
        this.app,
        this.ctx.sourcePath,
        blockItems,
        equipped
      );
      this.blockType = blockType;
      this.renderContent(doc.styles);
    } catch (e) {
      console.error("Equipment block error", e);
      this.resolvedItems = [];
      this.blockType = "daggerheart";
      this.renderContent({ hideWrapper: false });
    }
  }

  private renderContent(styles: EquipmentBlockStyles | undefined) {
    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this.containerEl);
    }
    flushSync(() => {
      this.reactRoot!.render(
        React.createElement(EquipmentBlock, {
          type: this.blockType,
          items: this.resolvedItems,
          diceResultDuration: this.diceResultDuration,
          styles,
          onOpenFile: (path: string) => {
            const file = this.app.vault.getFileByPath(path);
            if (file) {
              this.app.workspace.getLeaf(true).openFile(file);
            }
          },
        })
      );
    });
    diceInlinePostProcessor(
      this.containerEl,
      this.ctx,
      this.diceResultDuration
    );
  }
}
