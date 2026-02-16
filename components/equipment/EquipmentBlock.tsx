import { DnDPlaceholder } from "@/components/equipment/DnDPlaceholder";
import { DaggerheartEquipmentBlock } from "@/components/equipment/DaggerheartEquipmentBlock";
import { EquipmentBlockProps } from "@/components/equipment/types";

export type { EquipmentBlockStyles, EquipmentBlockProps } from "@/components/equipment/types";

export function EquipmentBlock({ type, items, styles, onOpenFile }: EquipmentBlockProps) {
  if (type === "dnd") {
    return <DnDPlaceholder />;
  }

  return (
    <DaggerheartEquipmentBlock
      items={items}
      styles={styles}
      onOpenFile={onOpenFile}
    />
  );
}

