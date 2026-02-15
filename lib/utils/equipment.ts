import { App, TFile } from "obsidian";
import { DHEquipment } from "@/types/daggerheart/equipment";
import { Feature } from "@/types/features";
import {
  equipmentFromFrontmatter,
  loadEquipmentDataForFile,
} from "./template";

/**
 * Resolve a wiki-link or path string to an absolute vault file path, or null.
 */
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

function normalizeFeature(raw: unknown): Feature {
  if (raw == null || typeof raw !== "object") {
    return { passives: [], actions: [] };
  }
  const o = raw as Record<string, unknown>;
  return {
    passives: Array.isArray(o.passives) ? o.passives : [],
    actions: Array.isArray(o.actions) ? o.actions : [],
  };
}

export type DHEquipmentWithPath = DHEquipment & { filePath?: string };

/**
 * Normalize one raw equipment entry (object or link string) to DHEquipment.
 * For strings, resolves the link and loads from the linked file (async);
 * in that case the returned object includes filePath.
 */
async function resolveEquipmentItem(
  item: unknown,
  app: App,
  sourcePath: string
): Promise<DHEquipmentWithPath | null> {
  if (item == null) return null;
  if (typeof item === "string") {
    const filePath = resolveLinkToPath(app, item, sourcePath);
    if (!filePath) return null;
    const data = await loadEquipmentDataForFile(app, filePath);
    if (!data) return null;
    return { ...data, filePath };
  }
  if (typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const base = equipmentFromFrontmatter(o);
  const features = o.features != null ? normalizeFeature(o.features) : undefined;
  return {
    ...base,
    features,
  };
}

/**
 * Resolve block items and equipped frontmatter into a single list of DHEquipment.
 * Block items come first, then equipped. Link strings are resolved async.
 * Items resolved from a link include filePath for opening the source file.
 */
export async function resolveEquipmentList(
  app: App,
  sourcePath: string,
  blockItems: unknown[],
  equipped: unknown
): Promise<DHEquipmentWithPath[]> {
  const equippedArr =
    equipped == null ? [] : Array.isArray(equipped) ? equipped : [equipped];
  const allRaw = [...blockItems, ...equippedArr];
  const result: DHEquipmentWithPath[] = [];
  for (const item of allRaw) {
    const resolved = await resolveEquipmentItem(item, app, sourcePath);
    if (resolved && resolved.name) result.push(resolved);
  }
  return result;
}
