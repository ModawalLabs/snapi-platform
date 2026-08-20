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
  "transition-[background-color,border-color,color,translate,scale,box-shadow] duration-200",
  "hover:-translate-y-0.5 hover:border-[oklch(0%_0_0/0.2)] hover:bg-[oklch(0%_0_0/0.06)] hover:text-content",
  "hover:shadow-[0_6px_14px_oklch(0%_0_0/0.1)]",
  "dark:hover:border-white/28 dark:hover:bg-white/14 dark:hover:text-white",
  "dark:hover:shadow-[0_6px_14px_oklch(0%_0_0/0.25)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

/**
 * Round icon control inside a composer — the mic and the attach button.
 *
 * Deliberately `PILL`'s material rather than a new one. They sit in the same row
 * as the category pills, at the same height, and anything that looked different
 * there would read as a different *kind* of thing when in fact all of them are
 * secondary controls on one strip. The only difference is the shape: fully round,
 * because these carry a glyph and a circle is what a glyph wants.
 *
 * ## The glyphs are gold, the chrome is not
 *
 * Colour on the icon only — the well and its border stay the neutral pill material.
 * Tinting the fill as well would make two more gold circles beside the gold send
 * button, and the row's hierarchy depends on Send being the only filled thing in it.
 *
 * `text-gold` rather than a literal, so this follows the flavour: the token repoints
 * to azure under All Rounder, and the glyphs change with everything else instead of
 * staying amber on a blue page. Both themes have their own value for it — deep amber
 * on the light frost, bright gold on the dark glass — which is exactly why this is a
 * token and not a hex.
 */
export const ICON_BUTTON = cn(
  "grid shrink-0 place-items-center rounded-full border backdrop-blur-md",
  "border-[oklch(0%_0_0/0.1)] bg-[oklch(0%_0_0/0.035)] text-gold",
  "dark:border-white/12 dark:bg-white/[0.06]",
  "transition-[background-color,border-color,color,translate,scale,box-shadow] duration-200",
  // Hover deepens the glyph and warms the border rather than dropping to ink. A gold
  // control that turns grey under the cursor reads as being switched off by the very
  // gesture that was meant to reach for it.
  "hover:-translate-y-0.5 hover:border-gold-border hover:bg-[oklch(0%_0_0/0.06)] hover:text-gold-hover",
  "hover:shadow-[0_6px_14px_oklch(0%_0_0/0.1)]",
  "dark:hover:border-white/28 dark:hover:bg-white/14",
  "dark:hover:shadow-[0_6px_14px_oklch(0%_0_0/0.25)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

/**
 * Send button, shared shape.
 *
 * Split from its two states so the geometry is stated once: whether or not there is
 * anything to send, it is the same circle in the same place. It used to fade out
 * entirely when the field was empty, which meant the primary action of the whole
 * composer appeared on the first keystroke — nothing on screen said what would
 * happen when you finished typing.
 */
const SEND_BASE = cn(
  "grid shrink-0 place-items-center rounded-full",
  "transition-[background-color,box-shadow,scale,color] duration-200",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

/**
 * Ready to send. The gold gradient and dark glyph read correctly on both grounds,
 * so this is the one layer that needs no theme variant.
 */
export const SEND_BUTTON = cn(
  SEND_BASE,
  "bg-[linear-gradient(135deg,oklch(93%_0.07_92),oklch(80%_0.13_85)_55%,oklch(66%_0.12_78))]",
  "shadow-[0_0_16px_3px_oklch(80%_0.13_85/0.45),0_2px_6px_oklch(0%_0_0/0.3)]",
  "text-[oklch(20%_0.02_70)]",
  "hover:scale-[1.06] hover:shadow-[0_0_22px_5px_oklch(80%_0.13_85/0.65),0_2px_8px_oklch(0%_0_0/0.35)]",
);

/**
 * Nothing to send yet.
 *
 * A flat well with a dimmed glyph: present, clearly the same control, and clearly not
 * armed. No glow and no hover response — the whole point is that it does not invite
 * the click, and a button that lifts under the cursor while refusing to act is worse
 * than one that sits still.
 *
 * This *is* rendered `disabled`, so it drops out of the tab order and announces itself
 * as unavailable rather than being a trap that silently swallows Enter.
 */
export const SEND_BUTTON_IDLE = cn(
  SEND_BASE,
  "bg-[oklch(0%_0_0/0.05)] ring-1 ring-[oklch(0%_0_0/0.09)] ring-inset",
  "text-content-subtle",
  "dark:bg-white/[0.07] dark:text-white/40 dark:ring-white/12",
  "cursor-not-allowed",
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
