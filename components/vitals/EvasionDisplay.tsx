export type EvasionDisplayProps = {
  evasion: number;
};

export function EvasionDisplay({ evasion }: EvasionDisplayProps) {
  return (
    <div className="vital-box-row">
      <div className="vital-label">EVASION</div>
      <div className="vital-boxes">
        <span className="evasion-number">{evasion}</span>
      </div>
    </div>
  );
}

