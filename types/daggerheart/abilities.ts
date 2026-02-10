import { DHCoreBlock } from "./core";

export type DHAbilityName =
  | "Agility"
  | "Strength"
  | "Finesse"
  | "Instinct"
  | "Presence"
  | "Knowledge";

export type DHAbilityMap = Partial<Record<DHAbilityName, number>>;

export type DHAbilityBlock = DHCoreBlock & {
  abilities: DHAbilityMap;
  bonuses?: DHAbilityMap | DHAbilityMap[];
}

export type DHAbility = DHCoreBlock & {
  label: string;
  modifier: number;
  list: string[];
};

export const DH_ABILITIES_ORDER: DHAbilityName[] = [
  "Agility",
  "Strength",
  "Finesse",
  "Instinct",
  "Presence",
  "Knowledge",
];
