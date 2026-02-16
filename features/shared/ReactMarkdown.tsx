import { MarkdownRenderChild } from "obsidian";
import * as ReactDOM from "react-dom/client";

type UnloadFn = () => void;

export class ReactMarkdown extends MarkdownRenderChild {
  protected reactRoot: ReactDOM.Root | null = null;
  private callOnUnload: UnloadFn[] = [];

  public addUnloadFn(fn: UnloadFn): void {
    this.callOnUnload.push(fn);
  }

  onunload(): void {
    if (this.reactRoot) {
      try {
        this.reactRoot.unmount();
      } catch (e) {
        console.error("Error unmounting React component:", e);
      }
      this.reactRoot = null;
    }

    for (const fn of this.callOnUnload) {
      try {
        fn();
      } catch (e) {
        console.error("Error calling onUnload function:", e);
      }
    }
  }
}

