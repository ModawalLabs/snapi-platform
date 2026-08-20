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

export function missionSeed(mission: MockMission): WorkspaceSeed {
  return {
    eyebrow: "Mission",
    title: mission.name,
    closeHref: routes.missions(),
    closeLabel: "Close mission",
    selfHref: routes.mission(mission.id),
    resultsNote: "Ranked by how closely each answers the brief",
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
    products: productsFor(mission.id),
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
