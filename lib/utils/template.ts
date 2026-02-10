import * as Handlebars from "handlebars";
import { Frontmatter } from "@/types/core";
import { FileContext } from "../views/filecontext";
import { parseAbilityBlockFromDocument } from "../domains/abilities";

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
