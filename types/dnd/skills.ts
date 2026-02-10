import { GenericBonus } from "./abilities";

export type SkillsBlock = {
  proficiencies: string[];
  expertise: string[];
  half_proficiencies: string[];
  bonuses: SkillsBlockBonus[];
};

export type SkillsBlockBonus = GenericBonus;  
