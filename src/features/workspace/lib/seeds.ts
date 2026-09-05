import { routes } from "@/config/routes";
import {
  mockProducts,
  type MockBrand,
  type MockEditStory,
  type MockMessage,
  type MockMission,
  type MockProduct,
  type MockRecent,
} from "@/lib/mock-data";
import type { ImageSource } from "@/types/media";

/**
 * Seeded workspace content, per entry point.
 *
 * The workspace opens *mid-conversation*, never blank. Clicking a specific mission
 * or a specific past chat and landing on an empty composer throws away the only
 * thing that made the click specific — you would have to retype what you already
 * told it.
 *
 * Mock content, so it lives beside the feature rather than in a component: when a
 * real backend lands, these four functions become one fetch and the components
 * above them do not change. The product lists come from `mock-data`, which is the
 * one file to delete.
 */

export interface WorkspaceSeed {
  eyebrow: string;
  title: string;
  closeHref: string;
  closeLabel: string;
  /**
   * This workspace's own URL, without a product on it.
   *
   * Product cards append `&p=<slug>` to it, which is what makes an opened product
   * a real location: shareable, refreshable, and dismissed by the browser's own back
   * button rather than by a control the page has to provide.
   *
   * Each seed carries its own because every entry point has a different URL, and
   * the pane cannot read the address bar without `useSearchParams`, which would put
   * the whole workspace behind a Suspense boundary.
   */
  selfHref: string;
  messages: MockMessage[];
  products: MockProduct[];
  /** Optional — omitted where the heading already says everything it would. */
  resultsNote?: string;
  /**
   * The mission's name, set only when this workspace *is* a mission.
   *
   * Its presence is what turns on the mission half of the results pane: the second
   * tab, the collections, and the add control on every card. A conversation, an
   * editorial story and a brand page are all searches with nothing to file into, so
   * they leave it undefined and none of that renders.
   *
   * The name is what most of it reads — the view says it out loud, and "Added to A
   * winter coat that isn't black" reads as a place where "Added to this mission" reads
   * as a system message. The rest is the dossier at the head of the conversation: the
   * photograph from the board and what the agent is doing. Not the brief — the
   * thread's own first message is the brief, so the dossier would be quoting the line
   * directly beneath it.
   *
   * Still no id. Nothing here has an endpoint to send one to; it joins the day there
   * is one.
   */
  /**
   * Ids already filed into the mission, by category, before the reader touches
   * anything.
   *
   * ⚠️ Demo seeding, and it is the one thing in this file that exists for the *screen*
   * rather than for the product. A mission opened for the first time has nothing in it,
   * so the collections and the picks would be absent — which is correct behaviour and
   * shows none of the interface. Three collections of three is the smallest set that
   * demonstrates the shape: more than one shelf, more than one piece on a shelf.
   *
   * A real backend replaces this with what the user has actually filed, and the day it
   * does, this field is what it fills.
   */
  filed?: string[];
  mission?: {
    name: string;
    image: ImageSource | null;
    /** `object-position` for the 4:3 band. Belongs to the photograph, not the mission. */
    focus?: string;
  };
}

/**
 * A stable slice of the catalogue for a given key.
 *
 * Deterministic on purpose. `Math.random()` would return one set on the server and
 * another in the browser — a hydration mismatch — and a different set on every
 * request, so the page could never be cached and a link to a result would not
 * resolve to that result. A character sum is crude, but crude and stable beats
 * clever and not.
 */
function productsFor(key: string, count = 6): MockProduct[] {
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);

  const offset = sum % mockProducts.length;
  return Array.from(
    { length: Math.min(count, mockProducts.length) },
    (_, i) => mockProducts[(offset + i) % mockProducts.length]!,
  );
}

