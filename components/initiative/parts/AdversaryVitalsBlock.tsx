import * as React from "react";

export interface AdversaryVitalsBlockProps {
  label: string;
  total: number;
  used: number;
  onToggle: (index: number) => void;
}

export function AdversaryVitalsBlock({ label, total, used, onToggle }: AdversaryVitalsBlockProps) {
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
