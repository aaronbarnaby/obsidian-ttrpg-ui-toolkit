export type DHFeature = {
  passives: DHPassiveFeature[];
  actions: DHActionFeature[];
};

export type DHPassiveFeature = {
  name: string;
  description: string;
  lore: string;

  effects: DHFeatureEffect[];
};

export type DHActionFeature = {
  name: string;
  description: string;
  lore: string;
  cost: DHFeatureCost[];
};

export type DHFeatureEffect = {
  property: string;  // e.g attack, major_threshold, hp
  value: string;  // e.g +1, +2, -1, -2
};

export type DHFeatureCost = {
  property: string;  // e.g stress, fear
  value: number;
};

