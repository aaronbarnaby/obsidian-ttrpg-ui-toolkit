import { DHVitalsBlock, DHVitalsBlockInput, DHVitalsData } from "@/types/daggerheart/vitals";
import { DNDHitDice, DNDVitalsBlock, DNDVitalsData } from "@/types/dnd/vitals";
import { VitalsBlockInput } from "@/types/vitals";
import { KeyValueStore } from "lib/services/kv/kv";
import { TemplateContext } from "@/lib/utils/template";
import { vitalsService } from "@/lib/services/vitals/VitalsService";

export function parseVitalsBlock(yamlString: string): VitalsBlockInput {
  return vitalsService.parseVitalsBlock(yamlString);
}

export function resolveDHVitalsBlockFromInput(
  input: DHVitalsBlockInput,
  templateContext: TemplateContext | null
): DHVitalsBlock {
  return vitalsService.resolveDHVitalsBlockFromInput(input, templateContext);
}

export function normalizeHitDice(hitdice: DNDHitDice | DNDHitDice[]): DNDHitDice[] {
  return vitalsService.normalizeHitDice(hitdice);
}

export function loadDHVitalsData(
  block: DHVitalsBlock,
  kv: KeyValueStore,
  filePath: string
): Promise<DHVitalsData> {
  return vitalsService.loadDHVitalsData(block, kv, filePath);
}

export function toggleDHVitalBlock(
  kv: KeyValueStore,
  filePath: string,
  vitalKey: string,
  newUsed: number
): Promise<void> {
  return vitalsService.toggleDHVitalBlock(kv, filePath, vitalKey, newUsed);
}

export function loadDNDVitalsData(
  block: DNDVitalsBlock,
  kv: KeyValueStore,
  filePath: string
): Promise<DNDVitalsData> {
  return vitalsService.loadDNDVitalsData(block, kv, filePath);
}

export function saveDNDVitalsField(
  kv: KeyValueStore,
  filePath: string,
  field: string,
  value: number | Record<string, number>
): Promise<void> {
  return vitalsService.saveDNDVitalsField(kv, filePath, field, value);
}
