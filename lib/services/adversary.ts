import { App, TFile } from "obsidian";
import {
  AdversaryTemplateContext,
  equipmentFromFrontmatter,
  loadAdversaryTemplateContextForFile,
  loadEquipmentDataForFile,
  parseTemplateNumber,
} from "../utils/template";
import { DHAdversary } from "@/types/daggerheart/adversary";
import { DHEquipment } from "@/types/daggerheart/equipment";
import type { DHInitiativeAdversary, DHInitiativeCustomAdversary, DHInitiativeLinkAdversary } from "@/types/daggerheart/initiative";

export type Adversary = {
  key: string;
  data: DHAdversary;
  filePath?: string;
  templateContext?: AdversaryTemplateContext;
};

/**
 * Resolve a adversary entry (link path or [[wiki]] link) to an absolute vault file path, or null.
 */
export function resolveAdversaryEntryToPath(
  app: App,
  entry: string,
  sourcePath: string
): string | null {
  const linkpath = entry.replace(/^\[\[|\]\]$/g, "").split("|")[0].trim();
  const dest = app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
  if (!dest || !(dest instanceof TFile)) return null;
  return dest.path;
}

/**
 * Normalize one raw equipment entry (object or link string) to DHEquipment.
 * When entry is a string and app/sourcePath are provided, resolves the link and loads
 * equipment data from the linked file's frontmatter via loadEquipmentDataForFile.
 */
function normalizeEquipmentItem(
  item: unknown,
  app?: App,
  sourcePath?: string
): DHEquipment | null {
  if (item == null) {
    return null;
  }
  if (typeof item === "string") {
    const link = item.replace(/^\[\[|\]\]$/g, "").split("|")[0].trim();
    if (app && sourcePath) {
      const filePath = resolveAdversaryEntryToPath(app, item, sourcePath);
      if (filePath) {
        const equipment = loadEquipmentDataForFile(app, filePath);
        if (equipment) return equipment;
      }
    }
    return null;
  }
  if (typeof item !== "object") {
    throw new Error("Equipment item must be an object or a string");
  }
  const o = item as Record<string, unknown>;
  return equipmentFromFrontmatter(o);
}

function normalizeEquipment(
  raw: unknown,
  app?: App,
  sourcePath?: string
): DHEquipment[] {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const result: DHEquipment[] = [];
  for (const item of arr) {
    const equipment = normalizeEquipmentItem(item, app, sourcePath);
    if (equipment) result.push(equipment);
  }
  return result;
}

export type ResolveAdversaryDataOptions = {
  /** When set, equipment entries that are link references are resolved and loaded from the linked file's frontmatter. sourcePath is the file containing the adversary (e.g. adversary note path). */
  app: App;
  sourcePath: string;
};

/**
 * Build DHAdversary from templateContext frontmatter. Each property is read from
 * frontmatter under the same key; defaults are used when missing or invalid.
 * Returns null when name is missing or empty so link-based loading skips the entry.
 * When options.app and options.sourcePath are provided, equipped links (e.g. [[Sword]]) are resolved and equipment data is loaded from the linked file's frontmatter.
 */
export function resolveAdversaryData(
  ctx: AdversaryTemplateContext,
  options?: ResolveAdversaryDataOptions
): DHAdversary | null {
  const fm = ctx.frontmatter;
  const name = typeof fm.name === "string" ? fm.name.trim() : "";
  if (!name) return null;

  const app = options?.app;
  const sourcePath = options?.sourcePath;

  return {
    name,
    tier: parseTemplateNumber(String(fm.tier ?? ""), 1),
    type: typeof fm.type === "string" ? fm.type.trim() : "Standard",
    difficulty: parseTemplateNumber(String(fm.difficulty ?? ""), 10),
    major_threshold: parseTemplateNumber(String(fm.major_threshold ?? ""), 0),
    severe_threshold: parseTemplateNumber(String(fm.severe_threshold ?? ""), 0),
    hp: parseTemplateNumber(String(fm.hp ?? ""), 4),
    stress: parseTemplateNumber(String(fm.stress ?? ""), 3),
    attack: parseTemplateNumber(String(fm.attack ?? ""), 0),
    equipped: normalizeEquipment(fm.equipped, app, sourcePath),
  };
}

function isCustomAdversary(adv: DHInitiativeAdversary): adv is DHInitiativeCustomAdversary {
  return adv.type === "custom";
}

function isLinkAdversary(adv: DHInitiativeAdversary): adv is DHInitiativeLinkAdversary {
  return adv.type === "link";
}

async function loadAdversaryFromLink(
  app: App,
  sourcePath: string,
  entry: string
): Promise<Omit<Adversary, "key"> | null> {
  const filePath = resolveAdversaryEntryToPath(app, entry, sourcePath);
  if (!filePath) return null;

  const templateContext = await loadAdversaryTemplateContextForFile(app, filePath);

  const data = resolveAdversaryData(templateContext, { app, sourcePath: filePath });
  if (!data) return null;

  return {
    data,
    filePath,
    templateContext,
  };
}

/**
 * Load the entire adversaries block from a DH initiative block.
 * - Custom items: data is taken from the block; filePath and templateContext are undefined.
 * - Link items: resolved via the link (same as former loadAdversary); filePath and templateContext are set.
 */
export async function loadAdversaries(
  app: App,
  sourcePath: string,
  adversaries: DHInitiativeAdversary[]
): Promise<Adversary[]> {
  const result: Adversary[] = [];

  for (const item of adversaries) {
    if (isCustomAdversary(item)) {
      const { type, key, ...data } = item;
      result.push({
        key,
        data: data as DHAdversary,
        filePath: undefined,
        templateContext: undefined,
      });
    } else if (isLinkAdversary(item)) {
      const loaded = await loadAdversaryFromLink(app, sourcePath, item.link);
      if (loaded) {
        result.push({
          key: item.key,
          ...loaded,
        });
      }
    }
  }

  return result;
}
