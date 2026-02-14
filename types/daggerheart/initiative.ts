import { DHAdversary } from "./adversary";
import { DHCoreBlock } from "./core";

export type DHInitiativeBlock = DHCoreBlock & {
  name: string;
  state_key?: string;
  party: string[];
  adversaries: DHInitiativeAdversary[];
  countdowns: DHCountdown[];

  show_fear?: boolean;
};

export type DHInitiativeCustomAdversary = DHAdversary & {
  type: "custom";
  key: string;
};

export type DHInitiativeLinkAdversary = {
  type: "link";
  key: string;
  link: string;
};

export type DHInitiativeAdversary = DHInitiativeCustomAdversary | DHInitiativeLinkAdversary;

export type DHCountdown = {
  key: string;
  name: string;
  description: string;
  timer: number;
};

export type DHInitiativeState = {
  adversaries: {
    key: string;
    hp_used: number;
    stress_used: number;
    conditions: string[];
  }[];
  countdowns: {
    key: string;
    timer_remaining: number;
  }[];
};
