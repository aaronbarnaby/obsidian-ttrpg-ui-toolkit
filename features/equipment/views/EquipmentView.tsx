import { App, MarkdownPostProcessorContext } from "obsidian";
import * as React from "react";
import { flushSync } from "react-dom";
import { BaseView } from "@/features/shared/BaseView";
import { ReactMarkdown } from "@/features/shared/ReactMarkdown";
import { useFileContext } from "@/features/shared/filecontext";
import { parseYamlSafe } from "@/lib/utils/yaml";
import { diceInlinePostProcessor } from "@/features/dice/dicePostProcessor";
import { equipmentService, DHEquipmentWithPath } from "@/lib/services/equipment/EquipmentService";
import { EquipmentBlock, EquipmentBlockStyles } from "@/components/equipment/EquipmentBlock";
import { ensureReactRoot } from "@/lib/utils/react-root";
import { openFileInNewLeaf } from "@/lib/utils/open-file";

export type EquipmentBlockYaml = {
  type?: "daggerheart" | "dnd";
  items?: unknown[];
  styles?: EquipmentBlockStyles;
};

type PluginLike = { settings: { diceResultDuration: number } };

export class EquipmentView extends BaseView {
  public codeblock = "equipment";

  constructor(app: App, private readonly plugin: PluginLike) {
    super(app);
  }

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    ctx.addChild(
      new EquipmentMarkdown(
        el,
        source,
        this.app,
        ctx,
        this.plugin.settings.diceResultDuration
      )
    );
  }
}

class EquipmentMarkdown extends ReactMarkdown {
  private resolvedItems: DHEquipmentWithPath[] = [];
  private blockType: "daggerheart" | "dnd" = "daggerheart";

  constructor(
    el: HTMLElement,
    private readonly source: string,
    private readonly app: App,
    private readonly ctx: MarkdownPostProcessorContext,
    private readonly diceResultDuration: number
  ) {
    super(el);
  }

  async onload(): Promise<void> {
    await this.loadAndRender();
    this.setupListeners();
  }

  private setupListeners(): void {
    const fc = useFileContext(this.app, this.ctx);
    this.addUnloadFn(
      fc.onFrontmatterChange(() => {
        this.loadAndRender();
      })
    );
  }

  private async loadAndRender(): Promise<void> {
    try {
      const doc = parseYamlSafe<EquipmentBlockYaml>(this.source);
      const blockType = doc.type === "dnd" ? "dnd" : "daggerheart";
      const blockItems = Array.isArray(doc.items) ? doc.items : [];
      const frontmatter = useFileContext(this.app, this.ctx).frontmatter();
      this.resolvedItems = await equipmentService.resolveEquipmentList(
        this.app,
        this.ctx.sourcePath,
        blockItems,
        frontmatter.equipped
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

  private renderContent(styles: EquipmentBlockStyles | undefined): void {
    this.reactRoot = ensureReactRoot(this.reactRoot, this.containerEl);
    flushSync(() => {
      this.reactRoot?.render(
        React.createElement(EquipmentBlock, {
          type: this.blockType,
          items: this.resolvedItems,
          diceResultDuration: this.diceResultDuration,
          styles,
          onOpenFile: (path: string) => openFileInNewLeaf(this.app, path),
        })
      );
    });
    diceInlinePostProcessor(this.containerEl, this.ctx, this.diceResultDuration);
  }
}

