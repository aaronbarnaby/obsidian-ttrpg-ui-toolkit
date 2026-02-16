import { App, TFile } from "obsidian";

export function openFileInNewLeaf(app: App, filePath: string): void {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (file instanceof TFile) {
    app.workspace.getLeaf(true).openFile(file);
  }
}

