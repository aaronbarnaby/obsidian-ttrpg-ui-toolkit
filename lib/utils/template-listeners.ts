import { FileContext } from "@/features/shared/filecontext";

export function bindTemplateRerenderListeners(
  fileContext: FileContext,
  isTemplate: () => boolean,
  addUnloadFn: (fn: () => void) => void,
  rerender: () => void
): void {
  addUnloadFn(
    fileContext.onFrontmatterChange(() => {
      if (!isTemplate()) return;
      rerender();
    })
  );
  addUnloadFn(
    fileContext.onAbilitiesChange(() => {
      if (!isTemplate()) return;
      rerender();
    })
  );
}

