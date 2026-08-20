import Image from "next/image";
import Link from "next/link";

import { routes } from "@/config/routes";
import type { MockBrand } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * A maison, as a plate: the mark over the name.
 *
 * There is no photography, no copy, and no founding year — Snapi has a logo and a
 * name, and a page that pretends otherwise would be filled with invented text.
 * What makes a directory of marks read as premium is not more information but
 * more room: a large square for the mark, a lot of air around it, and one small
 * line of type. That is a lookbook contact sheet, and it is a finished-looking
 * thing rather than a card missing its description.
 *
 * Centred rather than a left-aligned row. With two elements and nothing to
 * left-align *to*, an axis through the middle is what holds forty of these
 * together as a grid.
 */
export function BrandPlate({ brand }: { brand: MockBrand }) {
  return (
    <Link
      href={routes.brand(brand.slug)}
      className={cn(
        "group flex h-full flex-col items-center justify-center gap-4 rounded-lg border border-border bg-surface/50 px-3 py-7",
        "transition-[background-color,border-color,box-shadow,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-0.5 hover:border-gold-border hover:bg-surface hover:shadow-premium-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      {/* Two visually distinct states, not one box with different contents.
       *
       * A real logo asset is artwork on its own white ground, so the slot goes
       * white and the artwork fills it — brand colours then render correctly and
       * identically in both themes, which is what brand guidelines require. Never
       * `dark:invert` a trademark to make it fit a dark UI.
       *
       * The monogram is our typography, not the maison's, so it uses theme
       * surfaces and the display serif. */}
      <span
        className={cn(
          "relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-md border transition-colors duration-500",
          brand.logo
            ? "border-border/60 bg-white p-2 group-hover:border-gold-border"
            : "border-border bg-surface-raised group-hover:border-gold-border",
        )}
      >
        {brand.logo ? (
          // `fill` rather than hardcoded dimensions: they come from the static
          // import, so a replacement asset of any size just works. `contain`
          // because a cropped logo is a brand-guideline violation.
          <Image src={brand.logo} alt="" fill sizes="64px" className="object-contain p-2" />
        ) : (
          <span
            aria-hidden="true"
            className="font-display text-xl leading-none font-normal tracking-[0.04em] text-content-muted transition-colors duration-500 group-hover:text-gold"
          >
            {brand.monogram}
          </span>
        )}
      </span>

      {/* Balanced rather than truncated: "Brunello Cucinelli" needs two lines at
          this width, and clipping a maison's name is worse than letting the plate
          be a few pixels taller. `items-stretch` on the grid keeps them level. */}
      <span className="text-center text-[13px] leading-snug font-semibold text-balance text-content transition-colors duration-300 group-hover:text-gold">
        {brand.name}
      </span>
    </Link>
  );
}
