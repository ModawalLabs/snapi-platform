"use client";

import * as React from "react";

/**
 * Whether the docked composer is on screen, and what it is asking for.
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

/** What the field says when nothing has been typed and no page has asked for more. */
export const DEFAULT_PLACEHOLDER = "Ask Snapi anything…";

/**
 * Three states, not two booleans.
 *
 * The dock can be shut, opened by the reader, or opened *on a page's behalf* — and the
 * third has to be distinguishable from the second, because only what a page put there
 * should be taken away again when that page leaves. Two flags (`open` plus
 * `openedAutomatically`) would encode the same thing while permitting the pair
 * `closed + automatic`, which means nothing, and would need both to be written together
 * every time either changed.
 *
 * One value also keeps every updater pure. `summon` has to mean "open it *unless it is
 * already open*", which as two flags reads the current value to decide what to write —
 * and an updater that branches on state it read from a closure is the bug this codebase
 * has already hit once (see `removeFromComparison`). As a single machine it is a total
 * function of the previous state: `closed → summoned`, and anything else is left alone.
 */
type DockState = "closed" | "open" | "summoned";

interface ComposerContextValue {
  open: boolean;
  openComposer: () => void;
  closeComposer: () => void;
  toggleComposer: () => void;
  /**
   * Opens the dock for a page that has something to say, and does nothing at all if
   * the reader already has it open — see `useComposerPrompt`, which is the only thing
   * that should call this.
   */
  summonComposer: () => void;
  /** Releases a summons. Closes the dock only if the summons is what opened it. */
  releaseComposer: () => void;
  /** The field's placeholder: whatever a page has asked for, or the standing one. */
  placeholder: string;
  setPrompt: React.Dispatch<React.SetStateAction<string | null>>;
  /** True while a page is supplying the placeholder. */
  prompted: boolean;
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
  const [state, setState] = React.useState<DockState>("closed");
  const [prompt, setPrompt] = React.useState<string | null>(null);
  const [focusToken, setFocusToken] = React.useState(0);

  const open = state !== "closed";

  // The reader's own three actions. Each lands on a plain "open" or "closed": once a
  // person has touched the control it is theirs, and a page that summoned it earlier
  // has no business closing it on the way out.
  const openComposer = React.useCallback(() => setState("open"), []);
  const closeComposer = React.useCallback(() => setState("closed"), []);
  const toggleComposer = React.useCallback(
    () => setState((current) => (current === "closed" ? "open" : "closed")),
    [],
  );

  const summonComposer = React.useCallback(
    () => setState((current) => (current === "closed" ? "summoned" : current)),
    [],
  );
  const releaseComposer = React.useCallback(
    () => setState((current) => (current === "summoned" ? "closed" : current)),
    [],
  );

  const requestFocus = React.useCallback(() => setFocusToken((token) => token + 1), []);

  // Escape dismisses it, the way it dismisses any transient surface. Bound only
  // while open, so it never competes with the sidebar drawer's own handler.
  //
  // It goes to "closed" rather than releasing the summons, because pressing Escape is
  // the reader saying no — a dock they dismissed should stay dismissed even if the
  // page that summoned it is still on screen.
  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setState("closed");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const value = React.useMemo(
    () => ({
      open,
      openComposer,
      closeComposer,
      toggleComposer,
      summonComposer,
      releaseComposer,
      placeholder: prompt ?? DEFAULT_PLACEHOLDER,
      setPrompt,
      prompted: prompt !== null,
      focusToken,
      requestFocus,
    }),
    [
      open,
      openComposer,
      closeComposer,
      toggleComposer,
      summonComposer,
      releaseComposer,
      prompt,
      focusToken,
      requestFocus,
    ],
  );

  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposer() {
  const context = React.useContext(ComposerContext);
  if (!context) throw new Error("useComposer must be used within <ComposerProvider>");
  return context;
}

/**
 * Lets a page put the composer on screen with something of its own to say.
 *
 * Pass the line the field should show, or `null` when the page has nothing to ask for.
 * While a line is supplied the dock is summoned and the field carries it; when the
 * value goes back to `null` — or, far more often, when the page unmounts because the
 * reader navigated — both are undone.
 *
 * ## What "undone" carefully does not mean
 *
 * It does not mean "close the composer". If the reader already had the dock open when
 * they arrived, `summonComposer` left it alone and `releaseComposer` leaves it alone
 * too: they opened it, it is theirs, and having it vanish because they wandered onto a
 * page that happens to use this hook would be the app taking something away that it
 * never gave. The same applies if they close it by hand while the page is still up —
 * the state is no longer `"summoned"`, so nothing reopens it and nothing re-closes it.
 * All of that lives in the state machine rather than here; see `DockState`.
 *
 * ## Why this is an effect
 *
 * Because it is not a render. "This page is showing an empty collection, so the way to
 * add to it should be on screen" is a fact about the world outside this component —
 * a panel two levels up the tree, put there for as long as the page lasts and taken
 * away when it ends. Setup and teardown bound to a component's lifetime is the exact
 * shape `useEffect` exists for, and the cleanup is not an afterthought here: it *is*
 * the "close it when they go somewhere else" half of the behaviour.
 */
export function useComposerPrompt(prompt: string | null) {
  const { summonComposer, releaseComposer, setPrompt } = useComposer();

  React.useEffect(() => {
    if (prompt === null) return;

    setPrompt(prompt);
    summonComposer();

    return () => {
      setPrompt(null);
      releaseComposer();
    };
  }, [prompt, summonComposer, releaseComposer, setPrompt]);
}
