import { BadgeItem } from "@/types/core";

export type BadgeProps = {
  item: BadgeItem;
};

export function Badge({ item }: BadgeProps) {
  const elements = [
    <>{item.label && <span className="badge-label">{item.label}</span>}</>,
    <>{item.value && <span className="badge-value">{item.value}</span>}</>,
  ];
  return <div className="badge-item">{elements}</div>;
}

