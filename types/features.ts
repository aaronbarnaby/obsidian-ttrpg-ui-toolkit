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

export type FeatureModifier = {
  type?: string;
  property: string;  // e.g attack, major_threshold, hp
  value: number;
};


export type FeatureCost = {
  property: string;  // e.g stress, fear
  value: number;
};

