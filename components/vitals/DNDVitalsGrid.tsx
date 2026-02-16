import * as React from "react";
import { DNDParsedVitalsBlock, DNDVitalsData } from "@/types/dnd/vitals";

export type DNDVitalsGridProps = {
  block: DNDParsedVitalsBlock;
  data: DNDVitalsData;
  onHitDiceToggle: (dice: string, index: number) => void;
  onDeathSaveToggle: (success: boolean, index: number) => void;
  onHeal: (amount: number) => void;
  onDamage: (amount: number) => void;
  onAddTemp: (amount: number) => void;
};

export function DNDVitalsGrid({
  block,
  data,
  onHitDiceToggle,
  onDeathSaveToggle,
  onHeal,
  onDamage,
  onAddTemp,
}: DNDVitalsGridProps) {
  const [actionAmount, setActionAmount] = React.useState(1);
  const showDeathSaves = block.death_saves === true || data.hp === 0;
  const showActions = block.hide_actions !== true;
  const hitdice = block.hitdice ?? [];

  return (
    <div className="dnd-vitals-container">
      <div className="dnd-vitals-grid">
        <div className="dnd-section-box">
          <div className="dnd-section-box-content dnd-hit-dice-section">
            <span className="vital-label dnd-section-label">Hit Dice</span>
            <div className="dnd-hit-dice-columns">
              {hitdice.map(({ dice, value: total }) => {
                const used = data.hitdice_used[dice] ?? 0;
                return (
                  <div key={dice} className="dnd-hit-dice-column">
                    <div className="dnd-hit-dice-value">{dice}</div>
                    <div className="vital-boxes">
                      {Array.from({ length: total }, (_, i) => (
                        <button
                          key={i}
                          className={`vital-box ${i < used ? "active" : ""}`}
                          onClick={() => onHitDiceToggle(dice, i)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <div className="dnd-section-box dnd-hp-wrapper">
            <div className="dnd-section-box-content dnd-hp-section">
              <div className="dnd-hp-block">
                <span className="vital-label">Hit Points</span>
                <div className="dnd-hp-value">
                  {data.hp} / {block.hp}
                </div>
              </div>
              <div className="dnd-hp-block">
                <span className="vital-label">Temporary Hit Points</span>
                <div className="dnd-hp-value">{data.temp_hp}</div>
              </div>
            </div>
          </div>
          {showDeathSaves && (
            <div className="dnd-section-box dnd-death-saves-wrapper">
              <div className="dnd-section-box-content dnd-death-saves-section">
                <span className="vital-label dnd-section-label">Death Saves</span>
                <div className="dnd-death-saves-grid">
                  <div className="dnd-death-save-row">
                    <span className="vital-label">Success</span>
                    <div className="vital-boxes">
                      {Array.from({ length: 3 }, (_, i) => (
                        <button
                          key={i}
                          className={`vital-box death-save-success ${i < data.death_save_successes ? "active" : ""}`}
                          onClick={() => onDeathSaveToggle(true, i)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="dnd-death-save-row">
                    <span className="vital-label">Failure</span>
                    <div className="vital-boxes">
                      {Array.from({ length: 3 }, (_, i) => (
                        <button
                          key={i}
                          className={`vital-box death-save-failure ${i < data.death_save_failures ? "active" : ""}`}
                          onClick={() => onDeathSaveToggle(false, i)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {showActions && (
          <div className="dnd-section-box">
            <div className="dnd-section-box-content dnd-actions-panel">
              <input
                type="number"
                className="dnd-action-input"
                min={1}
                value={actionAmount}
                onChange={(e) =>
                  setActionAmount(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
              />
              <button
                type="button"
                className="dnd-action-btn dnd-action-heal"
                onClick={() => onHeal(actionAmount)}
              >
                Heal
              </button>
              <button
                type="button"
                className="dnd-action-btn dnd-action-damage"
                onClick={() => onDamage(actionAmount)}
              >
                Damage
              </button>
              <button
                type="button"
                className="dnd-action-btn dnd-action-temp"
                onClick={() => onAddTemp(actionAmount)}
              >
                Add Temp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

