import type { Metadata } from "next";

import { Cart } from "@/features/cart";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "The pieces you've decided on, held in one place until you check out.",
  // A cart is one person's, and would be empty for every visitor but its owner.
  robots: { index: false, follow: false },
};

/**
 * `/cart` — inside the `(app)` group, so the sidebar stays mounted and clicking
 * "Cart" swaps only the main region.
 */
export default function CartPage() {
  return <Cart />;
}
