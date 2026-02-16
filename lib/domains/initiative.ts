import { DHInitiativeBlock, DHInitiativeState } from "@/types/daggerheart/initiative";
import { InitiativeBlock } from "@/types/initiative";
import { initiativeService } from "@/lib/services/initiative/InitiativeService";

export function parseInitiativeBlock(yamlString: string): InitiativeBlock {
  return initiativeService.parseInitiativeBlock(yamlString);
}


export function getDefaultDHInitiativeState(block: DHInitiativeBlock): DHInitiativeState {
  return initiativeService.getDefaultDHInitiativeState(block);
}
