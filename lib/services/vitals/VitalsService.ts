import { DHVitalsBlock, DHVitalsBlockInput, DHVitalsData } from "@/types/daggerheart/vitals";
import { DNDHitDice, DNDVitalsBlock, DNDVitalsBlockInput, DNDVitalsData } from "@/types/dnd/vitals";
import { VitalsBlockInput } from "@/types/vitals";
import { KeyValueStore } from "@/lib/services/kv/kv";
import * as Utils from "@/lib/utils/utils";
import {
  hasTemplateVariables,
  parseTemplateNumber,
  parseTemplateThresholds,
  processTemplate,
  TemplateContext,
} from "@/lib/utils/template";
import { parse } from "yaml";

export class VitalsService {
  public parseVitalsBlock(yamlString: string): VitalsBlockInput {
    const parsed = parse(yamlString);

    if (parsed.type === "daggerheart") {
      const defaults: DHVitalsBlockInput = {
        type: "daggerheart",
        hp: 5,
        stress: 6,
        armor: 3,
        evasion: 10,
        thresholds: [4, 10],
      };
      return Utils.mergeWithDefaults(parsed, defaults);
    }

    if (parsed.type === "dnd") {
      const defaults: DNDVitalsBlockInput = {
        type: "dnd",
        hp: 0,
        hitdice: [],
      };
      return Utils.mergeWithDefaults(parsed, defaults);
    }

    throw new Error("Invalid vitals block type");
  }

  public resolveDHVitalsBlockFromInput(
    input: DHVitalsBlockInput,
    templateContext: TemplateContext | null
  ): DHVitalsBlock {
    const hp = this.resolveDHVitalsNum(input.hp, templateContext, 5);
    const stress = this.resolveDHVitalsNum(input.stress, templateContext, 6);
    const armor = this.resolveDHVitalsNum(input.armor, templateContext, 3);
    const evasion = this.resolveDHVitalsNum(input.evasion, templateContext, 10);
    const thresholdsIn = input.thresholds;

    const thresholds: [number, number] =
      typeof thresholdsIn === "object"
        ? thresholdsIn
        : parseTemplateThresholds(
            templateContext &&
              typeof thresholdsIn === "string" &&
              hasTemplateVariables(thresholdsIn)
              ? processTemplate(thresholdsIn, templateContext)
              : String(thresholdsIn ?? "4, 10"),
            [4, 10]
          );

    return {
      ...input,
      hp,
      stress,
      armor,
      evasion,
      thresholds,
    };
  }

  public normalizeHitDice(hitdice: DNDHitDice | DNDHitDice[]): DNDHitDice[] {
    const arr = Array.isArray(hitdice) ? hitdice : hitdice ? [hitdice] : [];
    const byDice = new Map<string, number>();
    for (const { dice, value } of arr) {
      byDice.set(dice, (byDice.get(dice) ?? 0) + value);
    }
    return Array.from(byDice.entries(), ([dice, value]) => ({ dice, value }));
  }

  public async loadDHVitalsData(
    block: DHVitalsBlock,
    kv: KeyValueStore,
    filePath: string
  ): Promise<DHVitalsData> {
    const hpUsed = (await kv.get<number>(this.dhKvKey(filePath, "hp_used"))) ?? 0;
    const stressUsed = (await kv.get<number>(this.dhKvKey(filePath, "stress_used"))) ?? 0;
    const armorUsed = (await kv.get<number>(this.dhKvKey(filePath, "armor_used"))) ?? 0;
    const hope = (await kv.get<number>(this.dhKvKey(filePath, "hope"))) ?? 0;

    return {
      type: "daggerheart",
      hp_used: Math.min(hpUsed, block.hp),
      stress_used: Math.min(stressUsed, block.stress),
      armor_used: Math.min(armorUsed, block.armor),
      hope,
    };
  }

  public async toggleDHVitalBlock(
    kv: KeyValueStore,
    filePath: string,
    vitalKey: string,
    newUsed: number
  ): Promise<void> {
    await kv.set(this.dhKvKey(filePath, vitalKey), newUsed);
  }

  public async loadDNDVitalsData(
    block: DNDVitalsBlock,
    kv: KeyValueStore,
    filePath: string
  ): Promise<DNDVitalsData> {
    const hitdice = this.normalizeHitDice(block.hitdice);
    const hp = Math.min(
      Math.max((await kv.get<number>(this.dndKvKey(filePath, "hp"))) ?? 0, 0),
      block.hp
    );
    const temp_hp = Math.max(
      (await kv.get<number>(this.dndKvKey(filePath, "temp_hp"))) ?? 0,
      0
    );
    const death_save_successes = Math.min(
      Math.max(
        (await kv.get<number>(this.dndKvKey(filePath, "death_save_successes"))) ?? 0,
        0
      ),
      3
    );
    const death_save_failures = Math.min(
      Math.max(
        (await kv.get<number>(this.dndKvKey(filePath, "death_save_failures"))) ?? 0,
        0
      ),
      3
    );
    const hitdiceUsedRaw = await kv.get<Record<string, number>>(
      this.dndKvKey(filePath, "hitdice_used")
    );
    const hitdice_used: Record<string, number> = {};
    for (const { dice, value: total } of hitdice) {
      const used = hitdiceUsedRaw?.[dice] ?? 0;
      hitdice_used[dice] = Math.min(Math.max(used, 0), total);
    }

    return {
      type: "dnd",
      hp,
      temp_hp,
      hitdice_used,
      death_save_successes,
      death_save_failures,
    };
  }

  public async saveDNDVitalsField(
    kv: KeyValueStore,
    filePath: string,
    field: string,
    value: number | Record<string, number>
  ): Promise<void> {
    await kv.set(this.dndKvKey(filePath, field), value);
  }

  private resolveDHVitalsNum(
    value: string | number,
    templateContext: TemplateContext | null,
    fallback: number
  ): number {
    if (typeof value === "number") {
      return value;
    }

    const source = String(value ?? "");
    return parseTemplateNumber(
      templateContext && hasTemplateVariables(source)
        ? processTemplate(source, templateContext)
        : source,
      fallback
    );
  }

  private dhKvKey(filePath: string, field: string): string {
    return `vitals:dh:${filePath}:${field}`;
  }

  private dndKvKey(filePath: string, field: string): string {
    return `vitals:dnd:${filePath}:${field}`;
  }
}

export const vitalsService = new VitalsService();

