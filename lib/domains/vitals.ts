import { DHVitalsBlock, DHVitalsData } from "@/types/daggerheart/vitals";
import { DNDVitalsBlock } from "@/types/dnd/vitals";
import * as Utils from "lib/utils/utils";
import { VitalsBlock } from "@/types/vitals";
import { KeyValueStore } from "lib/services/kv/kv";
import { parse } from "yaml";

export function parseVitalsBlock(yamlString: string): VitalsBlock {
  const parsed = parse(yamlString);

  if (parsed.type === "daggerheart") {
    const dhDefaults: DHVitalsBlock = {
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
    const dndDefaults: DNDVitalsBlock = {
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
