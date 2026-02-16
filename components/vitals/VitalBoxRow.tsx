export type VitalBoxRowProps = {
  label: string;
  total: number;
  used: number;
  onToggle: (index: number) => void;
};

export function VitalBoxRow({ label, total, used, onToggle }: VitalBoxRowProps) {
  return (
    <div className="vital-box-row">
      <span className="vital-label">{label}</span>
      <div className="vital-boxes">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            className={`vital-box ${i < used ? "active" : ""}`}
            onClick={() => onToggle(i)}
          />
        ))}
      </div>
    </div>
  );
}

