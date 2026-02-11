import { DHInitiativeBlock, DHInitiativeState } from "@/types/daggerheart/initiative";
import { InitiativeBlock } from "@/types/initiative";
import * as Utils from "lib/utils/utils";
import { parse } from "yaml";

export function parseInitiativeBlock(yamlString: string): InitiativeBlock {
  const parsed = parse(yamlString);

  if (parsed.type === "daggerheart") {
    const dhDefaults: DHInitiativeBlock = {
      type: "daggerheart",
      adversaries: [],
      party: [],
    };
    const base = Utils.mergeWithDefaults(parsed, dhDefaults);
    return base;
  } else if (parsed.type === "dnd") {
    // TODO: Implement DND initiative block parsing
  }

  throw new Error("Invalid initiative block type");
}


export function getDefaultDHInitiativeState(block: DHInitiativeBlock): DHInitiativeState {
  return {
    adversaries: block.adversaries.map((_, index) => ({
      index,
      hp_used: 0,
      stress_used: 0,
    })),
  };
}
