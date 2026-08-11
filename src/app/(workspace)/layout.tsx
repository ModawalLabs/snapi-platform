import type * as React from "react";

/**
 * Full-screen workspace shell.
 *
 * A route group *outside* `(app)`, so these routes never mount the sidebar. That
 * is the whole reason it exists: a full-screen page that renders the sidebar and
 * then covers it would still pay for it, still let a Tab key walk into it, and
 * still announce it to a screen reader.
 *
 * Deliberately thin — no ambient wash, no container. The workspace owns the whole
 * viewport and manages its own scroll regions; anything imposed here would fight it.
 */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
