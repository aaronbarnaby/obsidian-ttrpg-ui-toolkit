export interface DieRoll {
  sides: number;
  result: number;
}

export interface ParsedDiceResult {
  dice: DieRoll[];
  modifier: number;
  total: number;
}

export interface DualityDiceResult {
  hopeDie: number;
  fearDie: number;
  modifiers: number[];
  total: number;
  details: string;
  fate: "Hope" | "Fear" | "Crit";
}

type DiceToken = {
  kind: "dice";
  count: number;
  sides: number;
};

type NumberToken = {
  kind: "number";
  value: number;
};

type ExpressionToken = DiceToken | NumberToken;

function parseExpressionTokens(expression: string): ExpressionToken[] {
  const parts = expression.split("+").map((p) => p.trim());
  const tokens: ExpressionToken[] = [];

  for (const part of parts) {
    const match = part.match(/(\d*)d(\d+)/i);
    if (match) {
      tokens.push({
        kind: "dice",
        count: parseInt(match[1]) || 1,
        sides: parseInt(match[2]),
      });
      continue;
    }

    const numberValue = parseInt(part);
    if (!isNaN(numberValue)) {
      tokens.push({ kind: "number", value: numberValue });
    }
  }

  return tokens;
}

/**
 * Parse a dice expression and roll each die individually,
 * returning per-die results with their side counts.
 * e.g. "2d6+1d8+3" -> { dice: [{sides:6,result:3},{sides:6,result:5},{sides:8,result:7}], modifier: 3, total: 18 }
 */
export function parseDiceExpression(expression: string): ParsedDiceResult {
  const tokens = parseExpressionTokens(expression);
  const dice: DieRoll[] = [];
  let modifier = 0;
  let total = 0;

  for (const token of tokens) {
    if (token.kind === "dice") {
      for (let i = 0; i < token.count; i++) {
        const result = Math.floor(Math.random() * token.sides) + 1;
        dice.push({ sides: token.sides, result });
        total += result;
      }
    } else {
      modifier += token.value;
      total += token.value;
    }
  }

  return { dice, modifier, total };
}

export function rollDice(expression: string): { total: number; details: string } {
  const tokens = parseExpressionTokens(expression);
  let total = 0;
  const allRolls: number[] = [];

  for (const token of tokens) {
    if (token.kind === "dice") {
      for (let i = 0; i < token.count; i++) {
        const roll = Math.floor(Math.random() * token.sides) + 1;
        allRolls.push(roll);
        total += roll;
      }
    } else {
      allRolls.push(token.value);
      total += token.value;
    }
  }

  return { total, details: `[${allRolls.join(", ")}]` };
}

export function rollDualityDice(modifiers: number[] = []): DualityDiceResult {
  const fearDie = Math.floor(Math.random() * 12) + 1;
  const hopeDie = Math.floor(Math.random() * 12) + 1;

  let total = fearDie + hopeDie;
  let fate: "Hope" | "Fear" | "Crit";

  if (fearDie === hopeDie) {
    fate = "Crit";
  } else if (hopeDie > fearDie) {
    fate = "Hope";
  } else {
    fate = "Fear";
  }

  for (const modifier of modifiers) {
    total += modifier;
  }

  return {
    hopeDie,
    fearDie,
    modifiers,
    total,
    details: `[${fearDie}, ${hopeDie}]`,
    fate,
  };
}

