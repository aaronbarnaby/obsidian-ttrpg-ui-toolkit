import { Feature } from "@/types/features";
import * as Utils from "@/lib/utils/utils";
import { parse } from "yaml";

export function parseFeatureBlock(yamlString: string): Feature {
  const parsed = parse(yamlString);

  const def: Feature = {
    passives: [],
    actions: [],
  };

  const features = Utils.mergeWithDefaults(parsed, def);
  return features;
}
