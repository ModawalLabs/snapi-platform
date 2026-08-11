"use client";

import * as React from "react";

/**
 * True only after hydration completes.
 *
 * Needed by any component whose correct output depends on browser-only state
 * (resolved theme, viewport, `localStorage`). Rendering that state during SSR
 * produces a hydration mismatch, so those components render a neutral
 * placeholder until this flips.
 *
 * Implemented with `useSyncExternalStore` rather than the older
 * `useState(false)` + `useEffect(() => setMounted(true))` pattern: that version
 * sets state inside an effect, which triggers a second render pass and is now
 * flagged by React's `set-state-in-effect` rule. This does it in one pass.
 */
export function useIsHydrated(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

/** The value never changes after hydration, so there is nothing to subscribe to. */
function emptySubscribe() {
  return () => {};
}
