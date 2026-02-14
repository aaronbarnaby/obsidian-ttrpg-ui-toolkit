import * as React from "react";
import { DHInitiativeBlock, DHInitiativeState } from "@/types/daggerheart/initiative";
import type { PartyMember } from "../services/party";
import { Adversary } from "../services/adversary";

export type { PartyMember };

export type DHInitiativeProps = {
  static: DHInitiativeBlock;
  state: DHInitiativeState;
  partyMembers: PartyMember[];
  adversaries: Adversary[];
  onStateChange: (newState: DHInitiativeState) => void;
  onPartyMemberVitalsToggle?: (filePath: string, key: string, newUsed: number) => void;
  onOpenFile?: (filePath: string) => void;
};

function partyMemberName(member: PartyMember): string {
  const fm = member.templateContext.frontmatter;
  if (fm?.name != null) return String(fm.name);
  if (fm?.title != null) return String(fm.title);
  const base = member.filePath.split("/").pop() ?? "";
  return base.replace(/\.[^.]+$/, "") || "Unknown";
}

function PartyMemberAdditionalDetails(member: PartyMember, onOpenPartyFile?: (filePath: string) => void) {
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

interface VitalsBlockProps {
  vitalKey: string;
  label: string;
  total: number;
  used: number;
  filePath: string;
  onToggle: (filePath: string, vitalKey: string, newUsed: number) => void;
}

function VitalsBlock({ vitalKey, label, total, used, filePath, onToggle }: VitalsBlockProps) {
  const handleClick = (index: number) => {
    const newUsed = used >= index + 1 ? index : Math.min(index + 1, total);
    onToggle(filePath, vitalKey, newUsed);
  };

  return (
    <div className="vital-box-row">
      <span className="vital-label">{label}</span>
      <div className="vital-boxes">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`vital-box ${i < used ? "active" : ""}`}
            onClick={() => handleClick(i)}
          />
        ))}
      </div>
    </div>
  );
}

function AdversaryAdditionalDetails(adversary: Adversary, onOpenAdversaryFile?: (filePath: string) => void) {
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

interface AdversaryVitalsBlockProps {
  label: string;
  total: number;
  used: number;
  onToggle: (index: number) => void;
}

function AdversaryVitalsBlock({ label, total, used, onToggle }: AdversaryVitalsBlockProps) {
  const handleClick = (index: number) => {
    const newUsed = used >= index + 1 ? index : Math.min(index + 1, total);
    onToggle(newUsed);
  };

  return (
    <div className="vital-box-row">
      <span className="vital-label">{label}</span>
      <div className="vital-boxes">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`vital-box ${i < used ? "active" : ""}`}
            onClick={() => handleClick(i)}
          />
        ))}
      </div>
    </div>
  );
}

function GMFearBlock() { 
  const [used, setUsed] = React.useState(0);
  const handleClick = (index: number) => {
    const newUsed = used >= index + 1 ? index : Math.min(index + 1, 12);
    setUsed(newUsed);
  };

  return (
    <div className="fear-box-row">
      <span className="fear-label">FEAR</span>
      <div className="fear-boxes">
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`fear-box ${i < used ? "active" : ""}`}
            onClick={() => handleClick(i)}
          />
        ))}
      </div>
    </div>
  );
}

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
    if (!entry) return;

    const next = { ...entry, [key]: newUsed };
    onStateChange({ ...state, adversaries: [...state.adversaries.filter((adv) => adv.key !== advKey), next] });
  };

  const addAdversaryCondition = (advKey: string, condition: string) => {
    const entry = state.adversaries.find((adv) => adv.key === advKey);
    if (!entry) return;

    const next = { ...entry, conditions: [...entry.conditions, condition] };
    onStateChange({ ...state, adversaries: [...state.adversaries.filter((adv) => adv.key !== advKey), next] });
  };

  const removeAdversaryCondition = (advKey: string, condition: string) => {
    const entry = state.adversaries.find((adv) => adv.key === advKey);
    if (!entry) return;

    const next = { ...entry, conditions: entry.conditions.filter((c) => c !== condition) };
    onStateChange({ ...state, adversaries: [...state.adversaries.filter((adv) => adv.key !== advKey), next] });
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
                  <GMFearBlock />
                </div>
              </div>
            </div>
          )}
          
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
                  <span className="initiative-row-name-label" role="button" tabIndex={0} onClick={() => {
                      setExpandedAdversaryKey((i) => (i === adv.key ? null : adv.key))
                    }}>{adv.data.name}</span>
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
                        onToggle={(newUsed) =>
                          handleAdversaryVitalToggle(adv.key, "stress_used", newUsed)
                        }
                      />
                    </div>
                  </div>
                  {isExpanded && AdversaryAdditionalDetails(adv, onOpenFile)}
                </div>
              );
            })}
          </div>

          {partyMembers.length > 0 && (
            <div className="initiative-section">
            <div className="initiative-section-title">Party</div>
            {partyMembers.map((member) => {
              const isExpanded = expandedPartyFilePath === member.filePath;
              return (
                <div
                  key={member.filePath}
                  className={`initiative-row ${isExpanded ? "initiative-row-expanded" : ""}`}
                >
                  <span className="initiative-row-name-label" role="button" tabIndex={0} onClick={() => {
                    setExpandedPartyFilePath((p) =>
                      p === member.filePath ? null : member.filePath
                    )
                  }}>{partyMemberName(member)}</span>
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
                  {isExpanded && PartyMemberAdditionalDetails(member, onOpenFile)}
                </div>
              );
            })}
          </div>
          )}
        </>
      )}
    </div>
  );
}
