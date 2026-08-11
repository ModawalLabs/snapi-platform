import { cookies } from "next/headers";

import { COOKIES } from "@/config/cookies";
import { FLAVOUR_COPY, parseFlavour, type Flavour } from "@/config/flavour";

/**
 * The active flavour, on the server.
 *
 * Split from `config/flavour.ts` because this file imports `next/headers` and is
 * therefore server-only — importing it from a client component is a build error
 * rather than a subtle runtime failure, which is the right way round. The shared
 * type, copy and parser stay in the config so both sides can use them.
 *
 * Safe to call from several components on one page: `cookies()` is memoised per
 * request, so three sections asking independently costs one read and none of them
 * needs the answer threaded through props.
 */
export async function getFlavour(): Promise<Flavour> {
  const store = await cookies();
  return parseFlavour(store.get(COOKIES.flavour)?.value);
}

/** The active flavour's copy — the common case, so it gets its own accessor. */
export async function getFlavourCopy(): Promise<(typeof FLAVOUR_COPY)[Flavour]> {
  return FLAVOUR_COPY[await getFlavour()];
}
