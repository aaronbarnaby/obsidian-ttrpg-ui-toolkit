import { MarkdownPostProcessorContext, setIcon } from "obsidian";
import { rollDice, rollDualityDice } from "./dice";
import { showDiceToast } from "./diceToast";

const DICE_INLINE_REGEX = /^dice:\s*(.+)$/i;
const DUALITY_INLINE_REGEX = /^duality:\s*(.*)$/i;

export function diceInlinePostProcessor(el: HTMLElement, ctx: MarkdownPostProcessorContext, diceResultDuration: number): void {
  const codeEls = el.querySelectorAll("code");
  codeEls.forEach((codeEl) => {
    const text = codeEl.textContent?.trim() ?? "";

    // Check for standard dice syntax
    const diceMatch = text.match(DICE_INLINE_REGEX);
    if (diceMatch) {
      buildStandardDiceWidget(codeEl, diceMatch[1].trim(), diceResultDuration);
      return;
    }

    // Check for duality dice syntax
    const dualityMatch = text.match(DUALITY_INLINE_REGEX);
    if (dualityMatch) {
      buildDualityDiceWidget(codeEl, dualityMatch[1].trim(), diceResultDuration);
      return;
    }
  });
}

function buildStandardDiceWidget(codeEl: Element, expression: string, diceResultDuration: number): void {
  const wrapper = createEl("span", { cls: "ttrpg-dice-inline" });
  const resultSpan = wrapper.createEl("span", { cls: "ttrpg-dice-inline-result" });
  const iconSpan = wrapper.createEl("span", { cls: "ttrpg-dice-inline-icon" });
  setIcon(iconSpan, "dice");
  wrapper.createEl("span", { cls: "ttrpg-dice-inline-expr", text: `(${expression})` });

  wrapper.addEventListener("click", () => {
    const result = rollDice(expression);
    resultSpan.textContent = String(result.total);
    resultSpan.classList.add("ttrpg-dice-inline-result--visible");

    showDiceToast({
      type: "standard",
      expression,
      total: result.total,
      details: result.details,
      duration: diceResultDuration,
    });
  });

  codeEl.replaceWith(wrapper);
}

function buildDualityDiceWidget(codeEl: Element, modifierExpr: string, diceResultDuration: number): void {
  // Parse modifiers from the expression (e.g., "+3", "2+3", or empty)
  const modifiers: number[] = [];
  if (modifierExpr) {
    const parts = modifierExpr.split("+").map((p) => p.trim()).filter((p) => p.length > 0);
    for (const part of parts) {
      const num = parseInt(part);
      if (!isNaN(num)) {
        modifiers.push(num);
      }
    }
  }

  const modLabel = modifiers.length > 0 ? ` +${modifiers.reduce((a, b) => a + b, 0)}` : "";

  const wrapper = createEl("span", { cls: "ttrpg-dice-inline ttrpg-dice-inline--duality" });
  const resultSpan = wrapper.createEl("span", { cls: "ttrpg-dice-inline-result" });
  const iconSpan = wrapper.createEl("span", { cls: "ttrpg-dice-inline-icon" });
  setIcon(iconSpan, "dices");
  wrapper.createEl("span", { cls: "ttrpg-dice-inline-expr", text: `(Duality${modLabel})` });

  wrapper.addEventListener("click", () => {
    const result = rollDualityDice(modifiers);

    // Clear previous fate classes
    resultSpan.classList.remove(
      "ttrpg-dice-inline-result--hope",
      "ttrpg-dice-inline-result--fear",
      "ttrpg-dice-inline-result--crit"
    );

    // Set result text and fate class
    const fateLabel = result.fate === "Crit" ? "Crit!" : result.fate;
    resultSpan.textContent = `${result.total} ${fateLabel}`;
    resultSpan.classList.add("ttrpg-dice-inline-result--visible");
    resultSpan.classList.add(`ttrpg-dice-inline-result--${result.fate.toLowerCase()}`);

    showDiceToast({
      type: "duality",
      result,
      duration: diceResultDuration,
    });
  });

  codeEl.replaceWith(wrapper);
}
