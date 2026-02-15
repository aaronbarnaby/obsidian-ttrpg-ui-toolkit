export type Feature = {
  passives: PassiveFeature[];
  actions: ActionFeature[];
};

export type PassiveFeature = {
  name: string;
  description: string;
  lore: string;
  modifiers: FeatureModifier[];
};

export type ActionFeature = {
  name: string;
  description: string;
  lore: string;
  cost?: FeatureCost[];
};

/** Modifier type: "ability" (affects ability scores) or "property" (affects frontmatter/template values). Missing or unknown type is treated as "property". */
export type FeatureModifierType = "ability" | "property";

export type FeatureModifier = {
  /** "ability" | "property"; defaults to "property" when aggregating. */
  type?: FeatureModifierType;
  /** Target: ability name (e.g. strength, Agility) or frontmatter key (e.g. hp, attack). */
  property: string;
  value: number;
};

/** Combined modifiers from features + equipment, keyed by type then property name; values are summed. */
export type AggregatedModifiers = {
  ability: Record<string, number>;
  property: Record<string, number>;
};


export type FeatureCost = {
  property: string;  // e.g stress, fear
  value: number;
};

