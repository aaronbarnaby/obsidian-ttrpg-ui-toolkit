export type DataBadgeProps = {
  label: string;
  value: string | number;
};

export function DataBadge({ label, value }: DataBadgeProps) {
  if (value === "" || value == null) return null;

  return (
    <span className="equipment-badge">
      <span className="equipment-badge-label">{label}:</span>
      <span className="equipment-badge-value">{String(value)}</span>
    </span>
  );
}

