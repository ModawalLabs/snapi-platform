"use client";

import { Sparkles } from "lucide-react";

import { useComposer } from "@/components/layout/composer-provider";
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
  const { open, toggleComposer } = useComposer();

  const material = cn(
    "group relative border border-gold-border",
    "bg-[oklch(100%_0_0/0.72)] dark:bg-[oklch(15%_0.007_60/0.86)]",
    "backdrop-blur-xl backdrop-saturate-150",
    // The pulse owns `box-shadow` outright, so the resting bloom is expressed as
    // the animation's own trough rather than as a second utility that would be
    // overridden anyway.
    open
      ? "shadow-[var(--shadow-edge),var(--composer-bloom)]"
      : "animate-ask-glow motion-reduce:animate-none motion-reduce:shadow-[var(--shadow-edge),var(--composer-bloom)]",
    "hover:shadow-[var(--shadow-edge),var(--composer-bloom-hover)]",
    "transition-[background-color,border-color,box-shadow,transform] duration-300",
    "hover:border-gold-solid active:scale-[0.98]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  );

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleComposer}
        aria-label="Ask Snapi"
        aria-expanded={open}
        className={cn(material, "grid size-10 place-items-center rounded-xl")}
      >
        <Sparkles className="size-[18px] text-gold" aria-hidden="true" />
        <Tooltip label="Ask Snapi" shortcut="/" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleComposer}
      aria-expanded={open}
      className={cn(material, "flex h-11 w-full items-center gap-2.5 rounded-xl px-3.5 text-left")}
    >
      <Sparkles className="size-4 shrink-0 text-gold" aria-hidden="true" />

      <span className="flex-1 truncate text-sm font-semibold text-content">Ask Snapi</span>

      {/* The same chip the composer's own header carries, so the shortcut is
          advertised in both places the field can be reached from. Dimmed rather
          than hidden while open — the key still works, it just no longer needs to
          announce itself. */}
      <kbd
        aria-hidden="true"
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded border font-sans text-[10px] font-semibold",
          "border-[oklch(0%_0_0/0.12)] bg-[oklch(0%_0_0/0.04)] text-content-subtle",
          "dark:border-white/15 dark:bg-white/[0.07] dark:text-white/55",
          "transition-opacity duration-300",
          open && "opacity-40",
        )}
      >
        /
      </kbd>
    </button>
  );
}
