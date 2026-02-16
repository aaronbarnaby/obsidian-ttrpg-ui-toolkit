import * as React from "react";
import { Adversary } from "@/lib/services/adversary";

export interface AdversaryDetailsProps {
  adversary: Adversary;
  onOpenAdversaryFile?: (filePath: string) => void;
}

export function AdversaryDetails({ adversary, onOpenAdversaryFile }: AdversaryDetailsProps) {
  return (
    <div className="initiative-row-extra">
      <div className="initiative-row-extra-content">
        <div className="badges-row">
          <div className="badge-item">
            <span className="badge-label">Tier {adversary.data.tier}</span>
            <span className="badge-value"> {adversary.data.type}</span>
          </div>
          <div className="badge-item">
            <span className="badge-label">Difficulty</span>
            <span className="badge-value">{adversary.data.difficulty}</span>
          </div>
          <div className="badge-item">
            <span className="badge-label">Threshold</span>
            <span className="badge-value">{adversary.data.major_threshold} / {adversary.data.severe_threshold}</span>
          </div>
          <div className="badge-item">
            <span className="badge-label">Attack</span>
            <span className="badge-value">{adversary.data.attack}</span>
          </div>
        </div>
        {onOpenAdversaryFile != null && !!adversary.filePath && (
          <div className="initiative-row-extra-button">
            <button
              type="button"
              className="initiative-open-party-file"
              aria-label="Open party file in new tab"
              onClick={() => onOpenAdversaryFile(adversary.filePath!)}
            >
              Open in new tab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
