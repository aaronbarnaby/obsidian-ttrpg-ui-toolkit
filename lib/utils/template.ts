import * as Handlebars from "handlebars";
import { App, TFile } from "obsidian";
import { Frontmatter } from "@/types/core";
import { FileContext } from "../views/filecontext";
import { parseAbilityBlockFromDocument, parseAbilityBlock } from "../domains/abilities";
import * as Fm from "../domains/frontmatter";
import { extractFirstCodeBlock } from "./codeblock-extractor";

export interface TemplateContext {
  frontmatter: Frontmatter;
  abilities: Record<string, number>;
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
