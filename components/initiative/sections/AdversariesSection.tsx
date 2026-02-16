import * as React from "react";
import { Adversary } from "@/lib/services/adversary";
import { AdversaryVitalsBlock } from "../parts/AdversaryVitalsBlock";
import { AdversaryDetails } from "../parts/AdversaryDetails";

export interface AdversariesSectionProps {
  adversaries: Adversary[];
  expandedAdversaryKey: string | null;
  setExpandedAdversaryKey: React.Dispatch<React.SetStateAction<string | null>>;
  getAdversaryVitals: (key: string) => { hp_used: number; stress_used: number; conditions: string[] };
  handleAdversaryVitalToggle: (advKey: string, key: "hp_used" | "stress_used", newUsed: number) => void;
  onOpenFile?: (filePath: string) => void;
}

export function AdversariesSection({
  adversaries,
  expandedAdversaryKey,
  setExpandedAdversaryKey,
  getAdversaryVitals,
  handleAdversaryVitalToggle,
  onOpenFile,
}: AdversariesSectionProps) {
  return (
    <div className="initiative-section">
      <div className="initiative-section-title">Adversaries</div>
      {adversaries.map((adv) => {
        const isExpanded = expandedAdversaryKey === adv.key;
        const vitals = getAdversaryVitals(adv.key);

        return (
          <div
            key={adv.key}
            className={`initiative-row ${isExpanded ? "initiative-row-expanded" : ""}`}
          >
            <span
              className="initiative-row-name-label"
              role="button"
              tabIndex={0}
              onClick={() => setExpandedAdversaryKey((i) => (i === adv.key ? null : adv.key))}
            >
              {adv.data.name}
            </span>
            <div className="initiative-row-main">
              <div className="initiative-row-vitals">
                <AdversaryVitalsBlock
                  label="HP"
                  total={adv.data.hp}
                  used={vitals.hp_used}
                  onToggle={(newUsed) => handleAdversaryVitalToggle(adv.key, "hp_used", newUsed)}
                />
                <AdversaryVitalsBlock
                  label="Stress"
                  total={adv.data.stress}
                  used={vitals.stress_used}
                  onToggle={(newUsed) => handleAdversaryVitalToggle(adv.key, "stress_used", newUsed)}
                />
              </div>
            </div>
            {isExpanded && <AdversaryDetails adversary={adv} onOpenAdversaryFile={onOpenFile} />}
          </div>
        );
      })}
    </div>
  );
}
