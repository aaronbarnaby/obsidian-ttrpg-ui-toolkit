import { DHFeature } from "./features";

export type DHEquipment = {
  name: string;
  range: string;
  tier: number;
  type: string;
  damage: string;
  damage_type: string;
  burden: string;
  features?: DHFeature[];
};
