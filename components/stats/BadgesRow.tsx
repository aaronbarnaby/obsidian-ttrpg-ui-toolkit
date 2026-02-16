import { BadgesBlock } from "@/types/core";
import { Badge } from "@/components/stats/Badge";

export type BadgesRowProps = {
  data: BadgesBlock;
};

export function BadgesRow({ data }: BadgesRowProps) {
  const { items, dense } = data;
  return (
    <div className={`badges-row${dense ? " dense" : ""}`}>
      {items.map((item, index) => (
        <Badge item={item} key={index} />
      ))}
    </div>
  );
}

