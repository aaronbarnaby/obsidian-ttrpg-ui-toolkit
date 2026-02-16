import { FeatureCost } from "@/types/features";
import { capitalizeLabel, sumFeatureCosts } from "@/lib/utils/feature-cost";

export type CostDisplayProps = {
  costs: FeatureCost[];
};

export function CostDisplay({ costs }: CostDisplayProps) {
  const summed = sumFeatureCosts(costs);

  const handleClick = () => {
    console.log("Feature cost clicked", summed);
  };

  return (
    <button className="feature-cost-area" onClick={handleClick} type="button">
      {summed.map((cost, i) => (
        <span className="feature-cost-line" key={i}>
          {cost.value} {capitalizeLabel(cost.property)}
        </span>
      ))}
    </button>
  );
}

