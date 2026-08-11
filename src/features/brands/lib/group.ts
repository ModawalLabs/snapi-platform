import type { MockBrand } from "@/lib/mock-data";

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Sorts the way a reader expects, not the way `<` does.
 *
 * A raw string comparison puts "Zegna" before "Élie" and separates "Chloé" from
 * "Celine", because it compares code points. `sensitivity: "base"` treats é and e
 * as the same letter, which is the only ordering a directory can defend.
 */
const COLLATOR = new Intl.Collator("en", { sensitivity: "base" });

/**
 * The letter a maison files under.
 *
 * Diacritics are stripped first so "Hermès" is H and "Chloé" is C — a reader
 * looking for Chloé will not think to check under some separate É heading.
 * Anything that does not reduce to A–Z (a numeral, a symbol) buckets under "#"
 * rather than creating a heading of one.
 */
function initial(name: string): string {
  const first = name.normalize("NFKD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();

  return /[A-Z]/.test(first) ? first : "#";
}

/**
 * Read a `?letter=` value into a filter.
 *
 * Anything that is not a single A–Z character becomes `null`, i.e. no filter.
 * `?letter=%3Cscript%3E` and `?letter=abc` are user-supplied strings, not trusted
 * input, and the value is interpolated into an id and compared against group
 * keys — narrowing it to one character here means nothing downstream has to think
 * about it.
 */
export function parseLetterParam(raw: string | undefined): string | null {
  if (!raw) return null;
  const letter = raw.trim().toUpperCase();
  return /^[A-Z]$/.test(letter) ? letter : null;
}

/**
 * Group maisons under their initial, alphabetically.
 *
 * Sorted before bucketing, so the map's insertion order *is* the alphabet and no
 * second sort of the keys is needed.
 */
export function groupByInitial(
  brands: MockBrand[],
): Array<{ letter: string; brands: MockBrand[] }> {
  const sorted = [...brands].sort((a, b) => COLLATOR.compare(a.name, b.name));
  const buckets = new Map<string, MockBrand[]>();

  for (const brand of sorted) {
    const letter = initial(brand.name);
    const bucket = buckets.get(letter);
    if (bucket) bucket.push(brand);
    else buckets.set(letter, [brand]);
  }

  return [...buckets].map(([letter, items]) => ({ letter, brands: items }));
}
