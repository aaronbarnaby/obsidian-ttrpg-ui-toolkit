import { App, MarkdownPostProcessorContext } from "obsidian";
import * as React from "react";
import { BaseView } from "@/features/shared/BaseView";
import { ReactMarkdown } from "@/features/shared/ReactMarkdown";
import { FileContext, useFileContext } from "@/features/shared/filecontext";
import {
  createTemplateContext,
  hasTemplateVariables,
  parseTemplateNumber,
  processTemplate,
} from "@/lib/utils/template";
import { KeyValueStore } from "@/lib/services/kv/kv";
import { DNDVitalsGrid } from "@/components/vitals/DNDVitalsGrid";
import { DaggerHeartVitalsGrid } from "@/components/vitals/DaggerHeartVitalsGrid";
import { DNDParsedVitalsBlock, DNDVitalsBlock, DNDVitalsBlockInput, DNDVitalsData } from "@/types/dnd/vitals";
import { DHVitalsBlock, DHVitalsBlockInput, DHVitalsData } from "@/types/daggerheart/vitals";
import { vitalsService } from "@/lib/services/vitals/VitalsService";
import { ensureReactRoot } from "@/lib/utils/react-root";
import { bindTemplateRerenderListeners } from "@/lib/utils/template-listeners";

export class VitalsView extends BaseView {
  public codeblock = "vitals";

  constructor(app: App, private readonly kv: KeyValueStore) {
    super(app);
  }

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const vitalsBlock = vitalsService.parseVitalsBlock(source);
    if (vitalsBlock.type === "dnd") {
      ctx.addChild(new DNDVitalsMarkdown(el, source, this.app, this.kv, ctx));
      return;
    }
    if (vitalsBlock.type === "daggerheart") {
      ctx.addChild(new DaggerHeartVitalsMarkdown(el, source, this.app, this.kv, ctx));
      return;
    }
    throw new Error("Invalid vitals block type");
  }
}

class DNDVitalsMarkdown extends ReactMarkdown {
  private readonly fileContext: FileContext;
  private readonly filePath: string;
  private isTemplate = false;

  constructor(
    el: HTMLElement,
    private readonly source: string,
    private readonly app: App,
    private readonly kv: KeyValueStore,
    ctx: MarkdownPostProcessorContext
  ) {
    super(el);
    this.fileContext = useFileContext(app, ctx);
    this.filePath = this.fileContext.filepath;
  }

  async onload(): Promise<void> {
    bindTemplateRerenderListeners(
      this.fileContext,
      () => this.isTemplate,
      (fn) => this.addUnloadFn(fn),
      () => void this.renderBlock()
    );
    await this.renderBlock();
  }

  private async renderBlock(): Promise<void> {
    const inputBlock = vitalsService.parseVitalsBlock(this.source) as DNDVitalsBlockInput;
    const hpRaw = inputBlock.hp;
    const hasTemplates = typeof hpRaw === "string" && hasTemplateVariables(hpRaw);
    if (hasTemplates) {
      this.isTemplate = true;
    }

    const templateContext = hasTemplates
      ? await createTemplateContext(this.app, this.containerEl, this.fileContext)
      : null;

    const hpResolved =
      typeof hpRaw === "number"
        ? hpRaw
        : parseTemplateNumber(
            templateContext ? processTemplate(hpRaw, templateContext) : String(hpRaw),
            0
          );

    const block: DNDVitalsBlock = { ...inputBlock, hp: hpResolved };
    const parsedBlock: DNDParsedVitalsBlock = {
      ...block,
      hitdice: vitalsService.normalizeHitDice(block.hitdice),
    };
    const data = await vitalsService.loadDNDVitalsData(block, this.kv, this.filePath);
    this.reactRoot = ensureReactRoot(this.reactRoot, this.containerEl);
    this.reactRoot.render(
      React.createElement(DNDVitalsGrid, {
        block: parsedBlock,
        data,
        onHitDiceToggle: (dice, index) => this.handleHitDiceToggle(dice, index, data, parsedBlock),
        onDeathSaveToggle: (success, index) => this.handleDeathSaveToggle(success, index, data),
        onHeal: (amount) => this.handleHeal(amount, data, parsedBlock),
        onDamage: (amount) => this.handleDamage(amount, data),
        onAddTemp: (amount) => this.handleAddTemp(amount, data),
      })
    );
  }

  private async handleHitDiceToggle(
    dice: string,
    index: number,
    data: DNDVitalsData,
    block: DNDParsedVitalsBlock
  ): Promise<void> {
    const entry = block.hitdice?.find((h) => h.dice === dice);
    const total = entry?.value ?? 0;
    const currentUsed = data.hitdice_used[dice] ?? 0;
    const newUsed = currentUsed >= index + 1 ? index : Math.min(index + 1, total);
    await vitalsService.saveDNDVitalsField(this.kv, this.filePath, "hitdice_used", {
      ...data.hitdice_used,
      [dice]: newUsed,
    });
    await this.renderBlock();
  }

