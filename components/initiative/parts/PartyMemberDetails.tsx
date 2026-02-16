import * as React from "react";
import type { PartyMember } from "@/lib/services/party";

export interface PartyMemberDetailsProps {
  member: PartyMember;
  onOpenPartyFile?: (filePath: string) => void;
}

export function PartyMemberDetails({ member, onOpenPartyFile }: PartyMemberDetailsProps) {
  return (
    <div className="initiative-row-extra">
      <div className="initiative-row-extra-content">
        <div className="badges-row">
          <div className="badge-item">
            <span className="badge-label">Evasion</span>
            <span className="badge-value">{member.vitalsBlock?.evasion}</span>
          </div>
          <div className="badge-item">
            <span className="badge-label">Threshholds</span>
            <span className="badge-value">{member.vitalsBlock?.thresholds.join(" / ")}</span>
          </div>
          <div className="badge-item">
            <span className="badge-label">Armor</span>
            <span className="badge-value">{member.vitalsData?.armor_used} / {member.vitalsBlock?.armor}</span>
          </div>
          <div className="badge-item">
            <span className="badge-label">Stress</span>
            <span className="badge-value">{member.vitalsData?.stress_used} / {member.vitalsBlock?.stress}</span>
          </div>
          <div className="badge-item">
            <span className="badge-label">Hope</span>
            <span className="badge-value">{member.vitalsData?.hope}</span>
          </div>
        </div>
        {onOpenPartyFile != null && (
          <div className="initiative-row-extra-button">
            <button
              type="button"
              className="initiative-open-party-file"
              aria-label="Open party file in new tab"
              onClick={() => onOpenPartyFile(member.filePath)}
            >
              Open in new tab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
