import * as Handlebars from "handlebars";
import { App, TFile } from "obsidian";
import { Frontmatter } from "@/types/core";
import { DHEquipment } from "@/types/daggerheart/equipment";
import { FileContext } from "@/features/shared/filecontext";
import { parseAbilityBlockFromDocument, parseAbilityBlock } from "@/lib/domains/abilities";
import * as Fm from "@/lib/domains/frontmatter";
import { getAggregatedModifiersForFile } from "@/lib/domains/modifiers";
import { extractFirstCodeBlock } from "@/lib/utils/codeblock-extractor";
import { Feature } from "@/types/features";
import { parseFeatureBlock } from "@/lib/domains/features";

export interface TemplateContext {
  frontmatter: Frontmatter;
  abilities: Record<string, number>;
}

export interface AdversaryTemplateContext {
  frontmatter: Frontmatter;
  features: Feature;
}

function init() {
  // Register helper functions for math operations
  Handlebars.registerHelper("add", (...args: any[]) => {
    // Last argument is handlebars options object, filter it out
    const numbers = args
      .slice(0, -1)
      .map((n) => Number(n))
      .filter((n) => !isNaN(n));
    return numbers.reduce((sum, n) => sum + n, 0);
  });
  Handlebars.registerHelper("subtract", (a: number, b: number) => a - b);
  Handlebars.registerHelper("multiply", (a: number, b: number) => a * b);
  Handlebars.registerHelper("divide", (a: number, b: number) => a / b);
  Handlebars.registerHelper("floor", (a: number) => Math.floor(a));
  Handlebars.registerHelper("ceil", (a: number) => Math.ceil(a));
  Handlebars.registerHelper("round", (a: number) => Math.round(a));

  // Text helpers
  Handlebars.registerHelper("strip-link", (a: string) => a.replace(/\[\[([^|]+)\|([^\]]+)\]\]/g, "$2"));
}
init();

export function hasTemplateVariables(text: string): boolean {
  return text.includes("{{") && text.includes("}}");
}

export function processTemplate(text: string, context: TemplateContext): string {
  if (!hasTemplateVariables(text)) {
    return text;
  }

  try {
    const template = Handlebars.compile(text);
    return template(context);
  } catch (error) {
    console.error("Template processing error:", error);
    return text; // Return original text if template processing fails
  }
}

/**
 * Apply property modifiers to a copy of frontmatter (adds modifier values to matching keys).
 */
function applyPropertyModifiers(
  frontmatter: Frontmatter,
  propertyModifiers: Record<string, number>
): Frontmatter {
  const out = { ...frontmatter };
  for (const key of Object.keys(propertyModifiers)) {
    const current = out[key];
    const num = typeof current === "number" && !Number.isNaN(current) ? current : 0;
    out[key] = num + (propertyModifiers[key] ?? 0);
  }
  return out;
}

export async function createTemplateContext(
  app: App,
  el: HTMLElement,
  ctx: FileContext
): Promise<TemplateContext> {
  let frontmatter = ctx.frontmatter();

  let abilities: Record<string, number> = {};
  try {
    const abilityBlock = parseAbilityBlockFromDocument(el, ctx.md());
    abilities = abilityBlock.abilities ?? {};
  } catch (error) {
    console.error("Error parsing ability block:", error);
  }

  const modifiers = await getAggregatedModifiersForFile(app, ctx.filepath);
  frontmatter = applyPropertyModifiers(frontmatter, modifiers.property);

  return {
    frontmatter,
    abilities,
  };
}

export async function loadFeaturesForFile(app: App, filePath: string): Promise<Feature> {
  let features: Feature = {
    passives: [],
    actions: [],
  };

  try {
    const file = app.vault.getAbstractFileByPath(filePath);
    if (!file || !(file instanceof TFile)) {
      return features;
    }
    const content = await app.vault.read(file);
    const featureContent = extractFirstCodeBlock(content, "features");
    if (featureContent) {
      features = parseFeatureBlock(featureContent);
    }
  } catch (err) {
    console.error("Error loading features for file:", filePath, err);
  }

  return features;
}

