import * as React from "react";
import { DHInitiativeBlock, DHInitiativeState } from "@/types/daggerheart/initiative";
import type { PartyMember } from "@/lib/services/party";
import { Adversary } from "@/lib/services/adversary";
import { FearSection } from "./sections/FearSection";
import { AdversariesSection } from "./sections/AdversariesSection";
import { PartySection } from "./sections/PartySection";

export type DHInitiativeProps = {
  static: DHInitiativeBlock;
  state: DHInitiativeState;
  partyMembers: PartyMember[];
  adversaries: Adversary[];
  onStateChange: (newState: DHInitiativeState) => void;
  onPartyMemberVitalsToggle?: (filePath: string, key: string, newUsed: number) => void;
  onOpenFile?: (filePath: string) => void;
};

export function DHInitiative(props: DHInitiativeProps) {
  const { static: block, state, partyMembers, adversaries, onStateChange, onPartyMemberVitalsToggle, onOpenFile } = props;

  const [encounterCollapsed, setEncounterCollapsed] = React.useState(false);
  const [expandedPartyFilePath, setExpandedPartyFilePath] = React.useState<string | null>(null);
  const [expandedAdversaryKey, setExpandedAdversaryKey] = React.useState<string | null>(null);

  const getAdversaryVitals = (key: string) => {
    const entry = state.adversaries.find((adv) => adv.key === key);
    return entry
      ? { hp_used: entry.hp_used, stress_used: entry.stress_used, conditions: entry.conditions }
      : { hp_used: 0, stress_used: 0, conditions: [] };
  };

  const handleAdversaryVitalToggle = (
    advKey: string,
    key: "hp_used" | "stress_used",
    newUsed: number
  ) => {
    const entry = state.adversaries.find((adv) => adv.key === advKey);
    const base = entry ?? { key: advKey, hp_used: 0, stress_used: 0, conditions: [] };
    const next = { ...base, [key]: newUsed };
    const nextAdversaries = entry
      ? state.adversaries.map((adv) => (adv.key === advKey ? next : adv))
      : [...state.adversaries, next];
    onStateChange({ ...state, adversaries: nextAdversaries });
  };

  return (
    <div className="encounter-tracker">
      <button
        type="button"
        className={`encounter-header ${encounterCollapsed ? "encounter-header-collapsed" : ""}`}
        onClick={() => setEncounterCollapsed((c) => !c)}
      >
        <span className="encounter-label">Encounter:</span>
        <span className="encounter-name">{block.name}</span>
        <span className="encounter-toggle" aria-label={encounterCollapsed ? "Expand" : "Collapse"}>
          {encounterCollapsed ? "▶" : "▼"}
        </span>
      </button>

      {!encounterCollapsed && (
        <>
          {block.show_fear && (
            <div className="initiative-section">
              <div className="initiative-row">
                <div className="initiative-row-main no-padding">
                  <FearSection />
                </div>
              </div>
            </div>
          )}

          <AdversariesSection
            adversaries={adversaries}
            expandedAdversaryKey={expandedAdversaryKey}
            setExpandedAdversaryKey={setExpandedAdversaryKey}
            getAdversaryVitals={getAdversaryVitals}
            handleAdversaryVitalToggle={handleAdversaryVitalToggle}
            onOpenFile={onOpenFile}
          />

          {partyMembers.length > 0 && (
            <PartySection
              partyMembers={partyMembers}
              expandedPartyFilePath={expandedPartyFilePath}
              setExpandedPartyFilePath={setExpandedPartyFilePath}
              onPartyMemberVitalsToggle={onPartyMemberVitalsToggle}
              onOpenFile={onOpenFile}
            />
          )}
        </>
      )}
    </div>
  );
}
