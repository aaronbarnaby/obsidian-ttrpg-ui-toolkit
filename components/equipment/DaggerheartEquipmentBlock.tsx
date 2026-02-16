import { DHEquipmentWithPath } from "@/lib/services/equipment/EquipmentService";
import { DaggerheartItemCard } from "@/components/equipment/DaggerheartItemCard";
import { EquipmentBlockStyles } from "@/components/equipment/types";

export type DaggerheartEquipmentBlockProps = {
  items: DHEquipmentWithPath[];
  styles?: EquipmentBlockStyles;
  onOpenFile?: (path: string) => void;
};

export function DaggerheartEquipmentBlock({
  items,
  styles,
  onOpenFile,
}: DaggerheartEquipmentBlockProps) {
  const renderItems = () => (
    <div className="equipment-items">
      {items.map((item, i) => (
        <DaggerheartItemCard item={item} onOpenFile={onOpenFile} key={i} />
      ))}
    </div>
  );

  if (styles?.hideWrapper) {
    return renderItems();
  }

  return (
    <div className="equipment-block equipment-block--daggerheart">
      <span className="equipment-block-title">Equipment</span>
      {renderItems()}
    </div>
  );
}

