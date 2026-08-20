import { CollectionPage } from "@/components/ui/collection-page";
import { mockCartItems } from "@/lib/mock-data";

/**
 * The cart — what has been chosen, not yet bought.
 *
 * The same page as the Snapi List by construction: same grid, same pinned toolbar,
 * same remove-with-Undo, all of it in `CollectionPage`. What differs is the copy and
 * the fixture, and that is the whole of this file.
 *
 * The description is doing real work. "Your Cart" alone would leave the difference
 * between this page and the list unstated, and they look alike on purpose — so the
 * subtitle says what the distinction is: the list is what you are considering, this is
 * what you have decided on.
 *
 * ## What is not here
 *
 * No subtotal, no checkout. Both were on the table and the pinned row kept the search
 * and filters instead, which is the choice that makes this page consistent with the
 * list rather than a commerce surface with an inert Checkout button on it. A total is
 * the first thing to add the day the cart holds quantities and a real price.
 */
export function Cart() {
  return (
    <CollectionPage
      eyebrow="Cart"
      title="Your Cart"
      description="Ready when you are — the pieces you've decided on, held in one place until you check out."
      items={mockCartItems}
      subject="cart"
      dateLabel="Added"
      emptyMessage="Your cart is empty. Add something from your list or from a search."
    />
  );
}
