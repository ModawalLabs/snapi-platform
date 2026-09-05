import { CollectionPage } from "@/components/ui/collection-page";
import { mockSavedItems } from "@/lib/mock-data";

/**
 * Snapi List — every saved piece on one scroll.
 *
 * All the behaviour is in `CollectionPage`, which the Cart also renders; this file is
 * the list's copy and its fixture. It was the whole page until a second page wanted
 * the same grid, the same pinned toolbar and the same soft-delete-with-Undo, at which
 * point keeping one implementation mattered more than keeping it here.
 *
 * A grid of small tiles, five to a row at `xl`. A saved list is scanned before it is
 * read: you are looking for the coat, and you recognise it by the photograph, not by
 * its name. One wide row per piece spent the width on fields that answer questions you
 * only ask after you have already found the thing.
 *
 * Five columns puts the tiles at ~218px, which is what forced the card down to brand,
 * name, price and date — see `SavedItemCard`. That is the trade and it is the right way
 * round: a tile you can take in at a glance, and the specifics on the page behind it.
 *
 * Not a Client Component itself. `CollectionPage` is the boundary, and this one only
 * passes strings across it.
 */
export function SnapiList() {
  return (
    <CollectionPage
      eyebrow="Saved"
      title="Snapi List"
      description="The pieces you've set aside — kept in view until the moment is right."
      items={mockSavedItems}
      subject="list"
      dateLabel="Saved"
      // The two lines are deliberately not the same sentence. The page states what
      // the list is *for* — which is the thing worth knowing while it is empty — and
      // the composer, which is now on screen, carries the invitation to act. Written
      // as one message repeated in both places, the reader would read it twice and
      // learn it once.
      emptyMessage="Nothing set aside yet — whatever you add stays in view, and Snapi keeps watch on what it costs."
      emptyPrompt="Describe a piece to set aside and Snapi will watch its price."
    />
  );
}
