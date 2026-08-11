"use client";

import * as React from "react";

/**
 * Whether the docked composer is on screen.
 *
 * Lives in a context because the two halves are nowhere near each other in the
 * tree: the control that opens it is at the top of the sidebar, and the card
 * itself is a sibling of the whole shell. Lifting the state to the layout is not
 * an option — that is a Server Component, and this is a click.
 *
 * Separate from `SidebarProvider` on purpose. Collapsing the rail and summoning
 * the assistant are unrelated intents, and folding one into the other is how a
 * context ends up as a bag of every boolean the shell happens to need.
 */
interface ComposerContextValue {
  open: boolean;
  openComposer: () => void;
  closeComposer: () => void;
  toggleComposer: () => void;
}

const ComposerContext = React.createContext<ComposerContextValue | null>(null);

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const openComposer = React.useCallback(() => setOpen(true), []);
  const closeComposer = React.useCallback(() => setOpen(false), []);
  const toggleComposer = React.useCallback(() => setOpen((current) => !current), []);

  // Escape dismisses it, the way it dismisses any transient surface. Bound only
  // while open, so it never competes with the sidebar drawer's own handler.
  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const value = React.useMemo(
    () => ({ open, openComposer, closeComposer, toggleComposer }),
    [open, openComposer, closeComposer, toggleComposer],
  );

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposer() {
  const context = React.useContext(ComposerContext);
  if (!context) throw new Error("useComposer must be used within <ComposerProvider>");
  return context;
}
