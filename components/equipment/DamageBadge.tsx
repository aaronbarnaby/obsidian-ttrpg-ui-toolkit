export type DamageBadgeProps = {
  damage: string;
  type: string;
};

export function DamageBadge({ damage, type }: DamageBadgeProps) {
  if (!damage) return null;

  return (
    <span className="equipment-badge equipment-badge--damage">
      <span className="equipment-badge-label">Damage:</span>
      <code className="equipment-dice-expr">{`dice: ${damage}`}</code>
      <span className="equipment-badge-extra-value">{type}</span>
    </span>
  );
}

