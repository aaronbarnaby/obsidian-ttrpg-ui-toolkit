import { App, MarkdownPostProcessorContext } from "obsidian";
import { BaseView } from "./BaseView";
import { FileContext, useFileContext } from "./filecontext";
import * as VitalsService from "lib/domains/vitals";
import { DHVitalsBlock, DHVitalsBlockInput, DHVitalsData } from "@/types/daggerheart/vitals";
import { DNDParsedVitalsBlock, DNDVitalsBlock, DNDVitalsBlockInput, DNDVitalsData } from "@/types/dnd/vitals";
import { KeyValueStore } from "../services/kv/kv";
import { ReactMarkdown } from "./ReactMarkdown";
import { DaggerHeartVitalsGrid, DNDVitalsGrid } from "../components/vitals-card";
import {
  createTemplateContext,
  hasTemplateVariables,
  parseTemplateNumber,
  processTemplate,
} from "../utils/template";
import * as ReactDOM from "react-dom/client";
import * as React from "react";

export class VitalsView extends BaseView {
  public codeblock = "vitals";

  private kv: KeyValueStore;

  constructor(app: App, kv: KeyValueStore) {
    super(app);
    this.kv = kv;
  }

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const vitalsBlock = VitalsService.parseVitalsBlock(source);
    const type = vitalsBlock.type;

    if (type === "dnd") {
      const vitalsMarkdown = new VitalsDNDMarkdown(el, source, this.app, this.kv, ctx);
      ctx.addChild(vitalsMarkdown);
      return;
    } else if (type === "daggerheart") {
      const vitalsMarkdown = new VitalsDHMarkdown(el, source, this.app, this.kv, ctx);
      ctx.addChild(vitalsMarkdown);
      return;
    }

    throw new Error("Invalid vitals block type");
  }
}

class VitalsDNDMarkdown extends ReactMarkdown {
  private source: string;
  private kv: KeyValueStore;
  private filePath: string;
  private ctx: FileContext;
  private isTemplate = false;

  constructor(el: HTMLElement, source: string, app: App, kv: KeyValueStore, ctx: MarkdownPostProcessorContext) {
    super(el);
    this.source = source;
    this.ctx = useFileContext(app, ctx);
    this.filePath = this.ctx.filepath;
    this.kv = kv;
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

        this.render();
      })
    );
    this.addUnloadFn(
      this.ctx.onAbilitiesChange(() => {
        if (!this.isTemplate) return;
        this.render();
      })
    );
  }

  private async render() {
    try {
      const inputBlock = VitalsService.parseVitalsBlock(this.source) as DNDVitalsBlockInput;
      const hpRaw = inputBlock.hp;
      const hasTemplates = typeof hpRaw === "string" && hasTemplateVariables(hpRaw);
      if (hasTemplates) this.isTemplate = true;

      let templateContext = null;
      if (hasTemplates) {
        templateContext = createTemplateContext(this.containerEl, this.ctx);
      }

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
        hitdice: VitalsService.normalizeHitDice(block.hitdice),
      };
      const data = await VitalsService.loadDNDVitalsData(block, this.kv, this.filePath);

      if (!this.reactRoot) {
        this.reactRoot = ReactDOM.createRoot(this.containerEl);
      }

      this.reactRoot.render(
        React.createElement(DNDVitalsGrid, {
          block: parsedBlock,
          data,
          onHitDiceToggle: (dice, index) => this.handleHitDiceToggle(dice, index, data, parsedBlock),
          onDeathSaveToggle: (success, index) => this.handleDeathSaveToggle(success, index, data),
          onHeal: (amount) => this.handleHeal(amount, data, parsedBlock),
          onDamage: (amount) => this.handleDamage(amount, data, parsedBlock),
          onAddTemp: (amount) => this.handleAddTemp(amount, data),
        })
      );
    } catch {
      throw new Error("Invalid vitals block");
    }
  }

  private async handleHitDiceToggle(dice: string, index: number, data: DNDVitalsData, block: DNDParsedVitalsBlock) {
    const entry = block.hitdice?.find((h) => h.dice === dice);
    const total = entry?.value ?? 0;
    const currentUsed = data.hitdice_used[dice] ?? 0;
    const newUsed = currentUsed >= index + 1 ? index : Math.min(index + 1, total);
    await VitalsService.saveDNDVitalsField(this.kv, this.filePath, "hitdice_used", {
      ...data.hitdice_used,
      [dice]: newUsed,
    });
    await this.render();
  }

  private async handleDeathSaveToggle(success: boolean, index: number, data: DNDVitalsData) {
    const current = success ? data.death_save_successes : data.death_save_failures;
    const newVal = current >= index + 1 ? index : Math.min(index + 1, 3);
    await VitalsService.saveDNDVitalsField(
      this.kv,
      this.filePath,
      success ? "death_save_successes" : "death_save_failures",
      newVal
    );
    await this.render();
  }

  private async handleHeal(amount: number, data: DNDVitalsData, block: DNDParsedVitalsBlock) {
    const newHp = Math.min(data.hp + amount, block.hp);
    await VitalsService.saveDNDVitalsField(this.kv, this.filePath, "hp", newHp);

    if (newHp > 0) {
      // Clear Death saves
      await VitalsService.saveDNDVitalsField(this.kv, this.filePath, "death_save_successes", 0);
      await VitalsService.saveDNDVitalsField(this.kv, this.filePath, "death_save_failures", 0);
    }

    await this.render();
  }

  private async handleDamage(amount: number, data: DNDVitalsData, block: DNDParsedVitalsBlock) {
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
    await VitalsService.saveDNDVitalsField(this.kv, this.filePath, "temp_hp", newTemp);
    await VitalsService.saveDNDVitalsField(this.kv, this.filePath, "hp", newHp);
    await this.render();
  }

  private async handleAddTemp(amount: number, data: DNDVitalsData) {
    await VitalsService.saveDNDVitalsField(this.kv, this.filePath, "temp_hp", data.temp_hp + amount);
    await this.render();
  }
}

