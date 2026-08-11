import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { MediaFrame } from "@/components/ui/media-frame";
import { Section, SectionHeader } from "@/components/ui/section-header";
import { routes } from "@/config/routes";
import { getFlavourCopy } from "@/lib/flavour-server";
import { mockCollections } from "@/lib/mock-data";

/**
 * "More For You" — merchandising entry points.
 *
 * Uniform 4:5 cards, unlike The Edit's bento. That contrast is deliberate: these
 * are peers (no collection is more important than another), and reusing the
 * asymmetric layout twice on one page would make the editorial section stop
 * feeling special.
 */
export async function MoreForYou() {
  const copy = await getFlavourCopy();

  return (
    <Section id="more-for-you">
      <SectionHeader
        id="more-for-you"
        eyebrow={copy.picksEyebrow}
        title={copy.picks}
        description={copy.picksDescription}
      />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockCollections.map((collection) => (
          <li key={collection.id} className="group">
            <Link
              href={routes.collection(collection.slug)}
              className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {/* `scrim={false}` — nothing sits on the image any more, and the
                  scrim existed only to keep overlaid type legible. Dropping it
                  lets the photography read at full contrast, which is the point of
                  moving the caption out. Matches The Edit. */}
              <MediaFrame
                src={collection.image}
                alt=""
                focus={collection.focus}
                scrim={false}
                sizes="(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 100vw"
                // Landscape on phones, portrait from `sm` up. At full width a 4:5
                // tile is ~470px tall, so four of them turn this section into
                // 1900px of scrolling on a 390px screen.
                className="aspect-[16/10] rounded-lg shadow-premium-sm sm:aspect-[4/5]"
              />

              {/* Caption, below the image. Theme tokens rather than white-alpha —
                  this text now sits on the canvas, not on a photograph. */}
              <div className="mt-3">
                <h3 className="flex items-center gap-1.5 leading-tight font-semibold text-balance text-content transition-colors duration-300 group-hover:text-gold">
                  {collection.title}
                  <ArrowUpRight
                    className="size-4 shrink-0 text-content-subtle transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </h3>

                <p className="mt-1.5 text-[13px] leading-relaxed text-content-muted">
                  {collection.copy}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
