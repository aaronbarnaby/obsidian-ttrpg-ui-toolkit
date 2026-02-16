import { MarkdownPostProcessorContext } from "obsidian";
import { AbilityBlock } from "types/abilities";
import { DNDAbilityName, GenericBonus } from "types/dnd/abilities";
import { abilityService } from "@/lib/services/ability/AbilityService";

export function parseAbilityBlockFromDocument(el: HTMLElement, ctx: MarkdownPostProcessorContext): AbilityBlock {
  return abilityService.parseAbilityBlockFromDocument(el, ctx);
}

export function parseAbilityBlock(yamlString: string): AbilityBlock {
  return abilityService.parseAbilityBlock(yamlString);
}

// Calculate ability modifier according to D&D 5e rules
export function calculateModifier(score: number): number {
  return abilityService.calculateModifier(score);
}

// Format the modifier with + or - sign
export function formatModifier(modifier: number): string {
  return abilityService.formatModifier(modifier);
}

// Get modifiers for a specific ability
export function getModifiersForAbility(modifiers: GenericBonus[], ability: DNDAbilityName): GenericBonus[] {
  return abilityService.getModifiersForAbility(modifiers, ability);
}

// Calculate total score including modifiers that affect the score itself
export function getTotalScore(baseScore: number, ability: DNDAbilityName, modifiers: GenericBonus[]): number {
  return abilityService.getTotalScore(baseScore, ability, modifiers);
}

// Calculate saving throw bonus from modifiers that affect saving throws
export function getSavingThrowBonus(ability: DNDAbilityName, modifiers: GenericBonus[]): number {
  return abilityService.getSavingThrowBonus(ability, modifiers);
}

export function getDaggerHeartAbilityList(ability: string): string[] {
  return abilityService.getDaggerHeartAbilityList(ability);
}
