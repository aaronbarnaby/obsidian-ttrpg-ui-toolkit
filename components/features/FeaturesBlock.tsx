import { Feature } from "@/types/features";
import { FeatureSection } from "@/components/features/FeatureSection";
import { PassiveItem } from "@/components/features/PassiveItem";
import { ActionItem } from "@/components/features/ActionItem";

export type FeaturesBlockProps = {
  data: Feature;
};

export function FeaturesBlock({ data }: FeaturesBlockProps) {
  const hasPassives = data.passives.length > 0;
  const hasActions = data.actions.length > 0;

  return (
    <div className="features-block">
      {hasPassives && (
        <FeatureSection title="Passives" styles={data.styles}>
          {data.passives.map((feature, i) => (
            <PassiveItem
              feature={feature}
              key={i}
              showBadge={data.styles?.hideWrappers}
            />
          ))}
        </FeatureSection>
      )}
      {hasActions && (
        <FeatureSection title="Actions" styles={data.styles}>
          {data.actions.map((feature, i) => (
            <ActionItem
              feature={feature}
              key={i}
              showBadge={data.styles?.hideWrappers}
            />
          ))}
        </FeatureSection>
      )}
    </div>
  );
}
