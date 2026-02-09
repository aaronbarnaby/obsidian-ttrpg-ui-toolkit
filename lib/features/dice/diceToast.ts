import type { DualityDiceResult } from "./dice";

export interface StandardToastOptions {
  type: "standard";
  expression: string;
  total: number;
  details: string;
  duration: number;
}

export interface DualityToastOptions {
  type: "duality";
  result: DualityDiceResult;
  duration: number;
}

export type DiceToastOptions = StandardToastOptions | DualityToastOptions;

/**
 * Show a custom toast notification for dice roll results.
 * Replaces the plain Obsidian Notice with a richer, themed display.
 */
export function showDiceToast(options: DiceToastOptions): void {
  const toast = document.createElement("div");
  toast.classList.add("ttrpg-dice-toast");

  if (options.type === "standard") {
    buildStandardToast(toast, options);
  } else {
    buildDualityToast(toast, options);
    toast.classList.add(`ttrpg-dice-toast--${options.result.fate.toLowerCase()}`);
  }

  document.body.appendChild(toast);

  // Auto-dismiss after duration
  setTimeout(() => {
    toast.classList.add("ttrpg-dice-toast--exit");
    toast.addEventListener("animationend", () => toast.remove());
  }, options.duration);
}

function buildStandardToast(toast: HTMLElement, options: StandardToastOptions): void {
  // Header
  const header = toast.createEl("div", { cls: "ttrpg-dice-toast-header" });
  header.createEl("span", { cls: "ttrpg-dice-toast-icon", text: "🎲" });
  header.createEl("span", { cls: "ttrpg-dice-toast-title", text: "Dice Roll" });

  // Body - expression and individual rolls
  const body = toast.createEl("div", { cls: "ttrpg-dice-toast-body" });
  body.createEl("div", { cls: "ttrpg-dice-toast-expr", text: options.expression });
  body.createEl("div", { cls: "ttrpg-dice-toast-details", text: options.details });

  // Footer - total
  const footer = toast.createEl("div", { cls: "ttrpg-dice-toast-footer" });
  footer.createEl("span", { cls: "ttrpg-dice-toast-total-label", text: "Total" });
  footer.createEl("span", { cls: "ttrpg-dice-toast-total-value", text: String(options.total) });
}

function buildDualityToast(toast: HTMLElement, options: DualityToastOptions): void {
  const { result } = options;

  // Header
  const header = toast.createEl("div", { cls: "ttrpg-dice-toast-header" });
  header.createEl("span", { cls: "ttrpg-dice-toast-icon", text: "🎲🎲" });
  header.createEl("span", { cls: "ttrpg-dice-toast-title", text: "Duality Dice" });

  // Body - two dice side by side
  const body = toast.createEl("div", { cls: "ttrpg-dice-toast-body" });
  const diceRow = body.createEl("div", { cls: "ttrpg-dice-toast-duality-row" });

  // Hope die
  const hopeDie = diceRow.createEl("div", { cls: "ttrpg-dice-toast-die ttrpg-dice-toast-die--hope" });
  hopeDie.createEl("div", { cls: "ttrpg-dice-toast-die-label", text: "Hope" });
  hopeDie.createEl("div", { cls: "ttrpg-dice-toast-die-value", text: String(result.hopeDie) });

  // Fear die
  const fearDie = diceRow.createEl("div", { cls: "ttrpg-dice-toast-die ttrpg-dice-toast-die--fear" });
  fearDie.createEl("div", { cls: "ttrpg-dice-toast-die-label", text: "Fear" });
  fearDie.createEl("div", { cls: "ttrpg-dice-toast-die-value", text: String(result.fearDie) });

  // Modifiers (if any)
  if (result.modifiers.length > 0) {
    const modTotal = result.modifiers.reduce((sum, m) => sum + m, 0);
    body.createEl("div", { cls: "ttrpg-dice-toast-modifier", text: `Modifier: +${modTotal}` });
  }

  // Footer - total and fate
  const footer = toast.createEl("div", { cls: "ttrpg-dice-toast-footer" });
  const fateClass = `ttrpg-dice-toast-fate--${result.fate.toLowerCase()}`;

  footer.createEl("span", { cls: "ttrpg-dice-toast-total-label", text: "Total" });
  footer.createEl("span", { cls: "ttrpg-dice-toast-total-value", text: String(result.total) });

  const fateLabel = result.fate === "Crit" ? "Critical Success!" : `with ${result.fate}`;
  footer.createEl("span", { cls: `ttrpg-dice-toast-fate ${fateClass}`, text: fateLabel });
}
