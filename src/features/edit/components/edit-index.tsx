import Image from "next/image";
import Link from "next/link";

import logoDark from "@/assets/logos/logo-dark.png";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHeader } from "@/components/ui/page-header";
import { routes } from "@/config/routes";
import { DepartmentIndex } from "@/features/edit/components/department-index";
import { DispatchList } from "@/features/edit/components/dispatch-list";
import { ContentsIndex, EditorsLetter } from "@/features/edit/components/editors-letter";
import { PullQuote } from "@/features/edit/components/pull-quote";
import { Meta, StoryFigure } from "@/features/edit/components/story-figure";
import { mockEditPullQuote, mockEditStories, mockEditorsLetter } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * `/edit` — the archive, laid out as a magazine.
 *
 * ## The page tapers
 *
 * That is the structure, and everything else follows from it. It opens with one
 * large picture and one headline, and it ends with a four-column index of
 * headlines and no pictures at all. Blocks get smaller and denser the further down
 * you read, exactly as a print magazine narrows from features to columns to the
 * back index. A page whose blocks are all the same size has no shape, however
 * varied the alignments are — which is why nothing here is full-width except the
 * two bands that are meant to stop the reader.
 *
 * ## The alignments are a system, not variety for its own sake
 *
 * Nine movements, all measured off the same 12-column grid and the same vertical
 * rhythm. None of them carries a byline: the archive is presented in the
 * publication's voice, and one credit on the lead with none anywhere else reads as
 * an oversight rather than as emphasis.
 *
 *  1. **Lead** — a narrow 3-column portrait against 6 columns of type, with a
 *     column of air between, and the text sits on the *bottom* of the row rather
 *     than the top. Hanging the headline off the base of the photograph is a print
 *     convention; top-aligning both columns is what a CMS does. The picture is
 *     deliberately the smaller half — the headline opens the issue, and a lead
 *     photograph that fills the row leaves it nothing to do.
 *  2. **Letter & contents** — prose against a counted index. The only block on the
 *     page that speaks in the publication's own voice.
 *  3. **Pair** — two portraits at 5/12 each, the second dropped by six rows. The
 *     offset is large enough (~6rem) to be obviously deliberate. A 12px stagger
 *     looks like a bug; a 96px one looks like a decision.
 *  4. **Pull-quote** — one sentence, full band, nothing beside it.
 *  5. **More** — a tall portrait against a numbered column of text-only stories,
 *     which resets an eye that has seen four photographs.
 *  6. **Selected** — a label block, then three quarter-width cards at three aspect
 *     ratios (4:5, 1:1, 3:4) hung from a shared top edge. The images disagree; the
 *     captions do not.
 *  7. **Also in this issue** — the same row mirrored: cards left, label right. The
 *     reflection is what makes both read as composed rather than as two attempts
 *     at the same thing.
 *  8. **Departments** — eight headlines, four columns, no pictures. The taper's
 *     narrowest point.
 *  9. **Closer** — the house's own note, and the one centred block on the page.
 *     Centred type is the strongest signal available and therefore used exactly
 *     once, to end.
 *
 * Every movement returns to the same left margin, so the page has a spine even
 * where individual blocks step away from it.
 *
 * A Server Component: an archive index is a list of links, and nothing here reacts.
 *
 * Slots are taken by index rather than filtered by some `layout` field on the
 * data. Editorial position is a property of the page, not of the story — the same
 * piece is the lead here and the fourth card on the home bento.
 */
