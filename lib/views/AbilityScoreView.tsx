import * as Tmpl from "lib/html-templates";
import { DNDAbilityView, DaggerHeartAbilityView } from "lib/components/ability-cards";
import { BaseView } from "./BaseView";
import { MarkdownPostProcessorContext } from "obsidian";
import * as AbilityService from "lib/domains/abilities";
import { useFileContext } from "./filecontext";
import { msgbus } from "lib/services/event-bus";
import { getDaggerHeartAbilityList } from "lib/domains/abilities";
import { getAggregatedModifiersForFile } from "lib/domains/modifiers";
import { DNDAbility, DNDAbilityBlock, DNDAbilityName } from "types/dnd/abilities";
import { DHAbility, DHAbilityBlock } from "types/daggerheart/abilities";
import { Frontmatter } from "types/core";
import { AggregatedModifiers } from "types/features";

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
          Promise.resolve(AbilityService.parseAbilityBlock(source)),
        ]);
        const fc = useFileContext(this.app, ctx);
        const frontmatter = fc.frontmatter();
        const type = abilityBlock.type;

        if (type === "dnd") {
          container.innerHTML = this.renderDNDWithModifiers(
            abilityBlock,
            frontmatter,
            ctx,
            modifiers
          );
        } else if (type === "daggerheart") {
          container.innerHTML = this.renderDaggerHeartWithModifiers(
            abilityBlock,
            ctx,
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

  private abilityModifierFor(
    modifiers: AggregatedModifiers,
    key: string
  ): number {
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
    ctx: MarkdownPostProcessorContext,
    modifiers: AggregatedModifiers
  ): string {
    const data: DNDAbility[] = [];

    for (const [key, value] of Object.entries(abilityBlock.abilities)) {
      const isProficient = abilityBlock.proficiencies.includes(key);
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const featureDelta = this.abilityModifierFor(modifiers, key);

      const totalScore = AbilityService.getTotalScore(
        value + featureDelta,
        key as DNDAbilityName,
        abilityBlock.bonuses
      );

      let savingThrowValue = AbilityService.calculateModifier(totalScore);
      if (isProficient) {
        savingThrowValue += frontmatter.proficiency_bonus ?? 0;
      }
      savingThrowValue += AbilityService.getSavingThrowBonus(
        key as DNDAbilityName,
        abilityBlock.bonuses
      );

      const abbreviation = label.substring(0, 3).toUpperCase();

      data.push({
        type: "dnd",
        label: abbreviation,
        total: totalScore,
        modifier: AbilityService.calculateModifier(totalScore),
        isProficient,
        savingThrow: savingThrowValue,
      });
    }

    return Tmpl.Render(DNDAbilityView(data));
  }

  private renderDaggerHeartWithModifiers(
    abilityBlock: DHAbilityBlock,
    ctx: MarkdownPostProcessorContext,
    modifiers: AggregatedModifiers
  ): string {
    const data: DHAbility[] = [];

    for (const [key, value] of Object.entries(abilityBlock.abilities)) {
      const label = key.toUpperCase();
      const featureDelta = this.abilityModifierFor(modifiers, key);
      const modifier = value + featureDelta;

      data.push({
        type: "daggerheart",
        label,
        modifier,
        list: getDaggerHeartAbilityList(key),
      });
    }

    return Tmpl.Render(DaggerHeartAbilityView(data));
  }
}
