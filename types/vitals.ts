import { DHVitalsBlock, DHVitalsData } from "./daggerheart/vitals";
import { DNDVitalsBlock, DNDVitalsData } from "./dnd/vitals";

export type VitalsBlock = DNDVitalsBlock | DHVitalsBlock;

export type VitalsData = DNDVitalsData | DHVitalsData;
