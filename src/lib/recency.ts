/**
 * Bucket timestamped records into Today / Previous 7 days / Older.
 *
 * Grouping rather than a flat reverse-chronological list, because a bare column
 * gives no sense of *when* — people look for "the one from yesterday", not "the
 * fourth one down".
 *
 * "now" is captured once per call rather than per item, so a list cannot straddle
 * a boundary mid-loop and put two records from the same minute in different
 * groups.
 *
 * No `"use client"` here on purpose: both the sidebar (a client component) and the
 * chat history page (a server component) call this, and a function exported from a
 * client module becomes a client-reference proxy the moment a server module
 * imports it.
 */
export function groupByRecency<T extends { updatedAt: string }>(
  items: T[],
): Array<{ label: string; items: T[] }> {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const buckets: Array<{ label: string; items: T[] }> = [
    { label: "Today", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];

  for (const item of items) {
    const age = now - new Date(item.updatedAt).getTime();
    const index = age < day ? 0 : age < 7 * day ? 1 : 2;
    buckets[index]!.items.push(item);
  }

  return buckets.filter((bucket) => bucket.items.length > 0);
}
