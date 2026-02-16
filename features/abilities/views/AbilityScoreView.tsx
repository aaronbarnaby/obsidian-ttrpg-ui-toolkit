import { MarkdownPostProcessorContext } from "obsidian";
import { BaseView } from "@/features/shared/BaseView";
import { useFileContext } from "@/features/shared/filecontext";
import { msgbus } from "@/lib/services/event-bus";
import { getAggregatedModifiersForFile } from "@/lib/domains/modifiers";
import { Frontmatter } from "@/types/core";
import { AggregatedModifiers } from "@/types/features";
import { DNDAbility, DNDAbilityBlock, DNDAbilityName } from "@/types/dnd/abilities";
import { DHAbility, DHAbilityBlock } from "@/types/daggerheart/abilities";
import { DNDAbilityView } from "@/components/abilities/DNDAbilityView";
import { DaggerHeartAbilityView } from "@/components/abilities/DaggerHeartAbilityView";
import { renderHtml } from "@/lib/utils/html-templates";
import { abilityService } from "@/lib/services/ability/AbilityService";

export class AbilityScoreView extends BaseView {
  public codeblock = "ability";

  public render(
    source: string,
    _el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): HTMLElement {
    const container = document.createElement("div");
    (async () => {
      try {
        const [modifiers, abilityBlock] = await Promise.all([
          getAggregatedModifiersForFile(this.app, ctx.sourcePath),
          Promise.resolve(abilityService.parseAbilityBlock(source)),
        ]);
        const frontmatter = useFileContext(this.app, ctx).frontmatter();

        if (abilityBlock.type === "dnd") {
          container.innerHTML = this.renderDNDWithModifiers(
            abilityBlock,
            frontmatter,
            modifiers
          );
        } else if (abilityBlock.type === "daggerheart") {
          container.innerHTML = this.renderDaggerHeartWithModifiers(
            abilityBlock,
            modifiers
          );
        }
        msgbus.publish(ctx.sourcePath, "abilities:changed", undefined);
      } catch (e) {
        container.innerHTML = `<div class="notice">Error: ${
          e instanceof Error ? e.message : String(e)
        }</div>`;
      }
    })();
    return container;
  }

  private abilityModifierFor(modifiers: AggregatedModifiers, key: string): number {
    return (
      modifiers.ability[key] ??
      modifiers.ability[key.toLowerCase()] ??
      modifiers.ability[key.charAt(0).toUpperCase() + key.slice(1)] ??
      0
    );
  }

  private renderDNDWithModifiers(
    abilityBlock: DNDAbilityBlock,
    frontmatter: Frontmatter,
    modifiers: AggregatedModifiers
  ): string {
    const data: DNDAbility[] = [];

    for (const [key, value] of Object.entries(abilityBlock.abilities)) {
      const isProficient = abilityBlock.proficiencies.includes(key);
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const featureDelta = this.abilityModifierFor(modifiers, key);
      const totalScore = abilityService.getTotalScore(
        value + featureDelta,
        key as DNDAbilityName,
        abilityBlock.bonuses
      );

      let savingThrowValue = abilityService.calculateModifier(totalScore);
      if (isProficient) {
        savingThrowValue += frontmatter.proficiency_bonus ?? 0;
      }
      savingThrowValue += abilityService.getSavingThrowBonus(
        key as DNDAbilityName,
        abilityBlock.bonuses
      );

      data.push({
        type: "dnd",
        label: label.substring(0, 3).toUpperCase(),
        total: totalScore,
        modifier: abilityService.calculateModifier(totalScore),
        isProficient,
        savingThrow: savingThrowValue,
      });
    }

    return renderHtml(DNDAbilityView({ data }));
  }

  private renderDaggerHeartWithModifiers(
    abilityBlock: DHAbilityBlock,
    modifiers: AggregatedModifiers
  ): string {
    const data: DHAbility[] = [];

    for (const [key, value] of Object.entries(abilityBlock.abilities)) {
      const featureDelta = this.abilityModifierFor(modifiers, key);
      data.push({
        type: "daggerheart",
        label: key.toUpperCase(),
        modifier: value + featureDelta,
        list: abilityService.getDaggerHeartAbilityList(key),
      });
    }

    return renderHtml(DaggerHeartAbilityView({ data }));
  }
}

