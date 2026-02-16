import { App, MarkdownPostProcessorContext } from "obsidian";
import * as React from "react";
import { BaseView } from "@/features/shared/BaseView";
import { ReactMarkdown } from "@/features/shared/ReactMarkdown";
import { KeyValueStore } from "@/lib/services/kv/kv";
import { loadPartyMembers } from "@/lib/services/party";
import { Adversary, loadAdversaries } from "@/lib/services/adversary";
import type { PartyMember } from "@/lib/services/party";
import { DHInitiative } from "@/components/initiative";
import { DHInitiativeBlock, DHInitiativeState } from "@/types/daggerheart/initiative";
import { initiativeService } from "@/lib/services/initiative/InitiativeService";
import { vitalsService } from "@/lib/services/vitals/VitalsService";
import { ensureReactRoot } from "@/lib/utils/react-root";
import { openFileInNewLeaf } from "@/lib/utils/open-file";

export class InitiativeView extends BaseView {
  public codeblock = "initiative";

  constructor(app: App, private readonly kv: KeyValueStore) {
    super(app);
  }

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const initiativeBlock = initiativeService.parseInitiativeBlock(source);
    if (initiativeBlock.type === "dnd") {
      ctx.addChild(new DNDInitiativeMarkdown(el, source, this.kv, ctx));
      return;
    }
    if (initiativeBlock.type === "daggerheart") {
      ctx.addChild(new DaggerHeartInitiativeMarkdown(el, source, this.app, this.kv, ctx));
      return;
    }
    throw new Error("Invalid initiative block type");
  }
}

class DNDInitiativeMarkdown extends ReactMarkdown {
  constructor(
    el: HTMLElement,
    private readonly source: string,
    private readonly kv: KeyValueStore,
    private readonly ctx: MarkdownPostProcessorContext
  ) {
    super(el);
  }

  onload(): void {
    void this.source;
    void this.kv;
    void this.ctx;
  }
}

class DaggerHeartInitiativeMarkdown extends ReactMarkdown {
  constructor(
    el: HTMLElement,
    private readonly source: string,
    private readonly app: App,
    private readonly kv: KeyValueStore,
    private readonly ctx: MarkdownPostProcessorContext
  ) {
    super(el);
  }

  async onload(): Promise<void> {
    const initiativeBlock = initiativeService.parseInitiativeBlock(
      this.source
    ) as DHInitiativeBlock;
    const stateKey = initiativeBlock.state_key;
    if (!stateKey) {
      throw new Error("Initiative block MUST contain a 'state_key' property.");
    }
    const defaultState = initiativeService.getDefaultDHInitiativeState(initiativeBlock);
    try {
      const savedState = await this.kv.get<DHInitiativeState>(stateKey);
      const initiativeState = savedState || defaultState;
      if (!savedState) {
        await this.kv.set(stateKey, defaultState);
      }
      const partyMembers = await loadPartyMembers(
        this.app,
        this.kv,
        this.ctx.sourcePath,
        initiativeBlock
      );
      const adversaries = await loadAdversaries(
        this.app,
        this.ctx.sourcePath,
        initiativeBlock.adversaries
      );
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
      await vitalsService.toggleDHVitalBlock(this.kv, filePath, vitalKey, newUsed);
    } catch (err) {
      console.error("Error saving party member vital:", filePath, vitalKey, err);
      return;
    }
    const updated = partyMembers.map((member) =>
      member.filePath === filePath && member.vitalsData
        ? { ...member, vitalsData: { ...member.vitalsData, [vitalKey]: newUsed } }
        : member
    );
    this.renderComponent(block, state, updated, adversaries);
  }

  private renderComponent(
    block: DHInitiativeBlock,
    state: DHInitiativeState,
    partyMembers: PartyMember[],
    adversaries: Adversary[]
  ): void {
    if (!block.state_key) return;
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
        this.handlePartyMemberVitalToggle(
          block,
          state,
          partyMembers,
          adversaries,
          filePath,
          key,
          newUsed
        );
      },
      onOpenFile: (filePath: string) => openFileInNewLeaf(this.app, filePath),
    };
    this.reactRoot = ensureReactRoot(this.reactRoot, this.containerEl);
    this.reactRoot.render(React.createElement(DHInitiative, data));
  }

  private async handleStateChange(
    initiativeBlock: DHInitiativeBlock,
    newState: DHInitiativeState
  ): Promise<void> {
    const stateKey = initiativeBlock.state_key;
    if (!stateKey) return;
    try {
      await this.kv.set(stateKey, newState);
    } catch (error) {
      console.error(`Error saving initiative state for ${stateKey}:`, error);
    }
  }
}

