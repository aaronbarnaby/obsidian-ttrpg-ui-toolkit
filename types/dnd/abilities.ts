import { DNDCoreBlock } from "./core";

export type DNDAbilityName =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";

export type DNDAbilityMap = Partial<Record<DNDAbilityName, number>>;

export type GenericBonus = {
  name: string;
  target: DNDAbilityName;
  value: number;
  modifies?: "saving_throw" | "score"; // Defaults to 'saving_throw'
};

export type DNDAbilityBlock = DNDCoreBlock & {
  abilities: DNDAbilityMap;
  bonuses: GenericBonus[];
  proficiencies: string[];
}

export type DNDAbility = DNDCoreBlock & {
  label: string;
  total: number;
  modifier: number;
  isProficient: boolean;
  savingThrow: number;
};
