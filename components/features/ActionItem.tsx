import { ActionFeature } from "@/types/features";
import { CostDisplay } from "@/components/features/CostDisplay";

export type ActionItemProps = {
  feature: ActionFeature;
  showBadge?: boolean;
};

export function ActionItem({ feature, showBadge = false }: ActionItemProps) {
  const hasCost = Array.isArray(feature.cost) && feature.cost.length > 0;

  return (
    <div className={`feature-item${hasCost ? " has-cost" : ""}`}>
      {hasCost && <CostDisplay costs={feature.cost!} />}
      <div className="feature-item-body">
        <span className="feature-item-name">{feature.name}</span>
        <span className="feature-item-description">{feature.description}</span>
      </div>
      {showBadge && <div className="feature-item-badge">Action</div>}
    </div>
  );
}

