import Image from "next/image";
import Link from "next/link";

import { Section, SectionHeader } from "@/components/ui/section-header";
import { routes } from "@/config/routes";
import { getFlavourCopy } from "@/lib/flavour-server";
import { mockBrands, type MockBrand } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * "Explore Designer Worlds" — the maisons Snapi carries.
 *
 * Logo beside the name, as specified. Two decisions worth recording:
 *
 *  - **The logo slot is fixed-size and the monogram fills it.** Brand marks
 *    arrive at wildly different aspect ratios (Hermès is tall, Balenciaga is a
 *    wide wordmark). A fixed square with `object-contain` and consistent padding
 *    means no single logo can blow out the row height when real assets land.
 *  - **Monograms are authored in the data, not derived.** "Louis Vuitton" → "LV"
 *    is not something a slicing rule gets right across every maison.
 *
 * A wrapping grid rather than a scroll row: with a dozen-plus brands, users scan
 * for a specific name, and horizontal scrolling hides most of the list.
 */
export async function DesignerWorlds() {
  const copy = await getFlavourCopy();

  return (
    <Section id="designer-worlds">
      <SectionHeader
        id="designer-worlds"
        eyebrow={copy.brandsEyebrow}
        title={copy.brands}
        description={copy.brandsDescription}
        action={{ label: "All brands", href: routes.brands() }}
      />

      {/* A taste, not the directory. `mockBrands` is the full register that
          `/brands` renders A–Z; twelve is what this section was designed around,
          and the slice is what stops it growing a sixth row as maisons are added.
          "All brands" above is the way to the rest. */}
      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {mockBrands.slice(0, 12).map((brand) => (
          <li key={brand.id}>
            <BrandTile brand={brand} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function BrandTile({ brand }: { brand: MockBrand }) {
  return (
    <Link
      href={routes.brand(brand.slug)}
      className="group flex items-center gap-4 rounded-lg border border-border bg-surface/60 p-3.5 transition-[background-color,border-color,box-shadow,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-gold-border hover:bg-surface hover:shadow-premium-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {/* Two visually distinct states, not one box with different contents.
       *
       * A real logo asset is supplied as artwork on its own white ground, so the
       * slot goes white and the artwork fills it — brand colours then render
       * correctly and identically in both themes, which is what brand guidelines
       * require. Never `dark:invert` a trademark to make it fit a dark UI.
       *
       * The monogram fallback instead uses theme surfaces, because it is our
       * typography, not the maison's. */}
      <span
        className={cn(
          "relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-md border transition-colors duration-500",
          brand.logo
            ? "border-border/60 bg-white group-hover:border-gold-border"
            : "border-border bg-surface-raised group-hover:border-gold-border",
        )}
      >
        {brand.logo ? (
          // `fill` rather than hardcoded width/height: dimensions come from the
          // static import, so a replacement asset of any size just works.
          // `contain` because a cropped logo is a brand-guideline violation.
          <Image src={brand.logo} alt="" fill sizes="48px" className="object-contain" />
        ) : (
          <span
            aria-hidden="true"
            className="text-sm font-semibold tracking-[0.08em] text-content-muted transition-colors duration-500 group-hover:text-gold"
          >
            {brand.monogram}
          </span>
        )}
      </span>

      {/* Name only. `origin` is still carried in the data — a maison's house and
          founding year belong on its own page — it is simply not shown here. */}
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-content">
        {brand.name}
      </span>
    </Link>
  );
}
