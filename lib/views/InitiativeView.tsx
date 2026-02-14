import { App, MarkdownPostProcessorContext, TFile } from "obsidian";
import { BaseView } from "./BaseView";
import { KeyValueStore } from "../services/kv/kv";
import { ReactMarkdown } from "./ReactMarkdown";
import * as InitiativeService from "lib/domains/initiative";
import * as VitalsService from "lib/domains/vitals";
import { loadPartyMembers } from "../services/party";

import * as ReactDOM from "react-dom/client";
import { DHInitiativeBlock, DHInitiativeState } from "@/types/daggerheart/initiative";
import * as React from "react";
import { DHInitiative } from "../components/initiative";
import type { PartyMember } from "../services/party";
import { Adversary, loadAdversaries } from "../services/adversary";

export class InitiativeView extends BaseView {
  public codeblock = "initiative";

  private kv: KeyValueStore;

  constructor(app: App, kv: KeyValueStore) {
    super(app);
    this.kv = kv;
  }

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const initiativeBlock = InitiativeService.parseInitiativeBlock(source);
    const type = initiativeBlock.type;

    if (type === "dnd") {
      const initiativeMarkdown = new DNDInitiativeMarkdown(el, source, this.kv, ctx);
      ctx.addChild(initiativeMarkdown);
      return;
    }
    if (type === "daggerheart") {
      const initiativeMarkdown = new DHInitiativeMarkdown(el, source, this.app, this.kv, ctx);
      ctx.addChild(initiativeMarkdown);
      return;
    }

    throw new Error("Invalid initiative block type");
  }
}

class DNDInitiativeMarkdown extends ReactMarkdown {
  private source: string;
  private kv: KeyValueStore;
  private ctx: MarkdownPostProcessorContext;

  constructor(el: HTMLElement, source: string, kv: KeyValueStore, ctx: MarkdownPostProcessorContext) {
    super(el);
    this.source = source;
    this.kv = kv;
    this.ctx = ctx;
  }

  onload() {}

  onunload() {}

  render() {}
}

class DHInitiativeMarkdown extends ReactMarkdown {
  private source: string;
  private app: App;
  private kv: KeyValueStore;
  private ctx: MarkdownPostProcessorContext;

  constructor(
    el: HTMLElement,
    source: string,
    app: App,
    kv: KeyValueStore,
    ctx: MarkdownPostProcessorContext
  ) {
    super(el);
    this.source = source;
    this.app = app;
    this.kv = kv;
    this.ctx = ctx;
  }

  async onload() {
    const initiativeBlock = InitiativeService.parseInitiativeBlock(this.source) as DHInitiativeBlock;
    const stateKey = initiativeBlock.state_key;
    if (!stateKey) {
      throw new Error("Initiative block MUST contain a 'state_key' property.");
    }

    const defaultState = InitiativeService.getDefaultDHInitiativeState(initiativeBlock);

    try {
      const savedState = await this.kv.get<DHInitiativeState>(stateKey);
      const initiativeState = savedState || defaultState;

      if (!savedState) {
        try {
          await this.kv.set(stateKey, defaultState);
        } catch (error) {
          console.error("Error saving initial initiative state:", error);
        }
      }

      const partyMembers = await loadPartyMembers(this.app, this.kv, this.ctx.sourcePath, initiativeBlock);
      const adversaries = await loadAdversaries(this.app, this.ctx.sourcePath, initiativeBlock.adversaries);
      this.renderComponent(initiativeBlock, initiativeState, partyMembers, adversaries);
    } catch (error) {
      console.error("Error loading initiative state", error);
      this.renderComponent(initiativeBlock, defaultState, [], []);
    }
  }

  private async handlePartyMemberVitalToggle(
    block: DHInitiativeBlock,
    state: DHInitiativeState,
    partyMembers: PartyMember[],
    adversaries: Adversary[],
    filePath: string,
    vitalKey: string,
    newUsed: number
  ): Promise<void> {
    try {
      await VitalsService.toggleDHVitalBlock(this.kv, filePath, vitalKey, newUsed);
    } catch (err) {
      console.error("Error saving party member vital:", filePath, vitalKey, err);
      return;
    }
    const updated = partyMembers.map((m) =>
      m.filePath === filePath && m.vitalsData
        ? { ...m, vitalsData: { ...m.vitalsData, [vitalKey]: newUsed } }
        : m
    );
    this.renderComponent(block, state, updated, adversaries);
  }

  renderComponent(
    block: DHInitiativeBlock,
    state: DHInitiativeState,
    partyMembers: PartyMember[],
    adversaries: Adversary[]
  ) {
    const stateKey = block.state_key;
    if (!stateKey) return;

    const data = {
      static: block,
      state,
      partyMembers,
      adversaries,
      onStateChange: (newState: DHInitiativeState) => {
        this.handleStateChange(block, newState);
        this.renderComponent(block, newState, partyMembers, adversaries);
      },
      onPartyMemberVitalsToggle: (filePath: string, key: string, newUsed: number) => {
        this.handlePartyMemberVitalToggle(block, state, partyMembers, adversaries, filePath, key, newUsed);
      },
      onOpenFile: (filePath: string) => {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file instanceof TFile) {
          const leaf = this.app.workspace.getLeaf(true);
          leaf.openFile(file);
        }
      },
    };

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this.containerEl);
    }

    this.reactRoot.render(React.createElement(DHInitiative, data));
  }

  private async handleStateChange(initiativeBlock: DHInitiativeBlock, newState: DHInitiativeState) {
    const stateKey = initiativeBlock.state_key;
    if (!stateKey) return;

    try {
      // Update state in KV store
      await this.kv.set(stateKey, newState);
    } catch (error) {
      console.error(`Error saving initiative state for ${stateKey}:`, error);
    }
  }

  onunload() {
    // Clean up React root to prevent memory leaks
    if (this.reactRoot) {
      try {
        this.reactRoot.unmount();
      } catch (e) {
        console.error("Error unmounting React component:", e);
      }
      this.reactRoot = null;
      console.debug("Unmounted React component in InitiativeMarkdown");
    }
  }
}
