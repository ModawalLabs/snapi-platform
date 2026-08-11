import type { MockEditStory, MockEditorsLetter } from "@/lib/mock-data";

/**
 * The letter that opens the issue.
 *
 * The only block on `/edit` that is prose rather than a link. A magazine index
 * without one is a list of articles; with one it is an edited publication, and it
 * costs three paragraphs.
 *
 * Unsigned. The house speaks as the house here, the same way the closer does —
 * a named editor at the bottom would make it one person's column instead.
 *
 * Set in the body face, not the display serif. The letter is meant to be *read* —
 * Oranienbaum is a headline face and turns into decoration at paragraph length.
 * The one display element is the drop-style opening line.
 */
export function EditorsLetter({ letter }: { letter: MockEditorsLetter }) {
  return (
    <section aria-label="From the editor">
      <p className="text-eyebrow text-content-subtle">{letter.eyebrow}</p>

      <h2 className="mt-4 font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.1] font-normal text-balance text-content">
        {letter.title}
      </h2>

      <div className="mt-5 space-y-4">
        {letter.paragraphs.map((paragraph, index) => (
          <p
            key={paragraph.slice(0, 24)}
            className={
              // The opening paragraph carries slightly more weight and colour, the
              // way a print letter sets its first line larger. Doing it with size
              // rather than a true drop cap on purpose: a floated initial needs a
              // guaranteed line height and a guaranteed measure, and this column
              // has neither at every breakpoint.
              index === 0
                ? "max-w-[62ch] text-[15px] leading-relaxed text-content sm:text-base"
                : "max-w-[62ch] text-[15px] leading-relaxed text-content-muted"
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

/**
 * The contents index — departments and how many pieces each holds.
 *
 * Categories and counts, never headlines. A print contents page repeats its
 * headlines because the reader cannot see the pages; on a scrolling index the
 * same headline twice within one screen reads as a rendering fault, not as
 * navigation.
 *
 * Counted from the archive rather than authored, so it cannot drift out of date
 * when a story is added — the failure mode of a hand-written contents list is
 * that it silently stops being true.
 *
 * Not links: there is no category route to send anyone to, and a row that looks
 * clickable and is not is worse than one that never claimed to be.
 */
export function ContentsIndex({ stories }: { stories: MockEditStory[] }) {
  const counts = new Map<string, number>();
  for (const story of stories) {
    counts.set(story.category, (counts.get(story.category) ?? 0) + 1);
  }

  // Most-covered first, then alphabetically so ties do not reorder between
  // renders. `localeCompare` rather than `<` because the categories are prose.
  const departments = [...counts.entries()].sort(
    ([aName, aCount], [bName, bCount]) => bCount - aCount || aName.localeCompare(bName),
  );

  return (
    <section aria-label="Contents" className="border-t border-border pt-5">
      <h2 className="text-eyebrow text-content-subtle">Contents</h2>

      {/* CSS multi-column, not a grid. Seventeen departments in one column is
          twice the height of the letter beside it; in a grid they would fill
          left-to-right, so the eye reads 01, 02 across and then jumps back. A
          column flow fills top-to-bottom first, which is how an index is read. */}
      <dl className="mt-4 columns-1 gap-x-8 sm:columns-2">
        {departments.map(([name, count]) => (
          <div
            key={name}
            className="flex break-inside-avoid items-baseline gap-3 border-b border-border/60 py-2.5"
          >
            <dt className="text-sm text-content">{name}</dt>
            {/* The leader. A flexed rule rather than a row of dots: dots need a
                monospaced repeat to stay even, and a hairline reads cleaner at
                this size while doing the same job of carrying the eye across. */}
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <dd className="tabular text-sm text-content-subtle">
              {String(count).padStart(2, "0")}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
