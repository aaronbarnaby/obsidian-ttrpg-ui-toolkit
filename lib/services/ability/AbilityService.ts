import { MarkdownPostProcessorContext } from "obsidian";
import { parse } from "yaml";
import { extractFirstCodeBlock } from "@/lib/utils/codeblock-extractor";
import { AbilityBlock } from "@/types/abilities";
import { DNDAbilityName, GenericBonus } from "@/types/dnd/abilities";
import { DHAbilityMap, DHAbilityName, DH_ABILITIES_ORDER } from "@/types/daggerheart/abilities";
import * as Utils from "@/lib/utils/utils";

export class AbilityService {
  public parseAbilityBlockFromDocument(
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ): AbilityBlock {
    const sectionInfo = ctx.getSectionInfo(el);
    const documentText = sectionInfo?.text || "";
    const abilityContent = extractFirstCodeBlock(documentText, "ability");

    if (!abilityContent) {
      throw new Error("No ability code blocks found");
    }

    return this.parseAbilityBlock(abilityContent);
  }

  public parseAbilityBlock(yamlString: string): AbilityBlock {
    const dndDefault: AbilityBlock = {
      type: "dnd",
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
      type: "daggerheart",
      abilities: {
        Agility: 0,
        Strength: 0,
        Finesse: 0,
        Instinct: 0,
        Presence: 0,
        Knowledge: 0,
      },
    };

    const parsed = parse(yamlString);
    if (parsed.type === "daggerheart") {
      const base = Utils.mergeWithDefaults(parsed, daggerheartDefault);
      const collect = (val: unknown): DHAbilityMap => {
        if (!val) return {};
        if (Array.isArray(val)) {
          return val.reduce(
            (acc, cur) => this.addDHAbilityMaps(acc, this.normalizeDHAbilityMap(cur)),
            {} as DHAbilityMap
          );
        }
        return this.normalizeDHAbilityMap(val);
      };

      const abilitySum = this.addDHAbilityMaps(
        collect(base.abilities),
        collect(base.bonuses)
      );
      return {
        type: "daggerheart",
        abilities: abilitySum,
      };
    }

    return Utils.mergeWithDefaults(parsed, dndDefault);
  }

  public calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  public formatModifier(modifier: number): string {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  }

  public getModifiersForAbility(modifiers: GenericBonus[], ability: DNDAbilityName): GenericBonus[] {
    return modifiers.filter((mod) => mod.target === ability);
  }

  public getTotalScore(baseScore: number, ability: DNDAbilityName, modifiers: GenericBonus[]): number {
    const abilityModifiers = this.getModifiersForAbility(modifiers, ability).filter(
      (mod) => !mod.modifies || mod.modifies === "score"
    );
    const modifierTotal = abilityModifiers.reduce((sum, mod) => sum + mod.value, 0);
    return baseScore + modifierTotal;
  }

  public getSavingThrowBonus(ability: DNDAbilityName, modifiers: GenericBonus[]): number {
    const savingThrowModifiers = this.getModifiersForAbility(modifiers, ability).filter(
      (mod) => !mod.modifies || mod.modifies === "saving_throw"
    );
    return savingThrowModifiers.reduce((sum, mod) => sum + mod.value, 0);
  }

  public getDaggerHeartAbilityList(ability: string): string[] {
    switch (ability.toLowerCase()) {
      case "agility":
        return ["Sprint", "Dodge", "Leap"];
      case "strength":
        return ["Lift", "Smash", "Grapple"];
      case "finesse":
        return ["Control", "Hide", "Tinker"];
      case "instinct":
        return ["Perceive", "Sense", "Navigate"];
      case "presence":
        return ["Charm", "Perform", "Deceive"];
      case "knowledge":
        return ["Recall", "Analyze", "Comprehend"];
      default:
        return [];
    }
  }

  private normalizeDHAbilityMap(obj: unknown): DHAbilityMap {
    const out: DHAbilityMap = {};
    if (!obj || typeof obj !== "object") return out;
    const lowerToCanon = new Map<string, DHAbilityName>(
      DH_ABILITIES_ORDER.map((name) => [name.toLowerCase(), name])
    );
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      const canonical = lowerToCanon.get(key.toLowerCase());
      if (!canonical) continue;
      const num = Number((obj as Record<string, unknown>)[key] ?? 0);
      if (!Number.isNaN(num)) {
        out[canonical] = num;
      }
    }
    return out;
  }

  private addDHAbilityMaps(a: DHAbilityMap, b: DHAbilityMap): DHAbilityMap {
    const out: DHAbilityMap = {};
    for (const key of DH_ABILITIES_ORDER) {
      out[key] = (a[key] ?? 0) + (b[key] ?? 0);
    }
    return out;
  }
}

export const abilityService = new AbilityService();
export const formatModifier = (modifier: number): string => abilityService.formatModifier(modifier);

