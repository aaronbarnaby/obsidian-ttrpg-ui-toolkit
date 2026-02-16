import { ReactNode } from "react";

export type StatGridProps = {
  cols: number;
  children: ReactNode;
  dense?: boolean;
};

export function StatGrid({ cols, children, dense }: StatGridProps) {
  return (
    <div className={`card-grid ${dense ? "dense" : ""}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {children}
    </div>
  );
}

