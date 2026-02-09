import type TTRPGUIToolkitPlugin from "main";
import { rollDice, rollDualityDice } from "./dice";
import { showDiceToast } from "./diceToast";

let floatingWindowContainer: HTMLDivElement | null = null;
const diceLog: string[] = [];

export function openDiceRoller(plugin: TTRPGUIToolkitPlugin) {
  // Cleanup previous instance
  if (floatingWindowContainer) {
    floatingWindowContainer.remove();
    floatingWindowContainer = null;
  }

  const container = document.createElement("div");
  floatingWindowContainer = container;
  container.classList.add("ttrpg-ui-toolkit-floating-window");

  const header = container.createEl("div", { cls: "ttrpg-ui-toolkit-floating-header" });
  header.createEl("span", { text: "Dice Roller" });

  const closeBtn = header.createEl("button", { text: "✖", cls: "ttrpg-ui-toolkit-close-btn" });

  const body = container.createEl("div", { cls: "ttrpg-ui-toolkit-dice-roll-body" });
  const logContainer = body.createEl("div", { cls: "ttrpg-ui-toolkit-dice-log" });

  body.createEl("p", { text: "Roll count:", cls: "ttrpg-ui-toolkit-label" });
  const countInput = body.createEl("input", { cls: "ttrpg-ui-toolkit-roll-count" }) as HTMLInputElement;
  countInput.type = "number";
  countInput.min = "1";
  countInput.value = "1";

  body.createEl("p", { text: "Add dice to queue:", cls: "ttrpg-ui-toolkit-label" });

  const diceButtonsDiv = body.createEl("div", { cls: "ttrpg-ui-toolkit-dice-buttons" });
  const diceOptions = ["4", "6", "8", "10", "12", "20", "100"];
  diceOptions.forEach((sides) => {
    const btn = diceButtonsDiv.createEl("button", { text: `d${sides}`, cls: "ttrpg-ui-toolkit-dice-btn" });
    btn.setAttribute("data-sides", sides);
  });

  const queueContainer = body.createEl("div", { cls: "ttrpg-ui-toolkit-dice-queue-container" });

  const rollBtn = body.createEl("button", { text: "Roll", cls: "ttrpg-ui-toolkit-dice-roll-btn" });
  const dualityDiceBtn = body.createEl("button", { text: "Roll Duality Dice", cls: "ttrpg-ui-toolkit-dice-roll-btn" });
  const clearLogBtn = body.createEl("button", { text: "Clear Log", cls: "ttrpg-ui-toolkit-dice-clear-log-btn" });

  document.body.appendChild(container);

  const diceQueue: string[] = [];

  /**
   * Drag logic
   */
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const dragStyle = document.createElement("style");
  document.head.appendChild(dragStyle);

  header.addEventListener("mousedown", (e: MouseEvent) => {
    isDragging = true;
    container.classList.add("ttrpg-ui-toolkit-dragging");
    header.classList.add("ttrpg-ui-toolkit-grab-cursor-active");

    const rect = container.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  window.addEventListener("mousemove", (e: MouseEvent) => {
    if (!isDragging) return;

    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;

    container.classList.add("ttrpg-ui-toolkit-floating-window");

    container.style.setProperty("--ttrpg-ui-toolkit-left", `${newLeft}px`);
    container.style.setProperty("--ttrpg-ui-toolkit-top", `${newTop}px`);
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    container.classList.remove("ttrpg-ui-toolkit-dragging");
    header.classList.remove("ttrpg-ui-toolkit-grab-cursor-active");
  });

  const onClose = () => {
    container.remove();
    floatingWindowContainer = null;
  };

  closeBtn.addEventListener("click", onClose);

  // --- Update log ---
  function updateLog() {
    logContainer.empty();
    diceLog.forEach((line) => {
      logContainer.createEl("p", { text: line });
    });
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // --- Update queue display ---
  function updateQueue() {
    queueContainer.empty();
    diceQueue.forEach((expr, idx) => {
      const div = queueContainer.createEl("div", { cls: "ttrpg-ui-toolkit-dice-queue-item" });
      div.createEl("span", { text: expr + " " });
      const removeBtn = div.createEl("button", { text: "x" });
      removeBtn.addEventListener("click", () => {
        diceQueue.splice(idx, 1);
        updateQueue();
      });
    });
  }

  // --- Dice buttons ---
  container.querySelectorAll(".ttrpg-ui-toolkit-dice-btn").forEach((btn) => {
    const onClick = () => {
      const sides = Number((btn as HTMLElement).dataset.sides);
      const count = Number(countInput.value) || 1;
      const diceExpr = `${count}d${sides}`;
      diceQueue.push(diceExpr);
      updateQueue();
    };
    btn.addEventListener("click", onClick);
  });

  // --- Roll button ---
  const onRoll = () => {
    if (diceQueue.length === 0) return;
    const expression = diceQueue.join(" + ");
    const result = rollDice(expression);
    diceLog.push(`${expression} -> ${result.details} = ${result.total}`);
    updateLog();
    diceQueue.length = 0;
    updateQueue();

    showDiceToast({
      type: "standard",
      expression,
      total: result.total,
      details: result.details,
      duration: plugin.settings.diceResultDuration,
    });
  };
  rollBtn.addEventListener("click", onRoll);

  // --- Roll duality dice button ---
  const onRollDuality = () => {
    const result = rollDualityDice([]);
    diceLog.push(`Duality Dice: ${result.details} = ${result.total} with ${result.fate}`);
    updateLog();

    showDiceToast({
      type: "duality",
      result,
      duration: plugin.settings.diceResultDuration,
    });
  };
  dualityDiceBtn.addEventListener("click", onRollDuality);

  // --- Clear log button ---
  const onClearLog = () => {
    diceLog.length = 0;
    updateLog();
  };
  clearLogBtn.addEventListener("click", onClearLog);

  updateLog();
}
