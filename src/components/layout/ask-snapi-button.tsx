"use client";

import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { useComposer } from "@/components/layout/composer-provider";
import { dockBelongsOn } from "@/components/layout/dock-scope";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * The control that summons the composer, at the top of the sidebar.
 *
 * Above Home rather than in the nav list, and deliberately not shaped like the
 * rows beneath it. Those are destinations; this is the product's one action, and
 * a button that looks like a fifth nav item is a button nobody presses.
 *
 * ## The material is the composer's, not a new one
 *
 * Same glass, same border, and the glow is literally `--composer-bloom` — the
 * tokens the chat box itself uses. Two consequences worth having: the button
 * reads as *that card, folded up*, which is what it is; and it follows the
 * flavour switch for free, glowing gold in Signature and azure in All Rounder
 * without a branch here.
 *
 * ## The pulse stops once it has worked
 *
 * It breathes only while the composer is closed. A control that keeps pulsing
 * after you have pressed it is not drawing attention any more, it is nagging —
 * and with the card open the button's job has changed from "come here" to
 * "press again to dismiss", which is not a job that wants a halo.
 *
 * `motion-reduce` swaps the animation for the resting bloom rather than dropping
 * the glow, so the button is no less visible for anyone who has asked the OS to
 * stop things moving.
 */
export function AskSnapiButton({ collapsed }: { collapsed: boolean }) {
  const { open, toggleComposer, requestFocus } = useComposer();
  const pathname = usePathname();

  // On the Concierge there is no dock to toggle — that page owns the composer. The
  // button still has a job there: put the cursor in it. Which keeps it working
  // everywhere rather than becoming a control that silently does nothing on one
  // route, and avoids the alternative of hiding it and reflowing the whole rail.
  const hasDock = dockBelongsOn(pathname);
  const active = hasDock && open;

  const material = cn(
    "group relative",
    // A solid accent fill, not glass. Glass over a translucent sidebar is glass on
    // glass: in light mode the two cancel and the button reads as a faint outline
    // of itself, which is the opposite of what the app's one action wants.
    //
    // `gold-solid` and `gold-content` are both repointed by the flavour block, so
    // this is gold in Signature and azure in All Rounder with no branch here — and
    // both pairs clear AA in both themes, which is why the fill can carry text at
    // all. `gold-solid` is the fill token precisely because `gold` is the *content*
    // one and would be a muddy bronze as a background.
    "bg-gold-solid text-gold-content hover:bg-gold-solid-hover",
    // The pulse owns `box-shadow` outright, so the resting bloom is expressed as
    // the animation's own trough rather than as a second utility that would be
    // overridden anyway.
    active
      ? "shadow-[var(--shadow-edge),var(--composer-bloom)]"
      : "animate-ask-glow motion-reduce:animate-none motion-reduce:shadow-[var(--shadow-edge),var(--composer-bloom)]",
    "hover:shadow-[var(--shadow-edge),var(--composer-bloom-hover)]",
    "transition-[background-color,box-shadow,scale] duration-300",
    "active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  );

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={hasDock ? toggleComposer : requestFocus}
        aria-label="Ask Snapi"
        aria-expanded={hasDock ? active : undefined}
        className={cn(material, "grid size-10 place-items-center rounded-xl")}
      >
        <Sparkles className="size-[18px]" aria-hidden="true" />
        <Tooltip label="Ask Snapi" shortcut="/" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={hasDock ? toggleComposer : requestFocus}
      aria-expanded={hasDock ? active : undefined}
      className={cn(material, "flex h-11 w-full items-center gap-2.5 rounded-xl px-3.5 text-left")}
    >
      <Sparkles className="size-4 shrink-0" aria-hidden="true" />

      <span className="flex-1 truncate text-sm font-semibold">Ask Snapi</span>

      {/* The same chip the composer's own header carries, so the shortcut is
          advertised in both places the field can be reached from. Dimmed rather
          than hidden while open — the key still works, it just no longer needs to
          announce itself. */}
      <kbd
        aria-hidden="true"
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded border font-sans text-[10px] font-semibold",
          // Drawn out of the fill's own ink rather than in neutral greys: on a
          // saturated ground a grey chip reads as a hole punched in the button.
          "border-current/25 bg-current/10 text-current/70",
          "transition-opacity duration-300",
          active && "opacity-40",
        )}
      >
        /
      </kbd>
    </button>
  );
}
