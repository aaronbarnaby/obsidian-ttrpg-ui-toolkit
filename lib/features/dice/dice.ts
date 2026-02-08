import { Notice } from "obsidian";

export function rollDice(expression: string): { total: number; details: string } {
  const parts = expression.split("+").map(p => p.trim());
  let total = 0;
  const allRolls: number[] = [];

  for (const part of parts) {
      const match = part.match(/(\d*)d(\d+)/i);
      if (match) {
          const count = parseInt(match[1]) || 1;
          const sides = parseInt(match[2]);

          for (let i = 0; i < count; i++) {
              const roll = Math.floor(Math.random() * sides) + 1;
              allRolls.push(roll);
              total += roll;
          }
      } else {
          const num = parseInt(part);
          if (!isNaN(num)) {
              allRolls.push(num);
              total += num;
          }
      }
  }

  // Trigger Notice
  new Notice(`Rolled ${expression} -> ${total}`, 2000);

  return { total, details: `[${allRolls.join(", ")}]` };
}

export function rollDualityDice(modifiers: number[] = []): { total: number; details: string, fate: string } {
  const allRolls: number[] = [];
  
  let total = 0;
  let fate: string = "";

  for (let i = 0; i < 2; i++) {
    const roll = Math.floor(Math.random() * 12) + 1;
    allRolls.push(roll);
    total += roll;
  }

  if (allRolls[0] === allRolls[1]) {
    fate = "Crit";
  } else if (allRolls[0] < allRolls[1]) {
    fate = "Hope";
  } else {
    fate = "Fear";
  }

  for (const modifier of modifiers) {
    total += modifier;
  }

  // Trigger Notice
  new Notice(`Rolled ${total} with ${fate}`, 2000);

  return { total, details: `[${allRolls.join(", ")}]`, fate };
}
