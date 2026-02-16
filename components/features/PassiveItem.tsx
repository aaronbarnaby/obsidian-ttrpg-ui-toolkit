import { PassiveFeature } from "@/types/features";

export type PassiveItemProps = {
  feature: PassiveFeature;
  showBadge?: boolean;
};

export function PassiveItem({ feature, showBadge = false }: PassiveItemProps) {
  return (
    <div className="feature-item">
      <div className="feature-item-body">
        <span className="feature-item-name">{feature.name}</span>
        <span className="feature-item-description">{feature.description}</span>
      </div>
      {showBadge && <div className="feature-item-badge">Passive</div>}
    </div>
  );
}

