import { DHCoreBlock } from "./core";

/** Parsed block from YAML; templateable fields may be strings. */
export type DHVitalsBlockInput = DHCoreBlock & {
  hp: number | string;
  stress: number | string;
  armor: number | string;
  evasion: number | string;
  thresholds: [number, number] | string;
};

/** Resolved block with numeric fields for domain/components. */
export type DHVitalsBlock = Omit<DHVitalsBlockInput, "hp" | "stress" | "armor" | "evasion" | "thresholds"> & {
  hp: number;
  stress: number;
  armor: number;
  evasion: number;
  thresholds: [number, number];
};

export type DHVitalsData = DHCoreBlock & {
  hp_used: number;
  stress_used: number;
  armor_used: number;
  hope: number;
};
