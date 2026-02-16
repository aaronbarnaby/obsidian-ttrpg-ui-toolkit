import * as React from "react";

export type HopeBarProps = {
  used: number;
  onToggle: (index: number) => void;
};

export function HopeBar({ used, onToggle }: HopeBarProps) {
  return (
    <div className="hope-section">
      <span className="vital-label">HOPE</span>
      <div className="hope-bar">
        {Array.from({ length: 6 }, (_, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="hope-divider" />}
            <button
              className={`hope-diamond ${i < used ? "active" : ""}`}
              onClick={() => onToggle(i)}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

