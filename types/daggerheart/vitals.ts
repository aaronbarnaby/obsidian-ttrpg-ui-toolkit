import { DHCoreBlock } from "./core";

export type DHVitalsBlock = DHCoreBlock & {
  hp: number;
  stress: number;
  armor: number;
  hope: number;
};

export type DHVitalsData = DHCoreBlock & {
  hp_blocks: number;
  used_hp_blocks: number;
  stress_blocks: number;
  used_stress_blocks: number;
  armor_blocks: number;
  used_armor_blocks: number;
  hope_blocks: number;
  used_hope_blocks: number;
}