/**
 * The products a mission surfaces, and which of them arrive already filed.
 *
 * Hand-picked rather than `productsFor`, and the reason is arithmetic: the deterministic
 * window returns whatever twelve products sit at an offset, which for this fixture is
 * six bags and one of everything else. Three collections of three cannot be cut from
 * that, so the demo would show one deep shelf and four single pieces.
 *
 * The fourteen filed pieces span the six categories the mission is meant to show, and
 * the counts are uneven on purpose. `Bags` holds six, which is the one that matters:
 * the collections pane previews four per shelf and offers a screen of its own past that,
 * so without a deep collection the "view all" path is unreachable code. The rest run one
 * or two, because a mission holding exactly the same number of everything looks
 * generated — and the strip is more legible when the numbers differ.
 *
 * Four pieces follow them in the results, unfiled: a coat, a shoe, a pendant and a
 * scarf. That matters twice — the grid still has something to add, and the scarf's
 * category is absent from the mission, so filing it demonstrably *creates* a seventh
 * collection rather than growing one. A results tab where every card is already ticked
 * demonstrates neither.
 */
function missionInventory(): { products: MockProduct[]; filed: string[] } {
  const pick = (...slugs: string[]) =>
    slugs.map((slug) => {
      const product = mockProducts.find((item) => item.slug === slug);
      // Throwing beats a silent `undefined` in a fixture: a renamed slug should fail
      // the build, not empty a collection nobody notices is short.
      if (!product) throw new Error(`missionInventory: no product for "${slug}"`);
      return product;
    });

  const filed = pick(
    // Outerwear · 2
    "loro-piana-cashmere-storm-coat",
    "the-row-camel-wool-coat",
    // Tailoring · 2
    "brunello-cucinelli-linen-suit",
    "khaite-silk-slip-dress-navy",
    // Bags · 6 — the deep one, and the only collection that overflows its preview
    "hermes-kelly-28-retourne-gold",
    "hermes-kelly-25-sellier-etoupe",
    "hermes-birkin-30-togo",
    "celine-16-medium-smooth-calf",
    "loewe-puzzle-small-classic",
    "the-row-margaux-15",
    // Shoes · 2
    "loro-piana-summer-walk-chocolate",
    "bottega-veneta-intrecciato-loafer",
    // Jewellery · 1
    "cartier-love-bracelet-yellow-gold",
    // Watches · 1
    "cartier-tank-louis-1978",
  );

  const rest = pick(
    "max-mara-teddy-camel-coat",
    "church-s-shannon-derby",
    "van-cleef-vintage-alhambra-pendant",
    "loro-piana-baby-cashmere-scarf",
  );

  return { products: [...filed, ...rest], filed: filed.map((product) => product.id) };
}

export function missionSeed(mission: MockMission): WorkspaceSeed {
  const { products, filed } = missionInventory();

  return {
    eyebrow: "Mission",
    title: mission.name,
    closeHref: routes.missions(),
    closeLabel: "Close mission",
    selfHref: routes.mission(mission.id),
    resultsNote: "Ranked by how closely each answers the brief",
    mission: { name: mission.name, image: mission.image, focus: mission.focus },
    filed,
    messages: [
      { id: "m-1", role: "user", body: mission.brief },
      {
        id: "m-2",
        role: "snapi",
        body: `Understood. I'm watching ${mission.collections === 0 ? "the market" : `${mission.collections} collections`} for this and I'll flag anything that fits — you don't need to check back.`,
      },
      {
        id: "m-3",
        role: "user",
        body: "What have you got so far?",
      },
      {
        id: "m-4",
        role: "snapi",
        body: "Here's everything currently in play. I've put the closest match first and noted what each one gets right, including the two that miss on one point — you should see those rather than have me quietly drop them.",
      },
    ],
    // From `missionInventory`, not the deterministic window: a mission is the one
    // surface where the results are raw material rather than an answer, and the shape
    // of that material matters. See the note there.
    products,
  };
}

