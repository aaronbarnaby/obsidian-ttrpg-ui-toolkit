import * as React from "react";
import { DHEquipmentWithPath } from "../utils/equipment";
import { FeaturesBlock } from "./features";

export type EquipmentBlockStyles = {
  hideWrapper?: boolean;
}

export type EquipmentBlockProps = {
  type: "daggerheart" | "dnd";
  items: DHEquipmentWithPath[];
  diceResultDuration: number;
  styles?: EquipmentBlockStyles;
  onOpenFile?: (path: string) => void;
};

/* ── D&D placeholder ── */

function DnDPlaceholder() {
  return (
    <div className="equipment-block equipment-block--dnd">
      <span className="equipment-block-title">Equipment</span>
      <p className="equipment-placeholder">D&D equipment view coming soon.</p>
    </div>
  );
}

/* ── Damage badge (renders as code so dice post processor can attach roller) ── */

function DamageBadge({ damage, type }: { damage: string, type: string }) {
  if (!damage) return null;
  return (
    <span className="equipment-badge equipment-badge--damage">
      <span className="equipment-badge-label">Damage:</span>
      <code className="equipment-dice-expr">{`dice: ${damage}`}</code>
      <span className="equipment-badge-extra-value">{type}</span>
    </span>
  );
}

/* ── Label + value badge ── */

function DataBadge({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  if (value === "" || value == null) return null;
  return (
    <span className="equipment-badge">
      <span className="equipment-badge-label">{label}:</span>
      <span className="equipment-badge-value">{String(value)}</span>
    </span>
  );
}

/* ── Single Daggerheart item card ── */

function DaggerheartItemCard({
  item,
  onOpenFile,
}: {
  item: DHEquipmentWithPath;
  onOpenFile?: (path: string) => void;
}) {
  const hasFeatures =
    item.features &&
    (item.features.passives?.length > 0 || item.features.actions?.length > 0);
  const isLink = Boolean(item.filePath && onOpenFile);

  const nameEl = isLink ? (
    <button
      type="button"
      className="equipment-item-name equipment-item-name--link"
      onClick={() => onOpenFile!(item.filePath!)}
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
          <FeaturesBlock data={item.features} />
        </div>
      )}
    </div>
  );
}

/* ── Daggerheart equipment block (list of item cards) ── */

function DaggerheartEquipmentBlock({
  items,
  styles,
  onOpenFile,
}: {
  items: DHEquipmentWithPath[];
  styles?: EquipmentBlockStyles;
  onOpenFile?: (path: string) => void;
}) {
  const renderItems = () => (
    <div className="equipment-items">
      {items.map((item, i) => (
        <DaggerheartItemCard
          item={item}
          onOpenFile={onOpenFile}
          key={i}
        />
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

/* ── Top-level: system switch ── */

export function EquipmentBlock({
  type,
  items,
  styles,
  onOpenFile,
}: EquipmentBlockProps) {
  if (type === "dnd") {
    return <DnDPlaceholder />;
  }
  return (
    <DaggerheartEquipmentBlock items={items} styles={styles} onOpenFile={onOpenFile} />
  );
}
