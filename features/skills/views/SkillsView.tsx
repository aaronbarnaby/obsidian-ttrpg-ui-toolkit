import { MarkdownPostProcessorContext } from "obsidian";
import { BaseView } from "@/features/shared/BaseView";
import { useFileContext } from "@/features/shared/filecontext";
import { AbilityBlock } from "@/types/abilities";
import { DNDAbilityName, GenericBonus } from "@/types/dnd/abilities";
import { SkillGrid, SkillItem } from "@/components/skills/SkillGrid";
import { renderHtml } from "@/lib/utils/html-templates";
import { abilityService } from "@/lib/services/ability/AbilityService";
import { SkillsService, skillsService } from "@/lib/services/skills/SkillsService";

export class SkillsView extends BaseView {
  public codeblock = "skills";

  public render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): string {
    let abilityBlock: AbilityBlock;
    try {
      abilityBlock = abilityService.parseAbilityBlockFromDocument(el, ctx);
    } catch {
      return "ERROR: No ability block found for skills view";
    }

    if (abilityBlock.type !== "dnd") {
      throw new Error("Skills view only supports DND ability blocks");
    }

    const skillsBlock = skillsService.parseSkillsBlock(source);
    const frontmatter = useFileContext(this.app, ctx).frontmatter();
    const data: SkillItem[] = [];

    for (const skill of SkillsService.Skills) {
      const isHalfProficient = skillsBlock.half_proficiencies.some(
        (x) => x.toLowerCase() === skill.label.toLowerCase()
      );
      const isProficient = skillsBlock.proficiencies.some(
        (x) => x.toLowerCase() === skill.label.toLowerCase()
      );
      const isExpert = skillsBlock.expertise.some(
        (x) => x.toLowerCase() === skill.label.toLowerCase()
      );

      const skillAbility =
        abilityBlock.abilities[skill.ability as keyof AbilityBlock["abilities"]];
      if (!skillAbility) {
        throw new Error(`Skill ${skill.ability} not found in Skills list`);
      }

      const totalAbilityScore = abilityService.getTotalScore(
        skillAbility,
        skill.ability as DNDAbilityName,
        abilityBlock.bonuses as GenericBonus[]
      );

      let skillCheckValue = abilityService.calculateModifier(totalAbilityScore);
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

      data.push({
        label: skill.label,
        ability: skill.ability.substring(0, 3).toUpperCase(),
        modifier: skillCheckValue,
        isProficient,
        isExpert,
        isHalfProficient,
      });
    }

    return renderHtml(SkillGrid({ items: data }));
  }
}

