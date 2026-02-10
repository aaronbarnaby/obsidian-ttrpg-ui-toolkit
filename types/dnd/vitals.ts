import { DNDCoreBlock } from "./core";

export type DNDVitalsBlock = DNDCoreBlock & {
  hp: number; // max hp
  hitdice: DNDHitDice | DNDHitDice[]; // for single and multi class
  death_saves?: boolean; // show death saves always
  hide_actions?: boolean;
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