  private async handleDeathSaveToggle(
    success: boolean,
    index: number,
    data: DNDVitalsData
  ): Promise<void> {
    const current = success ? data.death_save_successes : data.death_save_failures;
    const newVal = current >= index + 1 ? index : Math.min(index + 1, 3);
    await vitalsService.saveDNDVitalsField(
      this.kv,
      this.filePath,
      success ? "death_save_successes" : "death_save_failures",
      newVal
    );
    await this.renderBlock();
  }

  private async handleHeal(
    amount: number,
    data: DNDVitalsData,
    block: DNDParsedVitalsBlock
  ): Promise<void> {
    const newHp = Math.min(data.hp + amount, block.hp);
    await vitalsService.saveDNDVitalsField(this.kv, this.filePath, "hp", newHp);
    if (newHp > 0) {
      await vitalsService.saveDNDVitalsField(this.kv, this.filePath, "death_save_successes", 0);
      await vitalsService.saveDNDVitalsField(this.kv, this.filePath, "death_save_failures", 0);
    }
    await this.renderBlock();
  }

  private async handleDamage(amount: number, data: DNDVitalsData): Promise<void> {
    let remaining = amount;
    let newTemp = data.temp_hp;
    let newHp = data.hp;
    if (remaining > 0 && newTemp > 0) {
      const fromTemp = Math.min(remaining, newTemp);
      newTemp -= fromTemp;
      remaining -= fromTemp;
    }
    if (remaining > 0) {
      newHp = Math.max(0, newHp - remaining);
    }
    await vitalsService.saveDNDVitalsField(this.kv, this.filePath, "temp_hp", newTemp);
    await vitalsService.saveDNDVitalsField(this.kv, this.filePath, "hp", newHp);
    await this.renderBlock();
  }

  private async handleAddTemp(amount: number, data: DNDVitalsData): Promise<void> {
    await vitalsService.saveDNDVitalsField(this.kv, this.filePath, "temp_hp", data.temp_hp + amount);
    await this.renderBlock();
  }
}

class DaggerHeartVitalsMarkdown extends ReactMarkdown {
  private readonly fileContext: FileContext;
  private isTemplate = false;

  constructor(
    el: HTMLElement,
    private readonly source: string,
    private readonly app: App,
    private readonly kv: KeyValueStore,
    ctx: MarkdownPostProcessorContext
  ) {
    super(el);
    this.fileContext = useFileContext(app, ctx);
  }

  async onload(): Promise<void> {
    bindTemplateRerenderListeners(
      this.fileContext,
      () => this.isTemplate,
      (fn) => this.addUnloadFn(fn),
      () => void this.renderBlock()
    );
    await this.renderBlock();
  }

  private hasTemplates(input: DHVitalsBlockInput): boolean {
    const { hp, stress, armor, evasion, thresholds } = input;
    return (
      (typeof hp === "string" && hasTemplateVariables(String(hp ?? ""))) ||
      (typeof stress === "string" && hasTemplateVariables(String(stress ?? ""))) ||
      (typeof armor === "string" && hasTemplateVariables(String(armor ?? ""))) ||
      (typeof evasion === "string" && hasTemplateVariables(String(evasion ?? ""))) ||
      (typeof thresholds === "string" && hasTemplateVariables(String(thresholds ?? "")))
    );
  }

  private async renderBlock(): Promise<void> {
    const inputBlock = vitalsService.parseVitalsBlock(this.source) as DHVitalsBlockInput;
    const hasTemplates = this.hasTemplates(inputBlock);
    if (hasTemplates) {
      this.isTemplate = true;
    }
    const templateContext = hasTemplates
      ? await createTemplateContext(this.app, this.containerEl, this.fileContext)
      : null;
    const block = vitalsService.resolveDHVitalsBlockFromInput(inputBlock, templateContext);
    const data = await vitalsService.loadDHVitalsData(
      block,
      this.kv,
      this.fileContext.filepath
    );
    this.reactRoot = ensureReactRoot(this.reactRoot, this.containerEl);
    this.reactRoot.render(
      React.createElement(DaggerHeartVitalsGrid, {
        block,
        data,
        onToggle: (vitalKey, index) => this.handleToggle(vitalKey, index, data, block),
      })
    );
  }

  private async handleToggle(
    vitalKey: string,
    index: number,
    currentData: DHVitalsData,
    block: DHVitalsBlock
  ): Promise<void> {
    let total: number;
    let currentUsed: number;
    if (vitalKey === "hope") {
      total = 6;
      currentUsed = currentData.hope as number;
    } else {
      const blockKey = vitalKey.replace("_used", "") as keyof DHVitalsBlock;
      total = block[blockKey] as number;
      currentUsed = currentData[vitalKey as keyof DHVitalsData] as number;
    }
    const newUsed = currentUsed >= index + 1 ? index : Math.min(index + 1, total);
    await vitalsService.toggleDHVitalBlock(
      this.kv,
      this.fileContext.filepath,
      vitalKey,
      newUsed
    );
    await this.renderBlock();
  }
}

