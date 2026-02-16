import * as React from "react";

export interface VitalsBlockProps {
  vitalKey: string;
  label: string;
  total: number;
  used: number;
  filePath: string;
  onToggle: (filePath: string, vitalKey: string, newUsed: number) => void;
}

export function VitalsBlock({ vitalKey, label, total, used, filePath, onToggle }: VitalsBlockProps) {
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
