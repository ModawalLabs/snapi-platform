"use client";

import { useComposer } from "@/components/layout/composer-provider";
import { WorkspaceComposer } from "@/features/workspace/components/workspace-composer";

/**
 * The Concierge's composer, wired to the shell.
 *
 * A three-line client wrapper, and it earns its file. `ChatStart` is a Server
 * Component so it cannot read context, and `WorkspaceComposer` cannot read it
 * either — it is also rendered inside the `(workspace)` group, where there is no
 * `ComposerProvider` above it and `useComposer()` would throw.
 *
 * So the subscription lives here, in the one place that is both a client and only
 * ever mounted inside the shell.
 */
export function ConciergeComposer() {
  const { focusToken } = useComposer();

  return <WorkspaceComposer navigateOnSubmit focusToken={focusToken} />;
}
