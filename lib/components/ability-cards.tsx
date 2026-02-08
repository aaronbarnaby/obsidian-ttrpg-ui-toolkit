import * as AbilityService from "../domains/abilities";
import { DNDAbility, DaggerHeartAbility } from "../types";

export function DNDAbilityView(data: DNDAbility[]) {
  return (
    <div className="dnd ability-scores-container">
      <div className="ability-scores-grid">
        {data.map((item) => (
          <div className={`ability-tile ${item.isProficient ? "proficient" : ""}`} key={item.label}>
            <div className="header">
              <p className="stat">{item.label}</p>
              <p className="score">{item.total}</p>
            </div>
            <div className="divider"></div>
            <div className="value-wrapper">
              <div className="value">{AbilityService.formatModifier(item.modifier)}</div>
            </div>

            <div className="footer">
              Saving {AbilityService.formatModifier(item.savingThrow)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DaggerHeartAbilityView(data: DaggerHeartAbility[]) {
  return (
    <div className="daggerheart ability-scores-container">
      <div className="ability-scores-grid">
        {data.map((item) => (
          <div className="ability-tile" key={item.label}>
            <div className="header">
              <p className="stat">{item.label}</p>
            </div>
            <div className="divider"></div>
            <div className="value-wrapper">
              <div className="value">{AbilityService.formatModifier(item.modifier)}</div>
            </div>
            <div className="divider"></div>
            <ul className="list">
              {item.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

