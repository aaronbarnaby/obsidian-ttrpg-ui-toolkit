import { StatItem } from "@/types/core";

export type StatCardProps = {
  item: StatItem & { isProficient?: boolean };
  dense?: boolean;
};

export function StatCard({ item, dense }: StatCardProps) {
  return (
    <div className={`generic-card ${item.isProficient ? "proficient" : ""} ${dense ? "dense" : ""}`}>
      <div className="generic-card-label">{item.label}</div>
      <div className="generic-card-value">{item.value}</div>
      {item.sublabel && <div className="generic-card-sublabel">{item.sublabel}</div>}
    </div>
  );
}

