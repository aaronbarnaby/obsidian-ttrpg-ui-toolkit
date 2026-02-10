import * as Tmpl from "lib/html-templates";
import { AbilityBlock } from "@/types/abilities";
import { MarkdownPostProcessorContext } from "obsidian";
import { BaseView } from "./BaseView";
import { useFileContext } from "./filecontext";
import * as AbilityService from "lib/domains/abilities";
import * as SkillsService from "lib/domains/skills";
import { SkillGrid, SkillItem } from "../components/skill-cards";
import { DNDAbilityName, GenericBonus } from "@/types/dnd/abilities";

export class SkillsView extends BaseView {
  public codeblock = "skills";

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): string {
    let abilityBlock: AbilityBlock;

    try {
      abilityBlock = AbilityService.parseAbilityBlockFromDocument(el, ctx);
    } catch {
      return "ERROR: No ability block found for skills view";
    }

    if (abilityBlock.type !== 'dnd') {
     throw new Error("Skills view only supports DND ability blocks");
    }

    const skillsBlock = SkillsService.parseSkillsBlock(source);
    const data: SkillItem[] = [];

    const fc = useFileContext(this.app, ctx);
    const frontmatter = fc.frontmatter();

    for (const skill of SkillsService.Skills) {
      const isHalfProficient =
      skillsBlock.half_proficiencies.find((x) => {
        return x.toLowerCase() === skill.label.toLowerCase();
      }) !== undefined;

    const isProficient =
      skillsBlock.proficiencies.find((x) => {
        return x.toLowerCase() === skill.label.toLowerCase();
      }) !== undefined;

    const isExpert =
      skillsBlock.expertise.find((x) => {
        return x.toLowerCase() === skill.label.toLowerCase();
      }) !== undefined;

    const skillAbility = abilityBlock.abilities[skill.ability as keyof AbilityBlock["abilities"]];
    if (!skillAbility) {
      throw new Error(`Skill ${skill.ability} not found in Skills list`);
    }

    const totalAbilityScore = AbilityService.getTotalScore(
      skillAbility,
      skill.ability as DNDAbilityName,
      abilityBlock.bonuses as GenericBonus[]
    );

    let skillCheckValue = AbilityService.calculateModifier(totalAbilityScore);
    if (isExpert) {
      skillCheckValue += frontmatter.proficiency_bonus * 2;
    } else if (isProficient) {
      skillCheckValue += frontmatter.proficiency_bonus;
    } else if (isHalfProficient) {
      skillCheckValue += Math.floor(frontmatter.proficiency_bonus / 2);
    }

    for (const bonus of skillsBlock.bonuses) {
      if (bonus.target.toLowerCase() === skill.label.toLowerCase()) {
        skillCheckValue += bonus.value;
      }
    }

    const abbreviation = skill.ability.substring(0, 3).toUpperCase();

    data.push({
      label: skill.label,
      ability: abbreviation,
      modifier: skillCheckValue,
      isProficient: isProficient,
      isExpert: isExpert,
      isHalfProficient: isHalfProficient,
    });
    }

    return Tmpl.Render(SkillGrid({ items: data }));
    
  }
}
