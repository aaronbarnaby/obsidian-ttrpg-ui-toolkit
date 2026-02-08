import * as Tmpl from "lib/html-templates";
import { DNDAbilityView, DaggerHeartAbilityView } from "lib/components/ability-cards";
import { BaseView } from "./BaseView";
import { MarkdownPostProcessorContext } from "obsidian";
import * as AbilityService from "lib/domains/abilities";
import { DNDAbility, DNDAbilityBlock, DaggerHeartAbility, DaggerHeartAbilityBlock } from "lib/types";
import { useFileContext } from "./filecontext";
import { msgbus } from "lib/services/event-bus";
import { getDaggerHeartAbilityList } from "lib/domains/abilities";

export class AbilityScoreView extends BaseView {
  public codeblock = "ability";

  public render(source: string, __: HTMLElement, ctx: MarkdownPostProcessorContext): string {
    const abilityBlock = AbilityService.parseAbilityBlock(source);

    const type = abilityBlock.type;
    
    if (type === 'dnd') {
      return this.renderDND(abilityBlock, ctx);
    } else if (type === 'daggerheart') {
      return this.renderDaggerHeart(abilityBlock, ctx);
    }

    return "";
  }

  private renderDND(abilityBlock: DNDAbilityBlock, ctx: MarkdownPostProcessorContext) {
    const fc = useFileContext(this.app, ctx);
    const frontmatter = fc.frontmatter();

    const data: DNDAbility[] = [];

    for (const [key, value] of Object.entries(abilityBlock.abilities)) {
      const isProficient = abilityBlock.proficiencies.includes(key);

      const label = key.charAt(0).toUpperCase() + key.slice(1);

      // Calculate total ability score including score modifiers
      const totalScore = AbilityService.getTotalScore(
        value,
        key as keyof typeof abilityBlock.abilities,
        abilityBlock.bonuses
      );

      // Calculate saving throw with base modifier + proficiency + saving throw bonuses
      let savingThrowValue = AbilityService.calculateModifier(totalScore);
      if (isProficient) {
        savingThrowValue += frontmatter.proficiency_bonus ?? 0;
      }
      savingThrowValue += AbilityService.getSavingThrowBonus(
        key as keyof typeof abilityBlock.abilities,
        abilityBlock.bonuses
      );

      const abbreviation = label.substring(0, 3).toUpperCase();

      data.push({
        type: 'dnd',
        label: abbreviation,
        total: totalScore,
        modifier: AbilityService.calculateModifier(totalScore),
        isProficient: isProficient,
        savingThrow: savingThrowValue,
      });
    }

    msgbus.publish(ctx.sourcePath, "abilities:changed", undefined);
    return Tmpl.Render(DNDAbilityView(data));
  }

  private renderDaggerHeart(abilityBlock: DaggerHeartAbilityBlock, ctx: MarkdownPostProcessorContext) {
    const data: DaggerHeartAbility[] = [];

    for (const [key, value] of Object.entries(abilityBlock.abilities)) {
      const label = key.toUpperCase();
      const modifier = value;

      data.push({
        type: 'daggerheart',
        label: label,
        modifier: modifier,
        list: getDaggerHeartAbilityList(key as keyof typeof abilityBlock.abilities)
      });
    }
    
    msgbus.publish(ctx.sourcePath, "abilities:changed", undefined);
    return Tmpl.Render(DaggerHeartAbilityView(data));
  }
}
