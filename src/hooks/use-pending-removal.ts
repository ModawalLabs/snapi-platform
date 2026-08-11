"use client";

import * as React from "react";

/** How long the Undo window stays open. */
const DEFAULT_DELAY_MS = 6000;

/**
 * A collection with soft removal: an item is taken out of view immediately but
 * only dropped from the array once its Undo window closes.
 *
 * Keeping the item in `items` while it is pending is the whole point — the caller
 * can leave the row or tile mounted and overlay an Undo affordance on it, so the
 * layout does not collapse and then re-expand if the user changes their mind.
 * `visibleCount` is what to show the user, since a pending item is already gone as
 * far as they are concerned.
 *
 * `setItems` is exposed so callers can add items too (a create flow) without a
 * second source of truth for the same list.
 *
 * Shared by the Snapi List and Missions boards. It lives here rather than in
 * either feature because the timer semantics below are easy to get subtly wrong,
 * and two copies would drift.
 */
export function usePendingRemoval<T extends { id: string }>(
  initial: T[] | (() => T[]),
  delayMs: number = DEFAULT_DELAY_MS,
) {
  const [items, setItems] = React.useState<T[]>(initial);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = React.useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setPendingId(null);
  }, []);

  const requestRemove = React.useCallback(
    (id: string) => {
      // Removing a second item commits the first rather than cancelling its
      // timer. Only one Undo slot is shown at a time, so the alternative leaves
      // the earlier item in limbo — invisible, undeleted, and unreachable.
      if (timer.current) clearTimeout(timer.current);
      if (pendingId && pendingId !== id) commit(pendingId);

      setPendingId(id);
      timer.current = setTimeout(() => commit(id), delayMs);
    },
    [pendingId, commit, delayMs],
  );

  const undo = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setPendingId(null);
  }, []);

  // Clear a live timer on unmount so a pending commit cannot fire against a tree
  // that is no longer there.
  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return {
    items,
    setItems,
    pendingId,
    /** What to report to the user: excludes the item awaiting its Undo. */
    visibleCount: items.length - (pendingId ? 1 : 0),
    requestRemove,
    undo,
  };
}
