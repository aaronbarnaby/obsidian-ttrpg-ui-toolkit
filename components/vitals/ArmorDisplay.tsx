export type ArmorDisplayProps = {
  armor: number;
  usedArmor: number;
  onToggle: (index: number) => void;
};

export function ArmorDisplay({ armor, usedArmor, onToggle }: ArmorDisplayProps) {
  return (
    <div className="vital-box-row">
      <div className="vital-label">ARMOR</div>
      <div className="vital-boxes nowrap">
        <div className="armor-number">{armor}</div>
        <div className="armor-blocks-grid">
          {Array.from({ length: armor }, (_, i) => (
            <button
              key={i}
              className={`vital-box ${i < usedArmor ? "active" : ""}`}
              onClick={() => onToggle(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

