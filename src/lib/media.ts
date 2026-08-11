import type { ImageSource } from "@/types/media";

/**
 * Shape arithmetic for laying out artwork of unknown dimensions.
 *
 * No `"use client"` — Server Components decide fit and sizing at render, which is
 * the whole point: the choice is made before any HTML is sent, so nothing shifts
 * once the image arrives.
 */

/**
 * Width ÷ height, read off a static import.
 *
 * A static import carries its intrinsic dimensions, so a local asset needs
 * nothing declared. A remote URL carries none — which is why every shape-aware
 * surface also accepts a declared ratio, and why the API contract must send
 * width and height alongside the image.
 */
function intrinsicRatio(src: ImageSource | null | undefined): number | null {
  if (!src || typeof src === "string") return null;
  if (!src.width || !src.height) return null;
  return src.width / src.height;
}

/** A declared ratio if there is one, else the artwork's own, else nothing. */
export function imageRatio(src: ImageSource | null | undefined, declared?: number): number | null {
  if (declared && declared > 0) return declared;
  return intrinsicRatio(src);
}

/**
 * The fraction of an image discarded by `object-fit: cover` into a given tile.
 *
 * Cover scales until both axes are filled, so the overflow is on one axis only:
 * a wider-than-tile image loses width, a taller one loses height. Either way the
 * survivor is `min ÷ max` of the two ratios, so the loss is one minus that.
 *
 *   4:5 into a square → 1 − 0.8   = 20% of the height gone
 *   3:1 into a square → 1 − 0.333 = 67% of the width gone
 */
function cropLoss(ratio: number, tileRatio: number): number {
  return 1 - Math.min(ratio, tileRatio) / Math.max(ratio, tileRatio);
}

/**
 * How to fit artwork into a fixed tile, decided from its shape alone.
 *
 * A grid constrains both axes, so an image's own proportions have nowhere to go
 * and something has to give — pixels, alignment, or space. In a results pane
 * alignment is the one worth protecting: these cards are read *across*, price
 * against price, and rows that do not line up turn scanning into work.
 *
 * So the tile never changes and the fit does. Anything close to the tile's shape
 * is cropped, because losing a sliver off a 4:5 is imperceptible and a filled
 * frame always looks better. Anything far outside it is contained instead —
 * taking two thirds off a banner is not a crop, it is a different photograph.
 *
 * Two fifths, which against a square tile puts the crop band at **3:5 to 5:3**.
 * That covers every ratio a camera or a product studio actually produces — 4:5,
 * 3:4, 2:3, 3:2 all crop and fill the frame. What falls outside is 16:9, 9:16,
 * 2:1 and wider: cinematic strips, banners, and full-length shots a square would
 * decapitate. Those contain.
 *
 * The exact figure matters more than it looks. A third was tried first and put
 * the boundary *on* 3:2, where floating point decided it — `1 - 1/1.5` evaluates
 * a hair above `1/3`, so an ordinary landscape product shot letterboxed itself.
 * A threshold has to sit in a gap between real ratios, not on top of one.
 *
 * An unknown ratio returns `"cover"`. That is the safe default — a filled tile is
 * never *wrong*, only occasionally over-cropped, whereas containing an image that
 * would have filled the frame leaves a permanent hole.
 */
const MAX_CROP_LOSS = 0.4;

export function fitForTile(ratio: number | null, tileRatio: number): "cover" | "contain" {
  if (!ratio) return "cover";
  return cropLoss(ratio, tileRatio) > MAX_CROP_LOSS ? "contain" : "cover";
}