/**
 * Load TemplateContext (frontmatter + abilities) for an external file by path.
 * Use when resolving party member files from the initiative block.
 */
export async function loadTemplateContextForFile(app: App, filePath: string): Promise<TemplateContext> {
  const rawFm = app.metadataCache.getCache(filePath)?.frontmatter;
  let frontmatter = Fm.anyIntoFrontMatter(rawFm ?? {});

  let abilities: Record<string, number> = {};
  try {
    const file = app.vault.getAbstractFileByPath(filePath);
    if (!file || !(file instanceof TFile)) {
      const modifiers = await getAggregatedModifiersForFile(app, filePath);
      frontmatter = applyPropertyModifiers(frontmatter, modifiers.property);
      return { frontmatter, abilities };
    }
    const content = await app.vault.read(file);
    const abilityContent = extractFirstCodeBlock(content, "ability");
    if (abilityContent) {
      const block = parseAbilityBlock(abilityContent);
      abilities = block.abilities ?? {};
    }
  } catch (error) {
    console.error("Error loading template context for file:", filePath, error);
  }

  const modifiers = await getAggregatedModifiersForFile(app, filePath);
  frontmatter = applyPropertyModifiers(frontmatter, modifiers.property);

  return {
    frontmatter,
    abilities,
  };
}


export async function loadAdversaryTemplateContextForFile(app: App, filePath: string): Promise<AdversaryTemplateContext> {
  const rawFm = app.metadataCache.getCache(filePath)?.frontmatter;
  const frontmatter = Fm.anyIntoFrontMatter(rawFm ?? {});
  const features = await loadFeaturesForFile(app, filePath);

  return {
    frontmatter,
    features
  };
}

/** Coerce a template result string to number; use fallback when NaN. */
export function parseTemplateNumber(s: string, fallback: number): number {
  const n = Number(s);
  return Number.isNaN(n) ? fallback : n;
}

/** Parse a string like "4, 10" or "4 10" to [number, number]; use fallbacks when invalid. */
export function parseTemplateThresholds(
  s: string,
  fallback: [number, number]
): [number, number] {
  const parts = s.split(/[\s,]+/).map((p) => Number(p.trim())).filter((n) => !Number.isNaN(n));
  const a = parts[0] ?? fallback[0];
  const b = parts[1] ?? fallback[1];
  return [a, b];
}

/**
 * Build a single DHEquipment from a frontmatter object (e.g. from a linked equipment file).
 */
export function equipmentFromFrontmatter(
  fm: Record<string, unknown> | null | undefined
): Omit<DHEquipment, "features"> {
  if (fm == null || typeof fm !== "object") {
    return { name: "", range: "", tier: 1, type: "", damage: "", damage_type: "", burden: "" };
  }
  return {
    name: typeof fm.name === "string" ? fm.name.trim() : "",
    range: typeof fm.range === "string" ? fm.range.trim() : "",
    tier: parseTemplateNumber(String(fm.tier ?? ""), 1),
    type: typeof fm.type === "string" ? fm.type.trim() : "",
    damage: typeof fm.damage === "string" ? fm.damage.trim() : "",
    damage_type: typeof fm.damage_type === "string" ? fm.damage_type.trim() : "",
    burden: typeof fm.burden === "string" ? fm.burden.trim() : "",
  };
}

/**
 * Read equipment data from a file's frontmatter by path.
 * Uses the metadata cache; returns null if the file has no cache or frontmatter.
 */
export async function loadEquipmentDataForFile(
  app: App,
  filePath: string
): Promise<DHEquipment | null> {
  const rawFm = app.metadataCache.getCache(filePath)?.frontmatter;
  if (rawFm == null) return null;
  const equipment = equipmentFromFrontmatter(rawFm as Record<string, unknown>);
  const features = await loadFeaturesForFile(app, filePath);

  return {
    ...equipment,
    features
  };
}

