import { DHVitalsBlock, DHVitalsData } from "@/types/daggerheart/vitals";
import { DamageProgressionTrack } from "@/components/vitals/DamageProgressionTrack";
import { EvasionDisplay } from "@/components/vitals/EvasionDisplay";
import { ArmorDisplay } from "@/components/vitals/ArmorDisplay";
import { VitalBoxRow } from "@/components/vitals/VitalBoxRow";
import { HopeBar } from "@/components/vitals/HopeBar";

export type DaggerHeartVitalsGridProps = {
  block: DHVitalsBlock;
  data: DHVitalsData;
  onToggle: (vitalKey: string, index: number) => void;
};

export function DaggerHeartVitalsGrid({
  block,
  data,
  onToggle,
}: DaggerHeartVitalsGridProps) {
  const handleMarkDamage = (hpCount: number) => {
    const currentUsed = data.hp_used;
    const newUsed = Math.min(currentUsed + hpCount, block.hp);
    onToggle("hp_used", newUsed - 1);
  };

  return (
    <div className="daggerheart-vitals-container">
      <div className="vital-box-row-container">
        <EvasionDisplay evasion={block.evasion} />
        <ArmorDisplay
          armor={block.armor}
          usedArmor={data.armor_used}
          onToggle={(i) => onToggle("armor_used", i)}
        />
      </div>
      <DamageProgressionTrack
        thresholds={block.thresholds}
        onMarkDamage={handleMarkDamage}
      />
      <div className="vital-box-row-container">
        <VitalBoxRow
          label="HP"
          total={block.hp}
          used={data.hp_used}
          onToggle={(i) => onToggle("hp_used", i)}
        />
        <VitalBoxRow
          label="STRESS"
          total={block.stress}
          used={data.stress_used}
          onToggle={(i) => onToggle("stress_used", i)}
        />
      </div>
      <HopeBar used={data.hope} onToggle={(i) => onToggle("hope", i)} />
    </div>
  );
}

