import { StatsBlock } from "@/types/core";
import { StatGrid } from "@/components/stats/StatGrid";
import { StatCard } from "@/components/stats/StatCard";

export type StatsGridItemsProps = StatsBlock;

export function StatsGridItems(data: StatsGridItemsProps) {
  const { items, grid } = data;
  const columns = grid?.columns || 3;
  const dense = data?.dense;

  return (
    <StatGrid cols={columns} dense={dense}>
      {items.map((item, index) => (
        <StatCard item={item} dense={dense} key={index} />
      ))}
    </StatGrid>
  );
}

