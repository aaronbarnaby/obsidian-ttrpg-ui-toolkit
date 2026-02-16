import * as AbilityService from "@/lib/services/ability/AbilityService";
import { DHAbility } from "@/types/daggerheart/abilities";

export type DaggerHeartAbilityViewProps = {
  data: DHAbility[];
};

export function DaggerHeartAbilityView({ data }: DaggerHeartAbilityViewProps) {
  return (
    <div className="daggerheart ability-scores-container">
      <div className="ability-scores-grid">
        {data.map((item) => (
          <div className="ability-tile" key={item.label}>
            <div className="ability-tile-header">
              <p className="ability-tile-stat">{item.label}</p>
            </div>
            <div className="ability-tile-divider" />
            <div className="ability-tile-value-wrapper">
              <div className="ability-tile-value">
                {AbilityService.formatModifier(item.modifier)}
              </div>
            </div>
            <div className="ability-tile-divider" />
            <div className="ability-tile-list">
              {item.list.map((abilityItem) => (
                <span key={abilityItem}>{abilityItem}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

