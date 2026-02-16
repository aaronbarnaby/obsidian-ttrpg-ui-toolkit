import { DHEquipmentWithPath } from "@/lib/services/equipment/EquipmentService";

export type EquipmentBlockStyles = {
  hideWrapper?: boolean;
};

export type EquipmentBlockProps = {
  type: "daggerheart" | "dnd";
  items: DHEquipmentWithPath[];
  diceResultDuration: number;
  styles?: EquipmentBlockStyles;
  onOpenFile?: (path: string) => void;
};

