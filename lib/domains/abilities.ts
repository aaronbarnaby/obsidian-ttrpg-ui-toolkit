import { AbilityBlock, GenericBonus, DNDAbilityScores, DaggerHeartAbilityScores } from "lib/types";
import { MarkdownPostProcessorContext } from "obsidian";
import * as Utils from "lib/utils/utils";
import { parse } from "yaml";
import { extractFirstCodeBlock } from "../utils/codeblock-extractor";

export function parseAbilityBlockFromDocument(el: HTMLElement, ctx: MarkdownPostProcessorContext): AbilityBlock {
  const sectionInfo = ctx.getSectionInfo(el);
  const documentText = sectionInfo?.text || "";

  const abilityContent = extractFirstCodeBlock(documentText, "ability");

  if (!abilityContent) {
    throw new Error("No ability code blocks found");
  }

  return parseAbilityBlock(abilityContent);
}

export function parseAbilityBlock(yamlString: string): AbilityBlock {
  const dndDefault: AbilityBlock = {
    type: 'dnd',
    abilities: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
    bonuses: [],
    proficiencies: [],
  };

  const daggerheartDefault: AbilityBlock = {
    type: 'daggerheart',
    abilities: {
      agility: 0,
      strength: 0,
      finesse: 0,
      instinct: 0,
      presence: 0,
      knowledge: 0,
    }
  };

  const parsed = parse(yamlString);

  if (parsed.type === 'daggerheart') {
    return Utils.mergeWithDefaults(parsed, daggerheartDefault);
  }

  return Utils.mergeWithDefaults(parsed, dndDefault);
}

// Calculate ability modifier according to D&D 5e rules
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Format the modifier with + or - sign
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

// Get modifiers for a specific ability
export function getModifiersForAbility(modifiers: GenericBonus[], ability: keyof DNDAbilityScores): GenericBonus[] {
  return modifiers.filter((mod) => mod.target === ability);
}

// Calculate total score including modifiers that affect the score itself
export function getTotalScore(baseScore: number, ability: keyof DNDAbilityScores, modifiers: GenericBonus[]): number {
  const abilityModifiers = getModifiersForAbility(modifiers, ability).filter(
    (mod) => !mod.modifies || mod.modifies === "score"
  ); // Only include score modifiers
  const modifierTotal = abilityModifiers.reduce((sum, mod) => sum + mod.value, 0);
  return baseScore + modifierTotal;
}

// Calculate saving throw bonus from modifiers that affect saving throws
export function getSavingThrowBonus(ability: keyof DNDAbilityScores, modifiers: GenericBonus[]): number {
  const savingThrowModifiers = getModifiersForAbility(modifiers, ability).filter(
    (mod) => !mod.modifies || mod.modifies === "saving_throw"
  ); // Default to saving_throw if not specified
  return savingThrowModifiers.reduce((sum, mod) => sum + mod.value, 0);
}

export function getDaggerHeartAbilityList(ability: string): string[] {
  switch (ability.toLowerCase()) {
    case 'agility':
      return ['Sprint', 'Dodge', 'Leap'];
    case 'strength':
      return ['Lift', 'Smash', 'Grapple'];
    case 'finesse':
      return ['Control', 'Hide', 'Tinker'];
    case 'instinct':
      return ['Perceive', 'Sense', 'Navigate'];
    case 'presence':
      return ['Charm', 'Perform', 'Deceive'];
    case 'knowledge':
      return ['Recall', 'Analyze', 'Comprehend'];
    default:
      return [];
  }
}
