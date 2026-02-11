import { DHCoreBlock } from "./core";

export type DHInitiativeBlock = DHCoreBlock & {
  state_key?: string;
  party: string[];
  adversaries: DHInitiativeAdversary[];
};

export type DHInitiativeAdversary = {
  name: string;
  hp: number;
  stress: number;
  link?: string;
};


export type DHInitiativeState = {
  adversaries: {
    index: number;
    hp_used: number;
    stress_used: number;
  }[]
};
