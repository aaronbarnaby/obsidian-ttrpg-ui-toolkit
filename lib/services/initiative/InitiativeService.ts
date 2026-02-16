import { DHInitiativeBlock, DHInitiativeState } from "@/types/daggerheart/initiative";
import { InitiativeBlock } from "@/types/initiative";
import * as Utils from "@/lib/utils/utils";
import { parse } from "yaml";

export class InitiativeService {
  public parseInitiativeBlock(yamlString: string): InitiativeBlock {
    const parsed = parse(yamlString);

    if (parsed.type === "daggerheart") {
      const defaults: DHInitiativeBlock = {
        type: "daggerheart",
        name: "",
        adversaries: [],
        party: [],
        countdowns: [],
      };
      return Utils.mergeWithDefaults(parsed, defaults);
    }

    if (parsed.type === "dnd") {
      return parsed as InitiativeBlock;
    }

    throw new Error("Invalid initiative block type");
  }

  public getDefaultDHInitiativeState(block: DHInitiativeBlock): DHInitiativeState {
    return {
      adversaries: block.adversaries.map((adv) => ({
        key: adv.key,
        hp_used: 0,
        stress_used: 0,
        conditions: [],
      })),
      countdowns: [],
    };
  }
}

export const initiativeService = new InitiativeService();

