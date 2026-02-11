import { DHVitalsBlock, DHVitalsBlockInput, DHVitalsData } from "./daggerheart/vitals";
import { DNDVitalsBlock, DNDVitalsBlockInput, DNDVitalsData } from "./dnd/vitals";

export type VitalsBlock = DNDVitalsBlock | DHVitalsBlock;

/** Parser return type; templateable fields may be string. */
export type VitalsBlockInput = DNDVitalsBlockInput | DHVitalsBlockInput;

export type VitalsData = DNDVitalsData | DHVitalsData;
