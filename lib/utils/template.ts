import * as Handlebars from "handlebars";
import { App, TFile } from "obsidian";
import { Frontmatter } from "@/types/core";
import { DHEquipment } from "@/types/daggerheart/equipment";
import { FileContext } from "../views/filecontext";
import { parseAbilityBlockFromDocument, parseAbilityBlock } from "../domains/abilities";
import * as Fm from "../domains/frontmatter";
import { extractFirstCodeBlock } from "./codeblock-extractor";

export interface TemplateContext {
  frontmatter: Frontmatter;
  abilities: Record<string, number>;
}

export interface AdversaryTemplateContext {
  frontmatter: Frontmatter;
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

export function createTemplateContext(el: HTMLElement, ctx: FileContext): TemplateContext {
  const frontmatter = ctx.frontmatter();

  let abilities: Record<string, number> = {};

  try {
    const abilityBlock = parseAbilityBlockFromDocument(el, ctx.md());
    abilities = abilityBlock.abilities;
  } catch (error) {
    console.error("Error parsing ability block:", error);
  }

  return {
    frontmatter,
    abilities,
  };
}

/**
 * Load TemplateContext (frontmatter + abilities) for an external file by path.
 * Use when resolving party member files from the initiative block.
 */
export async function loadTemplateContextForFile(app: App, filePath: string): Promise<TemplateContext> {
  const rawFm = app.metadataCache.getCache(filePath)?.frontmatter;
  const frontmatter = Fm.anyIntoFrontMatter(rawFm ?? {});

  let abilities: Record<string, number> = {};

  try {
    const file = app.vault.getAbstractFileByPath(filePath);
    if (!file || !(file instanceof TFile)) {
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

  return {
    frontmatter,
    abilities,
  };
}


export async function loadAdversaryTemplateContextForFile(app: App, filePath: string): Promise<AdversaryTemplateContext> {
  const rawFm = app.metadataCache.getCache(filePath)?.frontmatter;
  const frontmatter = Fm.anyIntoFrontMatter(rawFm ?? {});

  return {
    frontmatter,
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
): DHEquipment {
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
    features: Array.isArray(fm.features) ? (fm.features as unknown[]) as DHEquipment["features"] : undefined,
  };
}

/**
 * Read equipment data from a file's frontmatter by path.
 * Uses the metadata cache; returns null if the file has no cache or frontmatter.
 */
export function loadEquipmentDataForFile(
  app: App,
  filePath: string
): DHEquipment | null {
  const rawFm = app.metadataCache.getCache(filePath)?.frontmatter;
  if (rawFm == null) return null;
  return equipmentFromFrontmatter(rawFm as Record<string, unknown>);
}
