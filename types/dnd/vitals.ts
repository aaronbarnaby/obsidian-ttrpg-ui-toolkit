import { DNDCoreBlock } from "./core";

/** Parsed block from YAML; hp may be a template string. */
export type DNDVitalsBlockInput = DNDCoreBlock & {
  hp: number | string; // max hp (string = template)
  hitdice: DNDHitDice | DNDHitDice[]; // for single and multi class
  death_saves?: boolean; // show death saves always
  hide_actions?: boolean;
};

/** Resolved block with numeric hp for domain/components. */
export type DNDVitalsBlock = Omit<DNDVitalsBlockInput, "hp"> & {
  hp: number;
};

export type DNDHitDice = {
  dice: string;
  value: number;
};

export type DNDParsedVitalsBlock = Omit<DNDVitalsBlock, "hitdice"> & {
  hitdice?: DNDHitDice[]; // Normalized to always be an array
};

export type DNDVitalsData = DNDCoreBlock & {
  hp: number;
  temp_hp: number;
  hitdice_used: Record<string, number>;
  death_save_successes: number;
  death_save_failures: number;
};
