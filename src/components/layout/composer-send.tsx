import { SEND_BUTTON, SEND_BUTTON_IDLE } from "@/components/layout/composer-styles";
import { cn } from "@/lib/utils";

/**
 * The send button, shared by both composers.
 *
 * ## Always there, dimmed until it can do something
 *
 * It used to be mounted but transparent — `opacity-0` until the first character —
 * which made the composer's primary action materialise out of nowhere as you typed.
 * Now it is drawn in both states and only its treatment changes: a flat well while the
 * field is empty, the gold gradient once there is something to send. The circle never
 * moves, so nothing in the row shifts on the first keystroke.
 *
 * `disabled` does the real work. It keeps the button out of the tab order, announces
 * itself to a screen reader, and blocks the click — so the dimming is a *description*
 * of state rather than the mechanism enforcing it.
 *
 * ## Sizes are numbers, not a variant name
 *
 * The docked composer is 34px and the workspace one 38px, a 4px difference that no
 * `"sm" | "md"` pair would explain. Passing the pixel value keeps the two callers
 * honest about the only thing that differs between them.
 *
 * `stopPropagation` because the whole card focuses the field on click — without it,
 * submitting would also drop the caret back into a field that is being cleared.
 */
export function SendButton({
  canSend,
  size,
  glyph,
}: {
  canSend: boolean;
  /** Diameter in px. */
  size: number;
  /** Arrow size in px. */
  glyph: number;
}) {
  return (
    <button
      type="submit"
      aria-label="Send"
      disabled={!canSend}
      onClick={(event) => event.stopPropagation()}
      className={cn(canSend ? SEND_BUTTON : SEND_BUTTON_IDLE)}
      style={{ width: size, height: size }}
    >
      {/* `currentColor`, so the one glyph serves both states — the dark ink on gold
          and the dimmed arrow on the flat well are the same SVG under two text
          colours, rather than two nearly-identical arrows to keep in step. */}
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  );
}