class VitalsDHMarkdown extends ReactMarkdown {
  private source: string;
  private kv: KeyValueStore;
  private filePath: string;
  private ctx: FileContext;
  private isTemplate = false;

  constructor(el: HTMLElement, source: string, app: App, kv: KeyValueStore, ctx: MarkdownPostProcessorContext) {
    super(el);
    this.source = source;
    this.ctx = useFileContext(app, ctx);
    this.filePath = ctx.sourcePath;
    this.kv = kv;
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

        this.render();
      })
    );
    this.addUnloadFn(
      this.ctx.onAbilitiesChange(() => {
        if (!this.isTemplate) return;
        this.render();
      })
    );
  }

  private static hasDHVitalsTemplates(input: DHVitalsBlockInput): boolean {
    const { hp, stress, armor, evasion, thresholds } = input;
    return (
      (typeof hp === "string" && hasTemplateVariables(String(hp ?? ""))) ||
      (typeof stress === "string" && hasTemplateVariables(String(stress ?? ""))) ||
      (typeof armor === "string" && hasTemplateVariables(String(armor ?? ""))) ||
      (typeof evasion === "string" && hasTemplateVariables(String(evasion ?? ""))) ||
      (typeof thresholds === "string" && hasTemplateVariables(String(thresholds ?? "")))
    );
  }

  private async render() {
    try {
      const inputBlock = VitalsService.parseVitalsBlock(this.source) as DHVitalsBlockInput;
      const hasTemplates = VitalsDHMarkdown.hasDHVitalsTemplates(inputBlock);
      if (hasTemplates) this.isTemplate = true;

      const templateContext = hasTemplates ? createTemplateContext(this.containerEl, this.ctx) : null;
      const block = VitalsService.resolveDHVitalsBlockFromInput(inputBlock, templateContext);
      const data = await VitalsService.loadDHVitalsData(block, this.kv, this.filePath);

      if (!this.reactRoot) {
        this.reactRoot = ReactDOM.createRoot(this.containerEl);
      }

      this.reactRoot.render(
        React.createElement(DaggerHeartVitalsGrid, {
          block: block,
          data,
          onToggle: (vitalKey: string, index: number) => this.handleToggle(vitalKey, index, data),
        })
      );
    } catch {
      throw new Error("Invalid vitals block");
    }
  }

  private async handleToggle(vitalKey: string, index: number, currentData: DHVitalsData) {
    let total: number;
    let currentUsed: number;

    if (vitalKey === "hope") {
      total = 6; // TODO: Create a setting for max hope?
      currentUsed = currentData.hope as number;
    } else {
      const totalKey = vitalKey.replace("_used", "_blocks") as keyof DHVitalsData;
      const usedKey = ("used_" + vitalKey.replace("_used", "_blocks")) as keyof DHVitalsData;
      total = currentData[totalKey] as number;
      currentUsed = currentData[usedKey] as number;
    }

    // Toggle logic: clicking the last active box turns it off, otherwise fill up to clicked box
    let newUsed: number;
    if (currentUsed >= index + 1) {
      newUsed = index;
    } else {
      newUsed = Math.min(index + 1, total);
    }

    await VitalsService.toggleDHVitalBlock(this.kv, this.filePath, vitalKey, newUsed);
    await this.render();
  }
}
