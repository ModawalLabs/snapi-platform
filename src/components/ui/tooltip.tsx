import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Hover/focus label for icon-only controls — needed by the collapsed sidebar
 * rail, where the text label is gone.
 *
 * Deliberately CSS-only (no Radix, no portal, no JS positioning):
 *
 *  - The trigger already carries the real accessible name via `aria-label`, so
 *    this element is `aria-hidden` decoration. Screen readers get the name from
 *    the button; sighted mouse users get it from here. Nothing is announced twice.
 *  - It reacts to `group-focus-visible` as well as `group-hover`, so keyboard
 *    users tabbing the rail see the same labels.
 *
 * Requires the trigger to be `relative` + `group`. Because it escapes the
 * sidebar's bounds, the sidebar must not clip overflow on the x-axis.
 */
export function Tooltip({
  label,
  className,
  shortcut,
}: {
  label: string;
  className?: string;
  /** Rendered dimmed on the right, e.g. "⌘K". */
  shortcut?: string;
}) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1/2 left-[calc(100%+0.625rem)] z-50 -translate-y-1/2",
        "flex items-center gap-2 rounded-md border border-border bg-overlay text-content shadow-premium",
        "px-2.5 py-1.5 text-xs font-medium whitespace-nowrap",
        // Slight inward offset on the hidden state gives the reveal direction.
        "-translate-x-1 opacity-0 transition-[opacity,transform] duration-150 ease-out",
        "group-hover:translate-x-0 group-hover:opacity-100",
        "group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
        className,
      )}
    >
      {label}
      {shortcut ? (
        <kbd className="rounded border border-border px-1 font-sans text-[10px] text-content-subtle">
          {shortcut}
        </kbd>
      ) : null}
    </span>
  );
}
