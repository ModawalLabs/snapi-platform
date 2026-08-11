import { cn } from "@/lib/utils";

/**
 * The composer's material, shared by every surface that renders one.
 *
 * These are the marketing hero's values, layer for layer — the rotating conic
 * sweep read through 1.5px of padding, a 28px/180% glass panel with a lit top edge
 * and a shaded bottom one, and a two-radius bloom that steps up on hover and again
 * on focus. Reproducing that by eye a second time is how two chat boxes end up
 * *almost* matching, which reads worse than either alone.
 *
 * ## Two glass materials, not one recoloured
 *
 * The hero's card is white-alpha over a dark video. Those exact values on a light
 * ground are an invisible box with invisible text, so there is a genuine light
 * variant — and the two differ in kind, not merely in value:
 *
 *  - **Dark** uses the hero's numbers verbatim: a white film for the fill, white
 *    inset edges top *and* bottom, a deep black drop shadow.
 *  - **Light** inverts part of that logic. The fill becomes a white frost and the
 *    top edge stays a white specular highlight, but the bottom inset flips to
 *    *black*. On a pale panel a white bottom edge is invisible, and the illusion
 *    of thickness depends entirely on that lower shade. The bloom also runs at
 *    roughly 1.5× alpha, because gold spreading onto cream carries far less than
 *    the same gold on near-black.
 *
 * Light is the unprefixed base and `dark:` carries the hero's values, so the
 * faithful reproduction reads as authored rather than as an override.
 *
 * No `"use client"` here: these are strings, and a client-only module would stop a
 * Server Component from ever importing them.
 */

/* Bloom, at two radii so it reads as light leaving a surface rather than a
 * coloured outline.
 *
 * The values live in `--composer-bloom*` rather than here, because they vary
 * along two axes at once: theme (light runs ~1.75x the dark alphas, since accent
 * light spreading onto cream carries far less than the same light on near-black)
 * and flavour (gold in Signature, azure in All Rounder). Four combinations of
 * whole shadow values is not something a class list expresses without becoming a
 * matrix of `dark:` and `[data-flavour]` variants; CSS resolves it in one lookup.
 *
 * This was the last hardcoded gold in the app — the halo stayed warm around an
 * otherwise azure chat box, which is precisely the kind of leftover that reads as
 * a bug rather than a choice. */
export const BLOOM = "shadow-[var(--composer-bloom)]";

export const BLOOM_HOVER = "hover:shadow-[var(--composer-bloom-hover)]";

export const BLOOM_FOCUS = "focus-within:shadow-[var(--composer-bloom-focus)]";
/* The pane. Note the bottom inset flipping sign between themes.
 *
 * The light fill is 0.88, not the hero's 0.72. The hero's card sits on a dark
 * video and the app's used to sit in a tinted well; both gave the glass something
 * uniform to be translucent *against*. Docked over a live page it is translucent
 * against whatever happens to be underneath — and at 0.72 the rotating sweep
 * beneath the panel blooms straight through, reading as a gold stain across half
 * the card rather than as a lit edge. Dark needs no such correction: its fill is
 * already 0.86 and the sweep is dim against near-black. */
export const PANEL = cn(
  "bg-[oklch(100%_0_0/0.88)] dark:bg-[oklch(15%_0.007_60/0.86)]",
  "backdrop-blur-[28px] backdrop-saturate-[1.8]",
  "shadow-[0_4px_24px_oklch(0%_0_0/0.07),inset_0_1px_0_oklch(100%_0_0/0.9),inset_0_-1px_0_oklch(0%_0_0/0.05)]",
  "dark:shadow-[0_4px_24px_oklch(0%_0_0/0.25),inset_0_1px_0_oklch(100%_0_0/0.10),inset_0_-1px_0_oklch(100%_0_0/0.04)]",
);

export const PILL = cn(
  "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap backdrop-blur-md",
  "border-[oklch(0%_0_0/0.1)] bg-[oklch(0%_0_0/0.035)] text-content-muted",
  "dark:border-white/12 dark:bg-white/[0.06] dark:text-white/75",
  "transition-[background-color,border-color,color,transform,box-shadow] duration-200",
  "hover:-translate-y-0.5 hover:border-[oklch(0%_0_0/0.2)] hover:bg-[oklch(0%_0_0/0.06)] hover:text-content",
  "hover:shadow-[0_6px_14px_oklch(0%_0_0/0.1)]",
  "dark:hover:border-white/28 dark:hover:bg-white/14 dark:hover:text-white",
  "dark:hover:shadow-[0_6px_14px_oklch(0%_0_0/0.25)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

/**
 * Send button. The gold gradient and dark glyph read correctly on both grounds,
 * so this is the one layer that needs no theme variant.
 */
export const SEND_BUTTON = cn(
  "grid shrink-0 place-items-center rounded-full",
  "bg-[linear-gradient(135deg,oklch(93%_0.07_92),oklch(80%_0.13_85)_55%,oklch(66%_0.12_78))]",
  "shadow-[0_0_16px_3px_oklch(80%_0.13_85/0.45),0_2px_6px_oklch(0%_0_0/0.3)]",
  "transition-[opacity,transform,box-shadow] duration-200",
  "hover:scale-[1.06] hover:shadow-[0_0_22px_5px_oklch(80%_0.13_85/0.65),0_2px_8px_oklch(0%_0_0/0.35)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

/** Typewriter cadence, in ms. */
export const TYPE_MS = 45;
export const DELETE_MS = 22;
export const HOLD_MS = 1600;
export const BETWEEN_MS = 300;

/**
 * Size a field to its content, letting CSS `max-height` do the capping.
 *
 * Deliberately does NOT clamp in JS. Setting `height` past the CSS cap is harmless
 * — `max-height` wins for layout and `overflow-y: auto` takes over — so the cap
 * lives in one place, in the class list. Clamping here as well would mean two
 * sources of truth that silently disagree the moment the viewport is short.
 *
 * The `height = "auto"` first is required: `scrollHeight` on an element that
 * already has an explicit height reports that height, never the content's, so
 * without it the field can grow but never shrink back.
 */
export function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}
