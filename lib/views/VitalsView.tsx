import { App, MarkdownPostProcessorContext } from "obsidian";
import { BaseView } from "./BaseView";
import { FileContext, useFileContext } from "./filecontext";
import * as VitalsService from "lib/domains/vitals";
import { DNDParsedVitalsBlock } from "@/types/dnd/vitals";
import { DHVitalsBlock, DHVitalsData } from "@/types/daggerheart/vitals";
import { KeyValueStore } from "../services/kv/kv";
import { ReactMarkdown } from "./ReactMarkdown";
import { DaggerHeartVitalsGrid } from "../components/vitals-card";
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
      const vitalsMarkdown = new VitalsDNDMarkdown(el, source, this.kv, ctx.sourcePath, ctx, this);
      ctx.addChild(vitalsMarkdown);
      return;
    } else if (type === "daggerheart") {
      const vitalsMarkdown = new VitalsDHMarkdown(el, source, this.kv, ctx.sourcePath, ctx, this);
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
  private fileContext: FileContext;
  private currentVitalsBlock: DNDParsedVitalsBlock | null = null;
  private originalVitalsValue: number | string;

  constructor(
    el: HTMLElement,
    source: string,
    kv: KeyValueStore,
    filePath: string,
    ctx: MarkdownPostProcessorContext,
    baseView: BaseView
  ) {
    super(el);
    this.source = source;
    this.kv = kv;
    this.filePath = filePath;
    this.fileContext = useFileContext(baseView.app, ctx);
    //this.originalVitalsValue = HealthService.parseHealthBlock(this.source).health;
  }

  async onload() {
    this.render();
  }

  private setupListeners() {}

  private async render() {}
}

class VitalsDHMarkdown extends ReactMarkdown {
  private source: string;
  private kv: KeyValueStore;
  private filePath: string;
  private fileContext: FileContext;
  private vitalsBlock: DHVitalsBlock;

  constructor(
    el: HTMLElement,
    source: string,
    kv: KeyValueStore,
    filePath: string,
    ctx: MarkdownPostProcessorContext,
    baseView: BaseView
  ) {
    super(el);
    this.source = source;
    this.kv = kv;
    this.filePath = filePath;
    this.fileContext = useFileContext(baseView.app, ctx);
    this.vitalsBlock = VitalsService.parseVitalsBlock(source) as DHVitalsBlock;
  }

  async onload() {
    this.setupListeners();
    await this.render();
  }

  private setupListeners() {}

  private async render() {
    const data = await VitalsService.loadDHVitalsData(this.vitalsBlock, this.kv, this.filePath);

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this.containerEl);
    }

    this.reactRoot.render(
      React.createElement(DaggerHeartVitalsGrid, {
        block: this.vitalsBlock,
        data,
        onToggle: (vitalKey: string, index: number) => this.handleToggle(vitalKey, index, data),
      })
    );
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
