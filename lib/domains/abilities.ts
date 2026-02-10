import { MarkdownPostProcessorContext } from "obsidian";
import * as Utils from "lib/utils/utils";
import { parse } from "yaml";
import { extractFirstCodeBlock } from "../utils/codeblock-extractor";
import { AbilityBlock } from "types/abilities";
import { DNDAbilityName, GenericBonus } from "types/dnd/abilities";
import { DHAbilityMap, DHAbilityName, DH_ABILITIES_ORDER } from "types/daggerheart/abilities";

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
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    bonuses: [],
    proficiencies: [],
  };

  const daggerheartDefault: AbilityBlock = {
    type: 'daggerheart',
    abilities: {
      Agility: 0,
      Strength: 0,
      Finesse: 0,
      Instinct: 0,
      Presence: 0,
      Knowledge: 0,
    }
  };

  const parsed = parse(yamlString);

  if (parsed.type === 'daggerheart') {
    // DH Bonuses
    const base = Utils.mergeWithDefaults(parsed, daggerheartDefault);

    const collect = (val: any) => {
      if (!val) return {} as DHAbilityMap;
      if (Array.isArray(val)) return val.reduce((acc, cur) => addDHAbilityMaps(acc, normalizeDHAbilityMap(cur)), {} as DHAbilityMap);
      return normalizeDHAbilityMap(val);
    }

    let abilitySum: DHAbilityMap = addDHAbilityMaps(collect(base.abilities), collect(base.bonuses))

    return {
      type: 'daggerheart',
      abilities: abilitySum
    }
  }

  // DND Bonuses

  return Utils.mergeWithDefaults(parsed, dndDefault);
}

function normalizeDHAbilityMap(obj: any): DHAbilityMap {
  const out: DHAbilityMap = {};
  if (!obj || typeof obj !== "object") return out;

  // Accept canonical names (Agility) and case-insensitive keys (agility)
  const lowerToCanon = new Map<string, DHAbilityName>(
    DH_ABILITIES_ORDER.map((n) => [n.toLowerCase(), n])
  );

  // Iterate provided keys for flexibility
  for (const key of Object.keys(obj)) {
    const canon = lowerToCanon.get(key.toLowerCase());
    if (!canon) continue;
    const num = Number((obj as any)[key] ?? 0);
    if (!Number.isNaN(num)) out[canon] = num;
  }

  // Ensure missing keys are treated as 0 downstream (handled by callers)
  return out;
}

function addDHAbilityMaps(a: DHAbilityMap, b: DHAbilityMap): DHAbilityMap {
  const out: DHAbilityMap = {};
  for (const k of DH_ABILITIES_ORDER) {
    out[k] = (a[k] ?? 0) + (b[k] ?? 0);
  }
  return out;
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
export function getModifiersForAbility(modifiers: GenericBonus[], ability: DNDAbilityName): GenericBonus[] {
  return modifiers.filter((mod) => mod.target === ability);
}

// Calculate total score including modifiers that affect the score itself
export function getTotalScore(baseScore: number, ability: DNDAbilityName, modifiers: GenericBonus[]): number {
  const abilityModifiers = getModifiersForAbility(modifiers, ability).filter(
    (mod) => !mod.modifies || mod.modifies === "score"
  ); // Only include score modifiers
  const modifierTotal = abilityModifiers.reduce((sum, mod) => sum + mod.value, 0);
  return baseScore + modifierTotal;
}

// Calculate saving throw bonus from modifiers that affect saving throws
export function getSavingThrowBonus(ability: DNDAbilityName, modifiers: GenericBonus[]): number {
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
