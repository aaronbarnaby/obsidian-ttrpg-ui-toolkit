import { SkillsBlock } from "@/types/dnd/skills";
import { SkillsService, skillsService } from "@/lib/services/skills/SkillsService";

export const Skills = [...SkillsService.Skills];

export function parseSkillsBlock(yamlString: string): SkillsBlock {
  return skillsService.parseSkillsBlock(yamlString);
}