export function EditIndex() {
  const stories = mockEditStories;

  const lead = stories[0];
  const pair = stories.slice(1, 3);
  const selected = stories.slice(3, 6);
  const closer = stories[6];
  const dispatchFeature = stories[7];
  const dispatches = stories.slice(8, 11);
  const alsoInThisIssue = stories.slice(12, 15);
  // Index 11 predates the three picture-led pieces that follow it in the archive,
  // so it sits above them in the array while belonging to this block on the page.
  // Slot allocation follows the composition, not the ordering.
  const departments = [...stories.slice(11, 12), ...stories.slice(15)];

  if (!lead) return null;

  return (
    <>
      <PageHeader
        eyebrow="Curated weekly"
        title="The Edit"
        description="Considered writing on what to buy, what to keep, and what to leave behind — from the people who actually handle the pieces."
      />

      <div className="container-page">
        {/* Masthead strip. A magazine states its issue; it costs one line and it
            is the difference between "a page of articles" and a publication. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-10 pb-8 sm:pt-12">
          {/* Issue number only. The month went with the per-story dates — a
              masthead that stamps a date on the page ages everything under it. */}
          <p className="text-eyebrow text-content-subtle">Issue 07</p>
          <p className="text-[11px] tracking-wide text-content-subtle">
            {stories.length} stories in the archive
          </p>
        </div>

        {/* ── 1. Lead ──────────────────────────────────────────────────────── */}
        <section aria-label="Lead story" className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <Link
            href={routes.editStory(lead.slug)}
            className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:col-span-3"
          >
            <MediaFrame
              src={lead.image}
              alt=""
              focus={lead.focus}
              scrim={false}
              priority
              sizes="(min-width: 1024px) 24vw, 100vw"
              // Portrait only at `lg`, where the column is a quarter of the page
              // and 3:4 lands at roughly 269×359. Below that the frame is full
              // width, and a full-bleed portrait would put the entire opening
              // spread below the fold — so it stays landscape there.
              className="aspect-[4/3] rounded-lg shadow-premium sm:aspect-[16/10] lg:aspect-[3/4]"
            />
          </Link>

          {/* `lg:self-end` is the whole idea of this block — see the note above.
              `col-start-5` leaves a full empty column between picture and type;
              the gap alone reads as spacing, a skipped column reads as a margin.
              It stops at 10 rather than running to the edge, so the block ends on
              air instead of on the container. */}
          <div className="group lg:col-span-6 lg:col-start-5 lg:self-end lg:pb-2">
            <Meta story={lead} />

            <h2 className="mt-4">
              <Link
                href={routes.editStory(lead.slug)}
                className="block rounded-sm font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.06] font-normal tracking-[-0.01em] text-balance text-content transition-colors duration-300 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {lead.title}
              </Link>
            </h2>

            {/* No byline. Nothing else on the index carries one either, and a
                single credit on the lead reads as an inconsistency rather than as
                emphasis. `author` stays on the data for the story page. */}
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-content-muted">
              {lead.standfirst}
            </p>
          </div>
        </section>

        <Rule />

        {/* ── 2. Editor's letter & contents ──────────────────────────────────
            A plain grid, not a `<section>`: both children are already landmarks
            with their own labels, and wrapping them in a third would announce a
            region that exists only to hold two columns. */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <EditorsLetter letter={mockEditorsLetter} />
          </div>

          {/* Wider than the letter, and it needs to be: seventeen departments run
              in two columns, which is what keeps the index the same height as the
              prose beside it instead of twice as tall. A contents spread is wide
              in print for the same reason. */}
          <div className="lg:col-span-6 lg:col-start-7">
            <ContentsIndex stories={stories} />
          </div>
        </div>

        <Rule />

        {/* ── 3. Pair, offset ──────────────────────────────────────────────── */}
        <section aria-label="Features" className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {pair.map((story, index) => (
            <StoryFigure
              key={story.id}
              story={story}
              scale="md"
              ratio="aspect-[4/5]"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={cn(
                "lg:col-span-5",
                // The second column starts at 8, not 7, and drops. Only from `lg`
                // — stacked on a phone the offset would just be an unexplained gap
                // between two cards.
                index === 1 && "lg:col-start-8 lg:mt-24",
              )}
            />
          ))}
        </section>

        <Rule />

        {/* ── 4. Pull-quote ────────────────────────────────────────────────── */}
        <PullQuote quote={mockEditPullQuote} />

        <Rule />

        {/* ── 5. More ──────────────────────────────────────────────────────── */}
        <section aria-label="More" className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {dispatchFeature ? (
            <StoryFigure
              story={dispatchFeature}
              scale="sm"
              ratio="aspect-[2/3]"
              sizes="(min-width: 1024px) 32vw, 100vw"
              className="lg:col-span-4"
            />
          ) : null}

          <div className="lg:col-span-7 lg:col-start-6">
            <h2 className="text-eyebrow pb-6 text-content-subtle">More</h2>
            <DispatchList stories={dispatches} />
          </div>
        </section>

        <Rule />

        {/* ── 6. Selected — label left, three small cards right ────────────── */}
        <section
          aria-label="Selected stories"
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-8 lg:grid-cols-12 lg:gap-10"
        >
          <SlotLabel
            title="Selected"
            note="Three pieces we keep sending people back to."
            className="col-span-2 sm:col-span-3 lg:col-span-3"
          />

          {selected.map((story, index) => (
            <StoryFigure
              key={story.id}
              story={story}
              scale="sm"
              // 4:5 · 1:1 · 3:4. Hung from a shared top edge, so the images end at
              // three different heights and the captions do not line up — which is
              // exactly the point. A uniform ratio here would make this section
              // indistinguishable from the home bento.
              ratio={["aspect-[4/5]", "aspect-square", "aspect-[3/4]"][index] ?? "aspect-[3/4]"}
              sizes="(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 45vw"
              className="lg:col-span-3"
            />
          ))}
        </section>

        <Rule />

        {/* ── 7. Also in this issue — the same row, mirrored ───────────────── */}
        <section
          aria-label="Also in this issue"
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-8 lg:grid-cols-12 lg:gap-10"
        >
          {alsoInThisIssue.map((story, index) => (
            <StoryFigure
              key={story.id}
              story={story}
              scale="sm"
              ratio={["aspect-[3/4]", "aspect-[4/5]", "aspect-square"][index] ?? "aspect-[3/4]"}
              sizes="(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 45vw"
              className="lg:col-span-3"
            />
          ))}

          {/* Label last in the DOM as well as on screen. Putting it first and
              pushing it right with `col-start` would read correctly but announce
              backwards, and the heading of a block should precede nothing. */}
          <SlotLabel
            title="Also in this issue"
            note="Shorter pieces, filed the same week."
            align="right"
            className="col-span-2 sm:col-span-3 lg:col-span-3 lg:col-start-10"
          />
        </section>

        <Rule />

        {/* ── 8. Departments ───────────────────────────────────────────────── */}
        <section aria-label="Departments">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-6">
            <h2 className="text-eyebrow text-content-subtle">Departments</h2>
            <p className="text-[11px] tracking-wide text-content-subtle">The short answers</p>
          </div>

          <DepartmentIndex stories={departments} />
        </section>

        <Rule />

        {/* ── 9. Closer ────────────────────────────────────────────────────── */}
        {closer ? (
          <section aria-label="About Snapi" className="pb-4">
            {/* The house's own note, so it goes nowhere. It is the sign-off, not
                another story to open — and there is no piece behind it to read. */}
            <StoryFigure
              story={closer}
              scale="lg"
              align="center"
              linked={false}
              // 21:9 only from `sm`. At phone width a cinematic crop is a 180px
              // letterbox strip — technically the same ratio, visually a rule.
              ratio="aspect-[3/2] sm:aspect-[21/9]"
              sizes="(min-width: 1024px) 72vw, 100vw"
              className="mx-auto max-w-4xl"
              mediaOverlay={
                /* The mark signs the house's own note, bottom-right, the way a
                   masthead colophon carries its publisher's device.

                   `logo-dark` in both themes on purpose: it sits on a photograph,
                   and a photograph does not lighten because the UI did. The drop
                   shadow rather than a plate — a badge behind it would read as a
                   sticker on the picture instead of part of it. */
                <Image
                  src={logoDark}
                  alt=""
                  aria-hidden="true"
                  sizes="112px"
                  className={cn(
                    "absolute right-4 bottom-4 w-auto object-contain sm:right-6 sm:bottom-6 lg:right-8 lg:bottom-8",
                    "h-14 sm:h-20 lg:h-24",
                    // Two shadows, not one. The tight one separates the gold edge
                    // from whatever sits directly behind it; the wide one lifts the
                    // whole mark off a busy photograph. A single radius does one of
                    // those jobs and fails the other, which is why this is an
                    // arbitrary `filter` rather than two `drop-shadow-*` utilities
                    // — those are the same property and would overwrite each other.
                    "[filter:drop-shadow(0_2px_6px_oklch(0%_0_0/0.55))_drop-shadow(0_10px_30px_oklch(0%_0_0/0.45))]",
                  )}
                />
              }
            />
          </section>
        ) : null}

        {/* Colophon. A sign-off, not a link — the page has ended, and a live
            destination here would invite one more click at the exact moment the
            reader is meant to be finished. Set in the display serif because it is
            the masthead's voice rather than another headline. */}
        <p className="mt-12 border-t border-border pt-10 pb-16 text-center font-display text-lg leading-none font-normal tracking-[0.01em] text-content-muted sm:text-xl">
          Curated, effortlessly
        </p>
      </div>
    </>
  );
}

/**
 * The standing label beside a row of small cards.
 *
 * `lg:self-end` so it sits on the baseline of the shortest card rather than
 * floating at the top of the row — the same rule the lead block follows, and what
 * keeps these two rows reading as spreads instead of as a heading with a grid
 * underneath.
 *
 * Below `lg` it goes back to a plain left-aligned heading above the cards. A
 * right-aligned label over a stacked column is just text that has drifted.
 */
function SlotLabel({
  title,
  note,
  align = "left",
  className,
}: {
  title: string;
  note: string;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <div className={cn("lg:self-end lg:pb-1", align === "right" && "lg:text-right", className)}>
      <h2 className="font-display text-2xl leading-tight font-normal text-balance text-content sm:text-[1.75rem]">
        {title}
      </h2>
      <p
        className={cn(
          "mt-2.5 max-w-[28ch] text-[13px] leading-relaxed text-content-muted",
          align === "right" && "lg:ml-auto",
        )}
      >
        {note}
      </p>
    </div>
  );
}

/**
 * The rule between movements.
 *
 * One spacing value for every break, so the page has a single vertical rhythm no
 * matter how much the blocks either side of it differ. Varying it per section is
 * how a layout stops feeling composed.
 *
 * Tighter than it was, because there are now ten movements rather than five: the
 * same generous gap repeated twice as often stops reading as breathing room and
 * starts reading as a page that will not end.
 */
function Rule({ className }: { className?: string }) {
  return <div className={cn("rule-fade my-12 h-px sm:my-16", className)} aria-hidden="true" />;
}
