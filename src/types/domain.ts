/**
 * Core domain vocabulary.
 *
 * These are the nouns the whole product agrees on. Feature slices extend them
 * locally; they do not redefine them. Keeping this file small and stable is the
 * point — if it starts growing per-feature fields, those belong in the feature.
 *
 * Deliberately down to two. This file previously carried a full speculative model
 * — `Product`, `Merchant`, `CartLine`, `SearchIntent`, cursor `Page<T>` — written
 * before any of it had a caller. None ever got one, and meanwhile `mock-data.ts`
 * grew its own `MockProduct` with different fields. Two competing product models
 * in one codebase is worse than none: the next person has to work out which is
 * real. They come back, shaped by the API that actually ships, when something
 * consumes them.
 */

/**
 * Money is an integer in minor units plus a currency. Never a float, and never
 * a bare number: `19.99` in JS is not 19.99, and a number with no currency is
 * a bug waiting for the first non-USD market.
 */
export interface Money {
  amount: number;
  currency: string;
}

/**
 * How a result was found. Snapi's differentiator is that a result can come from
 * a photo or a natural-language intent, not just a keyword — the UI surfaces
 * this back to the user so the match feels explainable rather than magic.
 */
export type SearchModality = "text" | "image" | "voice" | "url";
