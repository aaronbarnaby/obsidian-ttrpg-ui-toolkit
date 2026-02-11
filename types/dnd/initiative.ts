import { DNDCoreBlock } from "./core";

export type DNDInitiativeBlock = DNDCoreBlock & {
  state_key?: string;
  party: string[];
};
