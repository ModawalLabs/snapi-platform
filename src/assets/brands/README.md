# Brand logos

Referenced by static import from `src/lib/mock-data.ts` and rendered by
`BrandTile` in `src/features/home/components/designer-worlds.tsx`.

## Present

| File | Brand | Wired to |
| --- | --- | --- |
| `gucci.png` | Gucci | `slug: gucci` |
| `louis-vuitton.png` | Louis Vuitton | `slug: louis-vuitton` |
| `versace.png` | Versace | `slug: versace` |

The other nine maisons render their authored monogram. That is a designed state,
not a placeholder gap — the grid is built to mix the two indefinitely.

## A logo only ever goes on its own brand

This is the one rule here. Editorial covers are decorative photography and can be
reassigned freely; a trademark is an assertion of identity. Gucci's mark beside
"Hermès" is a false statement about who sells what, it misleads customers, and
mock data reliably outlives the sprint it was written in.

If you want every tile filled for a layout review, supply the missing nine assets
rather than duplicating the three.

## Format

- **SVG is strongly preferred** — logos are vector artwork, and it removes the
  resolution question entirely.
- Failing that, PNG with transparency at **≥192 px** on the long edge. The slot is
  48 px CSS, so a 3× mobile screen wants 144 px. The current files are 75 × 69 and
  will look slightly soft on high-DPI displays; replace them when you can.
- Artwork supplied on its own **white ground** is fine and is what the current
  three are. `BrandTile` detects a logo and turns the slot white so the artwork
  sits flush, which also guarantees the mark reproduces in its correct colours in
  both light and dark themes.
- **Never `dark:invert` a logo** to make it work on a dark UI. Inverting a
  trademark's colours breaks every brand guideline that exists. Put it on a white
  chip instead, which is what we do.
- `object-contain`, never `cover` — a cropped logo is also a guideline violation.

## Naming

`<brand-slug>.png`, matching the `slug` in `mockBrands`. Unlike the editorial
covers, slug-naming is correct here: a logo is permanently bound to one brand, so
the filename can safely encode it.

## Source

Official brand asset kits, a press/media centre, or the merchant feed. Do not
scrape from web pages — resolution is unreliable and usage terms are usually not
met. Figma exports are fine, but rename them: `Frame 1261154440.png` tells the
next person nothing, and the space in the filename breaks shell tooling.