export function chatSeed(conversation: MockRecent): WorkspaceSeed {
  return {
    eyebrow: "Conversation",
    title: conversation.title,
    closeHref: routes.chats(),
    closeLabel: "Close conversation",
    selfHref: routes.chat(conversation.id),
    resultsNote: "From this conversation",
    messages: [
      { id: "c-1", role: "user", body: conversation.title },
      {
        id: "c-2",
        role: "snapi",
        body: "Got it. I've pulled what fits from the maisons and the vetted resellers, and skipped anything I couldn't verify the seller on.",
      },
      {
        id: "c-3",
        role: "snapi",
        body: "Tell me what's wrong with these and I'll narrow it — price, cut, colour, or how soon you need it.",
      },
    ],
    products: productsFor(conversation.id),
  };
}

export function storySeed(story: MockEditStory): WorkspaceSeed {
  return {
    eyebrow: `The Edit · ${story.category}`,
    title: story.title,
    closeHref: routes.home(),
    closeLabel: "Close story",
    selfHref: routes.editStory(story.slug),
    messages: [
      {
        id: "s-1",
        role: "snapi",
        body: `${story.title} — a ${story.readMinutes} minute read, but you can shop it straight from here.`,
      },
      {
        id: "s-2",
        role: "snapi",
        body: "Everything on the right is what the piece actually recommends, checked against live stock. Ask me to filter it by size, budget, or how fast it can reach you.",
      },
    ],
    products: productsFor(story.slug),
  };
}

export function brandSeed(brand: MockBrand): WorkspaceSeed {
  // Anything the house actually owns leads; the rest of the catalogue follows as
  // what Snapi would suggest alongside it. Filtering to zero and showing an empty
  // pane would be the literal answer and a useless one.
  const own = mockProducts.filter((product) => product.brand === brand.name);
  const rest = productsFor(brand.slug).filter((product) => product.brand !== brand.name);

  return {
    eyebrow: "Maison",
    title: brand.name,
    closeHref: routes.brands(),
    closeLabel: `Close ${brand.name}`,
    selfHref: routes.brand(brand.slug),
    resultsNote: own.length > 0 ? `In stock from ${brand.name}` : "Closest to this house",
    messages: [
      { id: "b-1", role: "user", body: `Show me what's available from ${brand.name}.` },
      {
        id: "b-2",
        role: "snapi",
        body:
          own.length > 0
            ? `Here's what I can currently verify from ${brand.name} — authorised boutiques first, then resale I've been able to authenticate.`
            : `Nothing from ${brand.name} is verifiable right now. Rather than show you an empty page, here's the closest thing across the houses I can vouch for — say the word and I'll watch ${brand.name} instead.`,
      },
      {
        id: "b-3",
        role: "snapi",
        body: "Narrow it however you like — a category, a size, a ceiling, or a piece you've seen elsewhere.",
      },
    ],
    products: [...own, ...rest].slice(0, 6),
  };
}

export function promptSeed(query: string): WorkspaceSeed {
  const asked = query.trim();

  return {
    eyebrow: "New search",
    title: asked.length > 0 ? asked : "Ask Snapi anything",
    closeHref: routes.home(),
    closeLabel: "Close search",
    selfHref: routes.newChat(asked),
    resultsNote: "Best matches first",
    messages:
      asked.length > 0
        ? [
            { id: "p-1", role: "user", body: asked },
            {
              id: "p-2",
              role: "snapi",
              body: "Here's what I found. I've read the brief literally — say the word if you'd rather I widened it.",
            },
          ]
        : [
            {
              id: "p-1",
              role: "snapi",
              body: "Snap it, say it, or type it. I'll find it, tell you where it's genuinely in stock, and watch the price if you'd rather wait.",
            },
          ],
    // A blank search still shows the catalogue rather than an empty pane. An empty
    // right-hand side on arrival reads as broken, not as "nothing asked yet".
    products: productsFor(asked || "snapi"),
  };
}
