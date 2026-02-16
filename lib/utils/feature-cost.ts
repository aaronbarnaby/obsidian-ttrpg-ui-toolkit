import { FeatureCost } from "@/types/features";

export function sumFeatureCosts(costs: FeatureCost[]): FeatureCost[] {
  const map = new Map<string, number>();
  for (const cost of costs) {
    map.set(cost.property, (map.get(cost.property) ?? 0) + cost.value);
  }
  return Array.from(map.entries()).map(([property, value]) => ({ property, value }));
}

export function capitalizeLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

