"use client";

import { useFlavour } from "@/components/providers/flavour-provider";
import { FLAVOUR_COPY } from "@/config/flavour";
import { cn } from "@/lib/utils";

/**
 * The active edition, as a pill.
 *
 * Reads the flavour itself rather than taking it as a prop: it is only ever used to
 * say which edition is on, and a caller that had to fetch the context to pass it
 * through would be two components knowing about the same thing for no gain.
 *
 * Gold tokens on purpose — under All Rounder every one of them *is* azure, so the
 * pill follows the edition it names without a branch. That is the flavour system
 * working, not a shortcut around it.
 */
export function PlanBadge({ className }: { className?: string }) {
  const { flavour } = useFlavour();

  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-1.5 py-px text-[10px] font-semibold tracking-wide",
        "border-gold-border bg-gold-subtle text-gold",
        className,
      )}
    >
      {FLAVOUR_COPY[flavour].label.toUpperCase()}
    </span>
  );
}
