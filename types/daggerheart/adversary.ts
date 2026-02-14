import { DHEquipment } from "./equipment";

export type DHAdversary = {
  name: string;
  tier: number;
  type: string;
  difficulty: number;
  major_threshold: number;
  severe_threshold: number;
  hp: number;
  stress: number;
  attack: number;
  equipped: (DHEquipment | string)[];
};
