"use client";

import type * as React from "react";

import { Composer } from "@/components/layout/composer";
import { useComposer } from "@/components/layout/composer-provider";
import { useSidebar } from "@/components/layout/sidebar-provider";
import { cn } from "@/lib/utils";

/**
 * The composer, docked to the bottom of every app page.
 *
 * It used to live at the foot of the sidebar, where it was 232px wide and
 * competing with a column of navigation for the same eye. Out here it is 576px
 * and the only thing at the bottom of the window.
 *
 * Summoned by `AskSnapiButton` at the top of the sidebar, or by `/` from
 * anywhere. Hidden until then, which is why that button glows: with the card
 * away, it is the only thing on screen saying the assistant is here.
 *
 * ## Centred on the content, not on the window
 *
 * The wrapper's left edge tracks the sidebar so the card centres over the page
 * rather than over the viewport — otherwise it sits visibly left of the content
 * it belongs to, and shifts sideways every time the rail collapses.
 *
 * That offset cannot be an inline style, because it only applies from `md` up:
 * below that the sidebar is an overlay with no width in the layout. So the value
 * goes into a custom property and a `md:` utility consumes it, which is the one
 * arrangement that gets both a runtime value and a media query. The transition
 * matches the rail's own 300ms so the two move together instead of the card
 * jumping to its new centre while the sidebar is still animating.
 *
 * ## Why a scrim
 *
 * Content scrolls *under* this card. Without a fade the page ends abruptly at a
 * hard edge halfway up a product image, which looks like a rendering fault; with
 * one it dissolves into the canvas and the card reads as floating above a page
 * that continues beneath it.
 *
 * The strip is `pointer-events-none` and only the card re-enables them — it spans
 * the full width, and a transparent full-width bar that eats clicks on whatever
 * is beside the composer is the classic way a docked control breaks a page.
 */
export function FloatingComposer() {
  const { collapsed } = useSidebar();
  const { open, openComposer, closeComposer } = useComposer();

  return (
    <div
      // Kept mounted and hidden rather than unmounted. Unmounting gives no exit
      // animation without a presence library, and it would discard whatever the
      // reader had half-typed the moment they dismissed the card.
      //
      // `inert` is what makes that safe: hidden, the card leaves the tab order
      // and the accessibility tree entirely. A transparent, translated-away
      // textarea that is still focusable is the classic way an off-screen panel
      // swallows a keyboard user.
      inert={!open}
      data-composer-open={open || undefined}
      style={
        {
          "--composer-inset": collapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)",
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40",
        // Under the mobile drawer and its scrim, both of which are z-50. A
        // composer floating over an open navigation drawer would be absurd.
        "md:left-[var(--composer-inset)]",
        "transition-[left,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        // Leaves downward rather than merely fading: the card belongs to the
        // bottom edge, so that is the direction it should look like it went.
        open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
    >
      {/* Taller than the card so the fade starts well above it. `to-transparent`
          at the top rather than a fixed height of solid colour: a hard band of
          canvas across the page reads as a footer, a gradient reads as depth. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t from-canvas via-canvas/90 to-transparent"
      />

      <div className="relative flex justify-center px-4 pb-4 sm:px-6 sm:pb-6">
        {/* 36rem — roughly 2.5× the 232px it had in the sidebar, and capped so it
            stops growing on a wide monitor. A composer that tracks the window
            ends up a 1200px-wide text field, which is unusable as a measure and
            reads as a footer bar rather than as a card. */}
        <div className="pointer-events-auto w-[min(36rem,100%)]">
          <Composer active={open} onRequestOpen={openComposer} onDismiss={closeComposer} />
        </div>
      </div>
    </div>
  );
}
