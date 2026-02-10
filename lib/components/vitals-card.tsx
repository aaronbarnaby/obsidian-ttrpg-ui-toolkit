import * as React from "react";
import { DHVitalsBlock, DHVitalsData } from "@/types/daggerheart/vitals";

interface DamageProgressionTrackProps {
  thresholds: [number, number];
  onMarkDamage: (hpCount: number) => void;
}

function DamageProgressionTrack({ thresholds, onMarkDamage }: DamageProgressionTrackProps) {
  return (
    <div className="damage-progression-track">
      <button className="damage-segment" onClick={() => onMarkDamage(1)}>
        <div className="damage-label">MINOR DAMAGE</div>
        <div className="damage-subtitle">Mark 1 HP</div>
      </button>
      <div className="damage-threshold major-damage-threshold">
        <span className="damage-threshold-number">{thresholds[0]}</span>
      </div>
      <button className="damage-segment" onClick={() => onMarkDamage(2)}>
        <div className="damage-label">MAJOR DAMAGE</div>
        <div className="damage-subtitle">Mark 2 HP</div>
      </button>
      <div className="damage-threshold severe-damage-threshold">
        <span className="damage-threshold-number">{thresholds[1]}</span>
      </div>
      <button className="damage-segment" onClick={() => onMarkDamage(3)}>
        <div className="damage-label">SEVERE DAMAGE</div>
        <div className="damage-subtitle">Mark 3 HP</div>
      </button>
    </div>
  );
}

interface EvasionDisplayProps {
  evasion: number;
}

function EvasionDisplay({ evasion }: EvasionDisplayProps) {
  return (
    <div className="vital-box-row">
      <div className="vital-label">EVASION</div>
      <div className="vital-boxes">
        <span className="evasion-number">{evasion}</span>
      </div>
    </div>
  );
}

interface ArmorDisplayProps {
  armor: number;
  usedArmor: number;
  onToggle: (index: number) => void;
}

function ArmorDisplay({ armor, usedArmor, onToggle }: ArmorDisplayProps) {
  return (
    <div className="vital-box-row">
      <div className="vital-label">ARMOR</div>
      <div className="vital-boxes nowrap">
        <div className="armor-number">{armor}</div>

        <div className="armor-blocks-grid">
          {Array.from({ length: armor }, (_, i) => (
            <button key={i} className={`vital-box ${i < usedArmor ? "active" : ""}`} onClick={() => onToggle(i)} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface VitalBoxRowProps {
  label: string;
  total: number;
  used: number;
  onToggle: (index: number) => void;
}

function VitalBoxRow({ label, total, used, onToggle }: VitalBoxRowProps) {
  return (
    <div className="vital-box-row">
      <span className="vital-label">{label}</span>
      <div className="vital-boxes">
        {Array.from({ length: total }, (_, i) => (
          <button key={i} className={`vital-box ${i < used ? "active" : ""}`} onClick={() => onToggle(i)} />
        ))}
      </div>
    </div>
  );
}

interface HopeBarProps {
  used: number;
  onToggle: (index: number) => void;
}

function HopeBar({ used, onToggle }: HopeBarProps) {
  const hopeTotal = 6;
  return (
    <div className="hope-section">
      <span className="vital-label">HOPE</span>
      <div className="hope-bar">
        {Array.from({ length: hopeTotal }, (_, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="hope-divider" />}
            <button className={`hope-diamond ${i < used ? "active" : ""}`} onClick={() => onToggle(i)} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface DaggerHeartVitalsGridProps {
  block: DHVitalsBlock;
  data: DHVitalsData;
  onToggle: (vitalKey: string, index: number) => void;
}

export function DaggerHeartVitalsGrid({ block, data, onToggle }: DaggerHeartVitalsGridProps) {
  const handleMarkDamage = (hpCount: number) => {
    const currentUsed = data.used_hp_blocks;
    const newUsed = Math.min(currentUsed + hpCount, data.hp_blocks);
    onToggle("hp_used", newUsed - 1);
  };

  return (
    <div className="daggerheart-vitals-container">
      <div className="vital-box-row-container">
        <EvasionDisplay evasion={block.evasion} />
        <ArmorDisplay
          armor={data.armor_blocks}
          usedArmor={data.used_armor_blocks}
          onToggle={(i) => onToggle("armor_used", i)}
        />
      </div>

      <DamageProgressionTrack thresholds={block.thresholds} onMarkDamage={handleMarkDamage} />

      <div className="vital-box-row-container">
        <VitalBoxRow
          label="HP"
          total={data.hp_blocks}
          used={data.used_hp_blocks}
          onToggle={(i) => onToggle("hp_used", i)}
        />

        <VitalBoxRow
          label="STRESS"
          total={data.stress_blocks}
          used={data.used_stress_blocks}
          onToggle={(i) => onToggle("stress_used", i)}
        />
      </div>

      <HopeBar used={data.hope} onToggle={(i) => onToggle("hope", i)} />
    </div>
  );
}
