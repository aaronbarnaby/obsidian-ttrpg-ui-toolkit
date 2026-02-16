import * as AbilityService from "@/lib/services/ability/AbilityService";
import { DNDAbility } from "@/types/dnd/abilities";

export type DNDAbilityViewProps = {
  data: DNDAbility[];
};

export function DNDAbilityView({ data }: DNDAbilityViewProps) {
  return (
    <div className="dnd ability-scores-container">
      <div className="ability-scores-grid">
        {data.map((item) => (
          <div className={`ability-tile ${item.isProficient ? "proficient" : ""}`} key={item.label}>
            <div className="ability-tile-header">
              <p className="ability-tile-stat">{item.label}</p>
              <p className="ability-tile-score">{item.total}</p>
            </div>
            <div className="ability-tile-divider" />
            <div className="ability-tile-value-wrapper">
              <div className="ability-tile-value">
                {AbilityService.formatModifier(item.modifier)}
              </div>
            </div>
            <div className="ability-tile-footer">
              Saving {AbilityService.formatModifier(item.savingThrow)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

