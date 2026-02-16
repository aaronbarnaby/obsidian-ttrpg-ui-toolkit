import { FeaturesBlock } from "@/components/features/FeaturesBlock";
import { DHEquipmentWithPath } from "@/lib/services/equipment/EquipmentService";
import { DamageBadge } from "@/components/equipment/DamageBadge";
import { DataBadge } from "@/components/equipment/DataBadge";

export type DaggerheartItemCardProps = {
  item: DHEquipmentWithPath;
  onOpenFile?: (path: string) => void;
};

export function DaggerheartItemCard({ item, onOpenFile }: DaggerheartItemCardProps) {
  const hasFeatures =
    item.features &&
    (item.features.passives?.length > 0 || item.features.actions?.length > 0);
  const isLink = Boolean(item.filePath && onOpenFile);

  const nameEl = isLink ? (
    <button
      type="button"
      className="equipment-item-name equipment-item-name--link"
      onClick={() => onOpenFile?.(item.filePath!)}
    >
      {item.name}
    </button>
  ) : (
    <span className="equipment-item-name">{item.name}</span>
  );

  return (
    <div className="equipment-item">
      <div className="equipment-item-header">
        {nameEl}
        <span className="equipment-item-tier">Tier {item.tier}</span>
      </div>
      <div className="equipment-item-badges">
        <DataBadge label="Range" value={item.range} />
        <DamageBadge damage={item.damage} type={item.damage_type} />
        <DataBadge label="Type" value={item.type} />
        <DataBadge label="Burden" value={item.burden} />
      </div>
      {hasFeatures && item.features && (
        <div className="equipment-item-features">
          <FeaturesBlock data={{...item.features, styles: { hideWrappers: true }}} />
        </div>
      )}
    </div>
  );
}

