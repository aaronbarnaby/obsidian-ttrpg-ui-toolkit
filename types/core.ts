export type Frontmatter = {
  [key: string]: any; // Allow other frontmatter properties
};

export type ResetConfig = {
  event: string;
  amount?: number; // If undefined, resets completely
};

export type EventButtonItem = {
  name: string;
  value: string | { event: string; amount: number }; // The event type that gets dispatched, or object with event and amount
};

export type EventButtonsBlock = {
  items: EventButtonItem[];
};

export type BadgeItem = {
  label: string;
  value: string | number;
};

export type BadgesBlock = {
  items: BadgeItem[];
  dense?: boolean;
};

export type StatItem = {
  label: string;
  sublabel?: string;
  value: string | number;
}

export type StatsBlock = {
  items: BadgeItem[];
  dense?: boolean;
  grid?: {
    columns: number;
  }
}
