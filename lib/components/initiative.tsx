import { DHInitiativeBlock, DHInitiativeState } from "@/types/daggerheart/initiative";
import type { PartyMember } from "../services/party";

export type { PartyMember };

export type DHInitiativeProps = {
  static: DHInitiativeBlock;
  state: DHInitiativeState;
  partyMembers: PartyMember[];
  onStateChange: (newState: DHInitiativeState) => void;
  /** Called when a party member's HP blocks are toggled; persists to KV so all views stay in sync. */
  onPartyMemberHpToggle?: (filePath: string, newUsed: number) => void;
};

function partyMemberName(member: PartyMember): string {
  const fm = member.templateContext.frontmatter;
  if (fm?.name != null) return String(fm.name);
  if (fm?.title != null) return String(fm.title);
  const base = member.filePath.split("/").pop() ?? "";
  return base.replace(/\.[^.]+$/, "") || "Unknown";
}

interface HpBlocksProps {
  total: number;
  used: number;
  filePath: string;
  onToggle: (filePath: string, newUsed: number) => void;
}

function HpBlocks({ total, used, filePath, onToggle }: HpBlocksProps) {
  const handleClick = (index: number) => {
    const newUsed =
      used >= index + 1 ? index : Math.min(index + 1, total);
    onToggle(filePath, newUsed);
  };

  return (
    <div className="vital-box-row">
      <span className="vital-label">HP</span>
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

export function DHInitiative(props: DHInitiativeProps) {
  const { partyMembers, onPartyMemberHpToggle } = props;

  return (
    <div className="initiative-tracker">
      <div className="initiative-tracker-title">DaggerHeart Initiative Tracker</div>
      {partyMembers.length > 0 && (
        <div className="initiative-party-list">
          {partyMembers.map((member) => (
            <div key={member.filePath} className="initiative-party-member">
              <div className="initiative-party-member-name">
                {partyMemberName(member)}
              </div>
              {member.vitalsBlock != null && member.vitalsData != null ? (
                <HpBlocks
                  total={member.vitalsData.hp_blocks}
                  used={member.vitalsData.used_hp_blocks}
                  filePath={member.filePath}
                  onToggle={onPartyMemberHpToggle ?? (() => {})}
                />
              ) : (
                <div className="vital-box-row">
                  <span className="vital-label">HP</span>
                  <span className="vital-boxes">—</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
