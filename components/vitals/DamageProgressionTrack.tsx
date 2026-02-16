export type DamageProgressionTrackProps = {
  thresholds: [number, number];
  onMarkDamage: (hpCount: number) => void;
};

export function DamageProgressionTrack({
  thresholds,
  onMarkDamage,
}: DamageProgressionTrackProps) {
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

