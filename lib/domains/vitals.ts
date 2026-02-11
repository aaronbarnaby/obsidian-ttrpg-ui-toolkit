import { DHVitalsBlock, DHVitalsBlockInput, DHVitalsData } from "@/types/daggerheart/vitals";
import { DNDHitDice, DNDVitalsBlock, DNDVitalsBlockInput, DNDVitalsData } from "@/types/dnd/vitals";
import * as Utils from "lib/utils/utils";
import { VitalsBlockInput } from "@/types/vitals";
import { KeyValueStore } from "lib/services/kv/kv";
import { parse } from "yaml";

export function parseVitalsBlock(yamlString: string): VitalsBlockInput {
  const parsed = parse(yamlString);

  if (parsed.type === "daggerheart") {
    const dhDefaults: DHVitalsBlockInput = {
      type: "daggerheart",
      hp: 5,
      stress: 6,
      armor: 3,
      evasion: 10,
      thresholds: [4, 10],
    };
    const base = Utils.mergeWithDefaults(parsed, dhDefaults);
    return base;
  } else if (parsed.type === "dnd") {
    const dndDefaults: DNDVitalsBlockInput = {
      type: "dnd",
      hp: 0,
      hitdice: [],
    };
    const base = Utils.mergeWithDefaults(parsed, dndDefaults);
    return base;
  }

  throw new Error("Invalid vitals block type");
}

function dhKvKey(filePath: string, field: string): string {
  return `vitals:dh:${filePath}:${field}`;
}

function dndKvKey(filePath: string, field: string): string {
  return `vitals:dnd:${filePath}:${field}`;
}

/**
 * Normalize hitdice to an array and merge by dice (sum of value per dice string).
 */
export function normalizeHitDice(hitdice: DNDHitDice | DNDHitDice[]): DNDHitDice[] {
  const arr = Array.isArray(hitdice) ? hitdice : hitdice ? [hitdice] : [];
  const byDice = new Map<string, number>();
  for (const { dice, value } of arr) {
    byDice.set(dice, (byDice.get(dice) ?? 0) + value);
  }
  return Array.from(byDice.entries(), ([dice, value]) => ({ dice, value }));
}

/**
 * Load DaggerHeart vitals data, reading persisted used counts from KV.
 */
export async function loadDHVitalsData(
  block: DHVitalsBlock,
  kv: KeyValueStore,
  filePath: string
): Promise<DHVitalsData> {
  const usedHp = (await kv.get<number>(dhKvKey(filePath, "hp_used"))) ?? 0;
  const usedStress = (await kv.get<number>(dhKvKey(filePath, "stress_used"))) ?? 0;
  const usedArmor = (await kv.get<number>(dhKvKey(filePath, "armor_used"))) ?? 0;
  const hope = (await kv.get<number>(dhKvKey(filePath, "hope"))) ?? 0;

  return {
    type: "daggerheart",
    hp_blocks: block.hp,
    used_hp_blocks: Math.min(usedHp, block.hp),
    stress_blocks: block.stress,
    used_stress_blocks: Math.min(usedStress, block.stress),
    armor_blocks: block.armor,
    used_armor_blocks: Math.min(usedArmor, block.armor),
    hope,
  };
}

/**
 * Persist an updated used-block count to KV.
 */
export async function toggleDHVitalBlock(
  kv: KeyValueStore,
  filePath: string,
  vitalKey: string,
  newUsed: number
): Promise<void> {
  await kv.set(dhKvKey(filePath, vitalKey), newUsed);
}

/**
 * Load DND vitals data from block + KV. Hit dice are normalized and merged by dice.
 */
export async function loadDNDVitalsData(
  block: DNDVitalsBlock,
  kv: KeyValueStore,
  filePath: string
): Promise<DNDVitalsData> {
  const hitdice = normalizeHitDice(block.hitdice);
  const hp = Math.min(Math.max((await kv.get<number>(dndKvKey(filePath, "hp"))) ?? 0, 0), block.hp);
  const temp_hp = Math.max((await kv.get<number>(dndKvKey(filePath, "temp_hp"))) ?? 0, 0);
  const death_save_successes = Math.min(
    Math.max((await kv.get<number>(dndKvKey(filePath, "death_save_successes"))) ?? 0, 0),
    3
  );
  const death_save_failures = Math.min(
    Math.max((await kv.get<number>(dndKvKey(filePath, "death_save_failures"))) ?? 0, 0),
    3
  );
  const hitdice_usedRaw = await kv.get<Record<string, number>>(dndKvKey(filePath, "hitdice_used"));
  const hitdice_used: Record<string, number> = {};
  for (const { dice, value: total } of hitdice) {
    const used = hitdice_usedRaw?.[dice] ?? 0;
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

/**
 * Persist a single DND vitals field to KV.
 */
export async function saveDNDVitalsField(
  kv: KeyValueStore,
  filePath: string,
  field: string,
  value: number | Record<string, number>
): Promise<void> {
  await kv.set(dndKvKey(filePath, field), value);
}
