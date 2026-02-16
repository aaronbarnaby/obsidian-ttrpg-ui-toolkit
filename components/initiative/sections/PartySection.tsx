import * as React from "react";
import type { PartyMember } from "@/lib/services/party";
import { VitalsBlock } from "../parts/VitalsBlock";
import { PartyMemberDetails } from "../parts/PartyMemberDetails";

function partyMemberName(member: PartyMember): string {
  const fm = member.templateContext.frontmatter;
  if (fm?.name != null) return String(fm.name);
  if (fm?.title != null) return String(fm.title);
  const base = member.filePath.split("/").pop() ?? "";
  return base.replace(/\.[^.]+$/, "") || "Unknown";
}

export interface PartySectionProps {
  partyMembers: PartyMember[];
  expandedPartyFilePath: string | null;
  setExpandedPartyFilePath: React.Dispatch<React.SetStateAction<string | null>>;
  onPartyMemberVitalsToggle?: (filePath: string, key: string, newUsed: number) => void;
  onOpenFile?: (filePath: string) => void;
}

export function PartySection({
  partyMembers,
  expandedPartyFilePath,
  setExpandedPartyFilePath,
  onPartyMemberVitalsToggle,
  onOpenFile,
}: PartySectionProps) {
  return (
    <div className="initiative-section">
      <div className="initiative-section-title">Party</div>
      {partyMembers.map((member) => {
        const isExpanded = expandedPartyFilePath === member.filePath;
        return (
          <div
            key={member.filePath}
            className={`initiative-row ${isExpanded ? "initiative-row-expanded" : ""}`}
          >
            <span
              className="initiative-row-name-label"
              role="button"
              tabIndex={0}
              onClick={() =>
                setExpandedPartyFilePath((p) => (p === member.filePath ? null : member.filePath))
              }
            >
              {partyMemberName(member)}
            </span>
            <div className="initiative-row-main">
              <div className="initiative-row-vitals">
                {member.vitalsBlock != null && member.vitalsData != null ? (
                  <VitalsBlock
                    vitalKey="hp_used"
                    label="HP"
                    total={member.vitalsBlock.hp}
                    used={member.vitalsData.hp_used}
                    filePath={member.filePath}
                    onToggle={onPartyMemberVitalsToggle ?? (() => {})}
                  />
                ) : (
                  <div className="vital-box-row">
                    <span className="vital-label">HP</span>
                    <span className="vital-boxes">—</span>
                  </div>
                )}
              </div>
            </div>
            {isExpanded && <PartyMemberDetails member={member} onOpenPartyFile={onOpenFile} />}
          </div>
        );
      })}
    </div>
  );
}
