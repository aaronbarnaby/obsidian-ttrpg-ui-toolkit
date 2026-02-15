import * as React from "react";
import {
  Feature,
  PassiveFeature,
  ActionFeature,
  FeatureCost,
} from "../../types/features";

/**
 * Sums FeatureCost entries by property.
 * e.g. [{property:"fear",value:1},{property:"stress",value:1},{property:"fear",value:2}]
 * becomes [{property:"fear",value:3},{property:"stress",value:1}]
 */
function sumCosts(costs: FeatureCost[]): FeatureCost[] {
  const map = new Map<string, number>();
  for (const c of costs) {
    map.set(c.property, (map.get(c.property) ?? 0) + c.value);
  }
  return Array.from(map.entries()).map(([property, value]) => ({
    property,
    value,
  }));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Cost display (right side of action items) ── */

function CostDisplay({ costs }: { costs: FeatureCost[] }) {
  const summed = sumCosts(costs);

  const handleClick = () => {
    console.log("Feature cost clicked", summed);
  };

  return (
    <button className="feature-cost-area" onClick={handleClick} type="button">
      {summed.map((c, i) => (
        <span className="feature-cost-line" key={i}>
          {c.value} {capitalize(c.property)}
        </span>
      ))}
    </button>
  );
}


/* ── Individual feature items ── */

function PassiveItem({ feature }: { feature: PassiveFeature }) {
  return (
    <div className='feature-item'>
      <div className="feature-item-body">
        <span className="feature-item-name">{feature.name}</span>
        <span className="feature-item-description">{feature.description}</span>
      </div>
    </div>
  );
}

function ActionItem({ feature }: { feature: ActionFeature }) {
  const hasCost = Array.isArray(feature.cost) && feature.cost.length > 0;

  return (
    <div className={`feature-item${hasCost ? " has-cost" : ""}`}>
      <div className="feature-item-body">
        <span className="feature-item-name">{feature.name}</span>
        <span className="feature-item-description">{feature.description}</span>
      </div>
      {hasCost && <CostDisplay costs={feature.cost!} />}
    </div>
  );
}

/* ── Section wrapper (Passives / Actions) ── */

function FeatureSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="feature-section">
      <span className="feature-section-title">{title}</span>
      <div className="feature-section-items">{children}</div>
    </div>
  );
}

/* ── Top-level block ── */

export function FeaturesBlock({ data }: { data: Feature }) {
  const hasPassives = data.passives.length > 0;
  const hasActions = data.actions.length > 0;

  return (
    <div className="features-block">
      {hasPassives && (
        <FeatureSection title="Passives">
          {data.passives.map((p, i) => (
            <PassiveItem feature={p} key={i} />
          ))}
        </FeatureSection>
      )}
      {hasActions && (
        <FeatureSection title="Actions">
          {data.actions.map((a, i) => (
            <ActionItem feature={a} key={i} />
          ))}
        </FeatureSection>
      )}
    </div>
  );
}
