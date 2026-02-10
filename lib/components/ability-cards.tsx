import { DNDAbility } from "types/dnd/abilities";
import * as AbilityService from "../domains/abilities";
import { DHAbility } from "types/daggerheart/abilities";

export function DNDAbilityView(data: DNDAbility[]) {
  return (
    <div className="dnd ability-scores-container">
      <div className="ability-scores-grid">
        {data.map((item) => (
          <div className={`ability-tile ${item.isProficient ? "proficient" : ""}`} key={item.label}>
            <div className="ability-tile-header">
              <p className="ability-tile-stat">{item.label}</p>
              <p className="ability-tile-score">{item.total}</p>
            </div>
            <div className="ability-tile-divider"></div>
            <div className="ability-tile-value-wrapper">
              <div className="ability-tile-value">{AbilityService.formatModifier(item.modifier)}</div>
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

export function DaggerHeartAbilityView(data: DHAbility[]) {
  return (
    <div className="daggerheart ability-scores-container">
      <div className="ability-scores-grid">
        {data.map((item) => (
          <div className="ability-tile" key={item.label}>
            <div className="ability-tile-header">
              <p className="ability-tile-stat">{item.label}</p>
            </div>
            <div className="ability-tile-divider"></div>
            <div className="ability-tile-value-wrapper">
              <div className="ability-tile-value">{AbilityService.formatModifier(item.modifier)}</div>
            </div>
            <div className="ability-tile-divider"></div>
            <div className="ability-tile-list">
              {item.list.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

