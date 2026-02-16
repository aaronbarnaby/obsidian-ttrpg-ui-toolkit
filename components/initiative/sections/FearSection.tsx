import * as React from "react";

export function FearSection() {
  const [used, setUsed] = React.useState(0);
  const handleClick = (index: number) => {
    const newUsed = used >= index + 1 ? index : Math.min(index + 1, 12);
    setUsed(newUsed);
  };

  return (
    <div className="fear-box-row">
      <span className="fear-label">FEAR</span>
      <div className="fear-boxes">
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`fear-box ${i < used ? "active" : ""}`}
            onClick={() => handleClick(i)}
          />
        ))}
      </div>
    </div>
  );
}
