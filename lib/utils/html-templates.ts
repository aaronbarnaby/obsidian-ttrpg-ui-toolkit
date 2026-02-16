import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";

export function renderHtml(component: ReactElement): string {
  return renderToString(component);
}

