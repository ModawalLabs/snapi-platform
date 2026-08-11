import Image from "next/image";
import type * as React from "react";

import type { ImageSource } from "@/types/media";
import { cn } from "@/lib/utils";

/**
 * Aspect-ratio-reserved media box.
 *
 * Every card on the home page uses this, and the point is what happens *later*.
 * Three things are established now so that dropping real photography in is a
 * one-line change with no visual regression:
 *
 *  1. **The box holds its aspect ratio while empty.** Nothing reflows when
 *     images arrive — no layout shift, no CLS penalty.
 *  2. **The scrim already exists.** Titles sit on `.media-scrim`, so they are
 *     legible over an arbitrary photograph from day one. Adding a scrim after
 *     the fact always means re-tuning every card's type colour.
 *  3. **The empty state imitates a lit studio backdrop** rather than showing a
 *     grey rectangle, so the page reads as designed rather than unbuilt.
 *
 * Server Component — no `onError` fallback here on purpose. These are curated
 * editorial assets, not user uploads; if one 404s that is a content bug that
 * should be visible, not silently patched over.
 */
export function MediaFrame({
  src,
  alt,
  className,
  children,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  scrim = true,
  zoomOnHover = true,
  fit = "cover",
  focus,
}: {
  /**
   * A static import (preferred — see `src/assets/README.md`) or a remote URL.
   * Null renders the studio placeholder.
   */
  src?: ImageSource | null;
  /** Required when `src` is set. Empty string only for purely decorative art. */
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  sizes?: string;
  priority?: boolean;
  scrim?: boolean;
  /** Slow zoom on hover. Assumes an ancestor carries `group`. */
  zoomOnHover?: boolean;
  /**
   * `object-position` override, as a Tailwind class (e.g. `object-[50%_72%]`).
   *
   * Needed whenever a portrait source is cropped into a landscape card and the
   * subject is not centred — a centre crop of a low-framed shot silently removes
   * the thing the photo is of. Set this per image, not per card.
   */
  focus?: string;
  /**
   * How the artwork meets the frame.
   *
   * `"cover"` fills and crops — right whenever the image is near the frame's
   * shape. `"contain"` letterboxes it onto the studio plate instead, for artwork
   * far enough off that cropping would remove the product rather than trim it.
   *
   * Callers should not hardcode this per image. Derive it from the ratio with
   * `fitForTile` in `@/lib/media`, so a feed of unknown shapes resolves itself.
   */
  fit?: "cover" | "contain";
}) {
  const contained = fit === "contain";

  // Zooming a contained image would push it past the frame and clip the edges
  // the containment exists to protect. The hover ring below still fires, so the
  // card is not left without a hover state.
  const zooms = zoomOnHover && !contained;

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {/* The plate sits outside the zoom wrapper: it is the surface the product
          rests on, and a ground that moves with the thing standing on it reads as
          a sticker rather than a shelf. */}
      {contained && src ? (
        <div className="media-placeholder absolute inset-0" aria-hidden="true" />
      ) : null}

      <div
        className={cn(
          "absolute inset-0",
          // 700ms, not 200ms: a slow settle reads as expensive. Fast transforms
          // read as a web app.
          zooms &&
            "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]",
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt ?? ""}
            fill
            sizes={sizes}
            priority={priority}
            // Blur-up only when a `blurDataURL` actually exists — i.e. a static
            // import of a raster file. Passing placeholder="blur" for a remote
            // URL or an SVG import throws at render time, so this is a guard, not
            // an optimisation.
            placeholder={typeof src === "object" && src.blurDataURL ? "blur" : undefined}
            className={cn(
              contained
                ? // Inset so the artwork sits *on* the plate with a margin rather
                  // than butting against the frame's own edge.
                  "object-contain p-3 sm:p-4"
                : cn("object-cover", focus),
            )}
          />
        ) : (
          <div className="media-placeholder size-full" aria-hidden="true" />
        )}
      </div>

      {scrim ? <div className="media-scrim absolute inset-0" aria-hidden="true" /> : null}

      {/* Edge as an inset hairline rather than a `border-border` on the caller.
          These tiles are dark in both themes, so a light border token would ring
          them with a pale halo in light mode. An inset white/gold hairline reads
          as the edge of a print in both. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/10 transition-[box-shadow] duration-500 ring-inset group-hover:ring-gold/45"
      />

      {children}
    </div>
  );
}
