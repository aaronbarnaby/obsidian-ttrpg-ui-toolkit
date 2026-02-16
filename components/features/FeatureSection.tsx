import * as React from "react";
import { FeaturesBlockStyles } from "@/types/features";

export type FeatureSectionProps = {
  title: string;
  children: React.ReactNode;
  styles?: FeaturesBlockStyles;
};

export function FeatureSection({ title, children, styles }: FeatureSectionProps) {
  if (styles?.hideWrappers) {
    return <div className="feature-section-items">{children}</div>;
  }

  return (
    <div className="feature-section">
      <span className="feature-section-title">{title}</span>
      <div className="feature-section-items">{children}</div>
    </div>
  );
}

