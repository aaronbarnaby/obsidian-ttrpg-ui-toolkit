import { DNDCoreBlock } from "./core";
import { ResetConfig } from "../core";

export type DNDVitalsBlock = DNDCoreBlock & {
  hp: number | string; // Allow string for template support
  hitdice: DNDHitDice | DNDHitDice[];
  death_saves?: boolean;
  reset_on?: string | string[]; // Event type(s) that trigger a reset, defaults to 'long-rest'
};

export type DNDHitDice = {
  dice: string;
  value: number;
};

export type DNDParsedVitalsBlock = Omit<DNDVitalsBlock, "reset_on" | "hitdice"> & {
  reset_on?: ResetConfig[]; // Normalized to always be an array of objects
  hitdice?: DNDHitDice[]; // Normalized to always be an array
};

export type DNDVitalsData = DNDCoreBlock & {
  hp: number;
  max_hp: number;
  temp_hp: number;
  used_hitdice: number;
  death_save_successes: number;
  death_save_failures: number;
}
