import { App, TFile } from "obsidian";
import { KeyValueStore } from "./kv/kv";
import { loadTemplateContextForFile } from "@/lib/utils/template";
import { extractFirstCodeBlock } from "@/lib/utils/codeblock-extractor";
import * as VitalsService from "../domains/vitals";
import { DHInitiativeBlock } from "@/types/daggerheart/initiative";
import { DHVitalsBlock, DHVitalsBlockInput, DHVitalsData } from "@/types/daggerheart/vitals";
import { TemplateContext } from "@/lib/utils/template";

export type PartyMember = {
  filePath: string;
  templateContext: TemplateContext;
  vitalsBlock?: DHVitalsBlock;
  vitalsData?: DHVitalsData;
};

/**
 * Resolve a party entry (link path or [[wiki]] link) to an absolute vault file path, or null.
 */
export function resolvePartyEntryToPath(
  app: App,
  entry: string,
  sourcePath: string
): string | null {
  const linkpath = entry.replace(/^\[\[|\]\]$/g, "").split("|")[0].trim();
  const dest = app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
  if (!dest || !(dest instanceof TFile)) return null;
  return dest.path;
}

/**
 * Load party members for a Daggerheart initiative block: resolve each party entry to a file,
 * load TemplateContext and (if present) DH vitals for that file.
 */
export async function loadPartyMembers(
  app: App,
  kv: KeyValueStore,
  sourcePath: string,
  block: DHInitiativeBlock
): Promise<PartyMember[]> {
  const party = block.party ?? [];
  const members: PartyMember[] = [];

  for (const entry of party) {
    const filePath = resolvePartyEntryToPath(app, entry, sourcePath);
    if (!filePath) continue;

    const templateContext = await loadTemplateContextForFile(app, filePath);

    let vitalsBlock: DHVitalsBlock | undefined;
    let vitalsData: DHVitalsData | undefined;

    try {
      const file = app.vault.getAbstractFileByPath(filePath);
      if (!file || !(file instanceof TFile)) continue;

      const content = await app.vault.read(file);
      const vitalsContent = extractFirstCodeBlock(content, "vitals");
      if (vitalsContent) {
        const parsed = VitalsService.parseVitalsBlock(vitalsContent);
        if (parsed.type === "daggerheart") {
          const input = parsed as DHVitalsBlockInput;
          vitalsBlock = VitalsService.resolveDHVitalsBlockFromInput(input, templateContext);
          vitalsData = await VitalsService.loadDHVitalsData(vitalsBlock, kv, filePath);
        }
      }
    } catch (err) {
      console.error("Error loading vitals for party file:", filePath, err);
    }

    members.push({
      filePath,
      templateContext,
      vitalsBlock,
      vitalsData,
    });
  }

  return members;
}
