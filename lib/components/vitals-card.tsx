import * as React from "react";
import { DHVitalsData } from "@/types/daggerheart/vitals";

interface VitalBoxProps {
  active: boolean;
  diamond?: boolean;
  onClick: () => void;
}

function VitalBox({ active, diamond, onClick }: VitalBoxProps) {
  const className = [
    "vital-box",
    diamond ? "diamond" : "",
    active ? "active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={className} onClick={onClick} />;
}

interface VitalRowProps {
  label: string;
  total: number;
  used: number;
  diamond?: boolean;
  onToggle: (index: number) => void;
}

function VitalRow({ label, total, used, diamond, onToggle }: VitalRowProps) {
  return (
    <div className="vital-row">
      <span className="vital-label">{label}</span>
      <div className="vital-boxes">
        {Array.from({ length: total }, (_, i) => (
          <VitalBox
            key={i}
            active={i < used}
            diamond={diamond}
            onClick={() => onToggle(i)}
          />
        ))}
      </div>
    </div>
  );
}

interface DaggerHeartVitalsGridProps {
  data: DHVitalsData;
  onToggle: (vitalKey: string, index: number) => void;
}

export function DaggerHeartVitalsGrid({ data, onToggle }: DaggerHeartVitalsGridProps) {
  return (
    <div className="vitals-grid">
      <VitalRow
        label="HP"
        total={data.hp_blocks}
        used={data.used_hp_blocks}
        onToggle={(i) => onToggle("hp_used", i)}
      />
      <VitalRow
        label="Stress"
        total={data.stress_blocks}
        used={data.used_stress_blocks}
        onToggle={(i) => onToggle("stress_used", i)}
      />
      <VitalRow
        label="Armor"
        total={data.armor_blocks}
        used={data.used_armor_blocks}
        onToggle={(i) => onToggle("armor_used", i)}
      />
      <VitalRow
        label="Hope"
        total={data.hope_blocks}
        used={data.used_hope_blocks}
        diamond
        onToggle={(i) => onToggle("hope_used", i)}
      />
    </div>
  );
}
