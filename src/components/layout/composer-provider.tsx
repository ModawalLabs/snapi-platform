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
  /**
   * Increments each time something asks for the cursor.
   *
   * A counter rather than a boolean, because the request has no "off" state — the
   * same page can ask twice in a row and a flag flipped to `true` twice is one
   * event. Whoever owns a field watches this and focuses when it changes.
   *
   * It exists for the Concierge page, which renders its own composer and so has no
   * dock to open: the Ask Snapi button asks for focus there instead of toggling
   * something that is not on screen.
   */
  focusToken: number;
  requestFocus: () => void;
}

const ComposerContext = React.createContext<ComposerContextValue | null>(null);

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [focusToken, setFocusToken] = React.useState(0);

  const openComposer = React.useCallback(() => setOpen(true), []);
  const closeComposer = React.useCallback(() => setOpen(false), []);
  const toggleComposer = React.useCallback(() => setOpen((current) => !current), []);
  const requestFocus = React.useCallback(() => setFocusToken((token) => token + 1), []);

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
    () => ({ open, openComposer, closeComposer, toggleComposer, focusToken, requestFocus }),
    [open, openComposer, closeComposer, toggleComposer, focusToken, requestFocus],
  );

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposer() {
  const context = React.useContext(ComposerContext);
  if (!context) throw new Error("useComposer must be used within <ComposerProvider>");
  return context;
}
