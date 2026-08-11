import type { MockPullQuote } from "@/lib/mock-data";

/**
 * The pull-quote band.
 *
 * One sentence at display size, between two rules, with nothing beside it. It is
 * the page's one full stop: after four movements of photographs and captions the
 * reader needs somewhere with no decision in it, and a quote is the only element
 * that can occupy a full band while asking for nothing.
 *
 * No attribution and no link — see `MockPullQuote`. It reads as the publication's
 * own line, which is also what lets it sit alone in the band without a caption
 * hanging beneath it looking for a home.
 *
 * The quotation marks are typographic (`“ ”`) and set in the markup rather
 * than as `::before` content, so they are part of the text a screen reader
 * announces and part of what a reader copies.
 */
export function PullQuote({ quote }: { quote: MockPullQuote }) {
  return (
    <figure className="mx-auto max-w-4xl py-2 text-center">
      <blockquote>
        <p className="font-display text-[clamp(1.5rem,3.4vw,2.5rem)] leading-[1.18] font-normal tracking-[-0.008em] text-balance text-content">
          {`“${quote.quote}”`}
        </p>
      </blockquote>
    </figure>
  );
}
