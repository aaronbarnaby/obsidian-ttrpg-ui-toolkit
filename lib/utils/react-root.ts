import * as ReactDOM from "react-dom/client";

export function ensureReactRoot(
  root: ReactDOM.Root | null,
  container: HTMLElement
): ReactDOM.Root {
  if (root) {
    return root;
  }

  return ReactDOM.createRoot(container);
}

