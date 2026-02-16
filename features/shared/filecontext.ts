import { Frontmatter } from "@/types/core";
import * as Fm from "@/lib/domains/frontmatter";
import { App, MarkdownPostProcessorContext } from "obsidian";
import { msgbus } from "@/lib/services/event-bus";

export function useFileContext(app: App, ctx: MarkdownPostProcessorContext) {
  function frontmatter(): Frontmatter {
    const fm = app.metadataCache.getCache(ctx.sourcePath)?.frontmatter;
    return Fm.anyIntoFrontMatter(fm || {});
  }

  function onFrontmatterChange(cb: (v: Frontmatter) => void): () => void {
    return msgbus.subscribe(ctx.sourcePath, "fm:changed", cb);
  }

  function onAbilitiesChange(cb: () => void): () => void {
    return msgbus.subscribe(ctx.sourcePath, "abilities:changed", cb);
  }

  return {
    filepath: ctx.sourcePath,
    frontmatter,
    onFrontmatterChange,
    onAbilitiesChange,
    md: () => ctx,
  };
}

export type FileContext = ReturnType<typeof useFileContext>;

