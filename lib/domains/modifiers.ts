import { App, TFile } from "obsidian";
import { Feature, FeatureModifier, AggregatedModifiers } from "@/types/features";
import { parseFeatureBlock } from "./features";
import { extractFirstCodeBlock } from "../utils/codeblock-extractor";
import { loadEquipmentDataForFile } from "../utils/template";
import { parseYamlSafe } from "../utils/yaml";

const DEFAULT_AGGREGATED: AggregatedModifiers = {
  ability: {},
  property: {},
};

function normalizeFeatureFromRaw(raw: unknown): Feature {
  if (raw == null || typeof raw !== "object") {
    return { passives: [], actions: [] };
  }
  const o = raw as Record<string, unknown>;
  return {
    passives: Array.isArray(o.passives) ? o.passives : [],
    actions: Array.isArray(o.actions) ? o.actions : [],
  };
}

function addModifierInto(
  out: AggregatedModifiers,
  mod: FeatureModifier
): void {
  const type = mod.type === "ability" ? "ability" : "property";
  const key = String(mod.property ?? "").trim();
  if (!key || typeof mod.value !== "number" || Number.isNaN(mod.value)) return;
  out[type][key] = (out[type][key] ?? 0) + mod.value;
}

/**
 * Aggregate all modifiers from a single Feature (passives only) into one map.
 * Sums values by (type, property). Missing or unknown type is treated as "property".
 */
export function aggregateModifiersFromFeatures(
  features: Feature
): AggregatedModifiers {
  const out: AggregatedModifiers = {
    ability: {},
    property: {},
  };
  if (!features?.passives || !Array.isArray(features.passives)) return out;
  for (const p of features.passives) {
    if (!p?.modifiers || !Array.isArray(p.modifiers)) continue;
    for (const mod of p.modifiers) {
      addModifierInto(out, mod);
    }
  }
  return out;
}

function mergeAggregated(
  target: AggregatedModifiers,
  source: AggregatedModifiers
): void {
  for (const type of ["ability", "property"] as const) {
    for (const key of Object.keys(source[type])) {
      target[type][key] = (target[type][key] ?? 0) + source[type][key];
    }
  }
}

function resolveLinkToPath(
  app: App,
  entry: string,
  sourcePath: string
): string | null {
  const linkpath = entry.replace(/^\[\[|\]\]$/g, "").split("|")[0].trim();
  const dest = app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
  if (!dest || !(dest instanceof TFile)) return null;
  return dest.path;
}

type EquipmentBlockYaml = { items?: unknown[] };

/**
 * Scan a file for feature blocks and equipment (including linked equipment with features),
 * then combine all modifiers by type and property (sum values).
 */
export async function getAggregatedModifiersForFile(
  app: App,
  filePath: string
): Promise<AggregatedModifiers> {
  const result: AggregatedModifiers = {
    ability: { ...DEFAULT_AGGREGATED.ability },
    property: { ...DEFAULT_AGGREGATED.property },
  };

  let content: string;
  try {
    const file = app.vault.getAbstractFileByPath(filePath);
    if (!file || !(file instanceof TFile)) return result;
    content = await app.vault.read(file);
  } catch (err) {
    console.error("Error reading file for modifiers:", filePath, err);
    return result;
  }

  // 1) Features block
  const featureContent = extractFirstCodeBlock(content, "features");
  if (featureContent) {
    try {
      const features = parseFeatureBlock(featureContent);
      mergeAggregated(result, aggregateModifiersFromFeatures(features));
    } catch (err) {
      console.error("Error parsing features block:", filePath, err);
    }
  }

  // 2) Equipment block: items (inline + links)
  const equipmentContent = extractFirstCodeBlock(content, "equipment");
  if (equipmentContent) {
    try {
      const block = parseYamlSafe<EquipmentBlockYaml>(equipmentContent);
      const items = Array.isArray(block?.items) ? block.items : [];
      for (const item of items) {
        if (item == null) continue;
        if (typeof item === "string") {
          const path = resolveLinkToPath(app, item, filePath);
          if (!path) continue;
          const equipment = await loadEquipmentDataForFile(app, path);
          if (equipment?.features) {
            mergeAggregated(
              result,
              aggregateModifiersFromFeatures(equipment.features)
            );
          }
        } else if (typeof item === "object" && item !== null) {
          const o = item as Record<string, unknown>;
          if (o.features != null) {
            const features = normalizeFeatureFromRaw(o.features);
            mergeAggregated(result, aggregateModifiersFromFeatures(features));
          }
        }
      }
    } catch (err) {
      console.error("Error parsing equipment block for modifiers:", filePath, err);
    }
  }

  return result;
}
