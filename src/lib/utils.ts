import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, with later Tailwind utilities winning over earlier
 * conflicting ones. This is what makes `className` overrides on our components
 * predictable instead of a specificity coin-flip.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a minor-unit amount (cents) as currency.
 *
 * Money is stored and passed around in minor units — integers — so we never
 * accumulate float error on a cart total.
 */
export function formatPrice(
  amountInMinorUnits: number,
  options: { currency?: string; locale?: string; showDecimals?: boolean } = {},
): string {
  const { currency = "USD", locale = "en-US", showDecimals = true } = options;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amountInMinorUnits / 100);
}

/** Compact counts for social proof: 1200 → "1.2K". */
export function formatCompact(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Absolute date: "6 Aug 2026".
 *
 * Pinned to UTC deliberately. Without an explicit `timeZone` the server formats
 * in the container's zone and the browser in the visitor's, so any timestamp near
 * midnight renders as a different day on each — a hydration mismatch that only
 * shows up for some users, at some hours. Stored timestamps are UTC, so this
 * reads them as authored.
 */
export function formatDate(date: Date | string | number, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** URL-safe slug. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Clamp, because `Math.min(Math.max(...))` inline is unreadable. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
