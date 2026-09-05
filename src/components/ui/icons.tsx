import { createLucideIcon } from "lucide-react";

/**
 * Icons drawn for Snapi, in Lucide's own format.
 *
 * ## Why not just use the Lucide glyph
 *
 * Everything else in the interface is Lucide and it should stay that way — one icon set
 * is most of what makes a row of controls read as a row of controls. A drawing belongs
 * here only when the set has nothing that says the right thing, which is a much higher
 * bar than "I would have drawn it differently".
 *
 * ## Why these are built with `createLucideIcon`
 *
 * Because then they *are* Lucide icons rather than SVGs that resemble them. They take
 * the same props, honour `size` and `absoluteStrokeWidth`, forward a ref, carry the same
 * `lucide lucide-<name>` classes, and satisfy the `LucideIcon` type — which matters,
 * because `config/nav.ts` types its icons that way and would otherwise have to be
 * widened to admit a plain component. A hand-rolled `<svg>` looks identical right up
 * until the first place that passes it a prop it does not implement.
 *
 * Drawn on Lucide's 24×24 grid with its conventions: 2px stroke, round caps and joins,
 * no fill. An icon drawn at a different weight is the one thing in a row that looks
 * wrong without anyone being able to say why.
 */

/**
 * A shopping cart, for the cart itself and for anything that happens to it.
 *
 * Lucide ships `ShoppingCart` and this is deliberately not it, for one reason that is
 * easy to state and easy to check: **its wheels are solid**. They are drawn as circles
 * of radius 1 under a 2px stroke, so the stroke closes over the hole and each wheel
 * renders as a filled dot. In a row where Bookmark, Share and everything else is an
 * outline, those two dots are the only solid shapes on screen, and they are what make
 * the stock glyph read as heavier and blunter than its neighbours.
 *
 * Three things differ here, all of them chosen by drawing the alternatives and looking
 * at them at 16px rather than at 72:
 *
 * - **Open wheels.** Radius 1.35 against the same 2px stroke leaves a visible centre, so
 *   they read as drawn rings rather than blobs. This is the whole point of the exercise.
 * - **A tapered basket.** The sides pull in from rim to base the way a real trolley is
 *   built. A squarer basket was tried and sits bottom-heavy: at small sizes the mass
 *   collects under the rim and the cart looks loaded rather than empty.
 * - **A shorter handle with a tighter elbow**, which keeps the glyph inside the grid
 *   without shrinking the basket — the basket is the part that has to survive at 16px,
 *   and the handle is the part that can afford to give up room.
 *
 * Named `Cart` rather than `ShoppingCart` so that nothing in this codebase can quietly
 * import Lucide's and shadow it.
 */
export const Cart = createLucideIcon("Cart", [
  // The handle, elbowing into the basket's top-left corner.
  ["path", { d: "M2.6 3.4h1.9a1.1 1.1 0 0 1 1.08.89L6 6.6", key: "handle" }],
  // The basket: rim at y 6.6, tapering to a base at y 15.4.
  [
    "path",
    {
      d: "M6 6.6h15.4l-1.62 7.53a1.6 1.6 0 0 1-1.56 1.27H9.02a1.6 1.6 0 0 1-1.57-1.29z",
      key: "basket",
    },
  ],
  // Wheels, drawn open. See the note above — this is the reason the icon exists.
  ["path", { d: "M9.6 19.9a1.35 1.35 0 1 1-2.7 0 1.35 1.35 0 0 1 2.7 0z", key: "wheel-left" }],
  ["path", { d: "M19.4 19.9a1.35 1.35 0 1 1-2.7 0 1.35 1.35 0 0 1 2.7 0z", key: "wheel-right" }],
]);
