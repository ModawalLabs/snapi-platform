/**
 * ============================================================================
 * MOCK DATA — DELETE THIS FILE when real data lands.
 * ============================================================================
 *
 * Everything here is placeholder content so the UI can be built and reviewed
 * before any backend exists. It is deliberately kept in ONE file, outside
 * `features/`, so that finding and removing it later is trivial:
 *
 *     grep -r "mock-data" src/
 *
 * Shapes intentionally mirror what the real API is expected to return, so
 * swapping the source should not require touching component code.
 */

import logoGucci from "@/assets/brands/gucci.png";
import logoLouisVuitton from "@/assets/brands/louis-vuitton.png";
import logoVersace from "@/assets/brands/versace.png";
import heroBag from "@/assets/hero/hero3.jpg";
import heroRain from "@/assets/hero/hero1.jpg";
import heroTailoring from "@/assets/hero/hero2.jpg";
import heroPuffer from "@/assets/hero/hero1.1.jpg";
import heroParty from "@/assets/hero/hero2.1.jpg";
import heroBackpack from "@/assets/hero/hero3.1.jpg";
import resortSlipTall from "@/assets/products/resort-slip-tall.jpg";
import sneakersTall from "@/assets/products/sneakers-tall.jpg";
import atelierMannequin from "@/assets/edit/atelier-mannequin.jpg";
import bridalLight from "@/assets/edit/bridal-light.jpg";
import poolsideResort from "@/assets/edit/poolside-resort.jpg";
import sneakersStudio from "@/assets/edit/sneakers-studio.jpg";
import streetStyleFurCoat from "@/assets/edit/street-style-fur-coat.jpg";

import type { Flavour } from "@/config/flavour";
import type { Money, SearchModality } from "@/types/domain";
import type { ImageSource } from "@/types/media";

/*
 * Adding a real image? Static-import it above and set the `image` field.
 * See `src/assets/edit/README.md` for required crops and sizes. Entries left at
 * `image: null` keep rendering the studio placeholder, so images can be added
 * one at a time without the section looking half-built in between.
 */

export interface MockUser {
  name: string;
  email: string;
  avatarUrl: string | null;
  plan: "All Rounder" | "Signature";
}

export const mockUser: MockUser = {
  name: "Shivansh",
  email: "shivansh@i2ltech.com",
  // Null on purpose — exercises the initials fallback in <Avatar />.
  avatarUrl: null,
  plan: "Signature",
};

/**
 * Worked examples for an empty missions board.
 *
 * Every one is an *occasion or a project*, never a single product — because that is
 * the thing about missions a new user does not guess. "A winter coat" is a search;
 * "furnishing a first flat" is a standing brief with a dozen decisions in it, and
 * only the second kind explains why the feature exists.
 *
 * `brief` is the payload and it is written to be read: each one carries a
 * constraint, a budget and a bit of context, because tapping a starter drops it
 * into the field where the user can see what a good brief looks like before editing
 * it. The label sells the idea; the brief teaches the form.
 *
 * The photography is mood, not subject — there are no interiors or luggage in the
 * asset set, and this file's editorial covers have always been freely reassignable
 * (see `mockEditStories`). All five sources are 3:2, which is the plate's own
 * ratio, so nothing is cropped. Replace with real art before launch; the pairing is
 * the one thing here that would read as careless at full size.
 */
export interface MockMissionStarter {
  id: string;
  /**
   * The occasion, in a few words. An occasion or a project, never a product.
   *
   * No longer printed on the card — the cards are a row of five now and a title on
   * each made them read as five articles to choose between rather than as examples.
   * It is the button's accessible name instead, which is the one place a title is
   * still needed: "Use this brief" five times over tells a screen-reader user nothing.
   */
  label: string;
  /** The one line the card shows. */
  hint: string;
  /** What lands in the brief field — a worked example, not a placeholder. */
  brief: string;
  image: ImageSource;
  focus?: string;
}

export const mockMissionStarters: MockMissionStarter[] = [
  {
    id: "ms1",
    label: "Furnishing a first flat",
    hint: "A whole room, in one brief.",
    brief:
      "Furnishing a first flat — a sofa, a floor lamp and a rug that look considered together, under $2,000 for all three.",
    image: heroBackpack,
    focus: "object-[62%_55%]",
  },
  {
    id: "ms2",
    label: "A September wedding",
    hint: "Dress for the day, not the shop.",
    brief:
      "Guest at an outdoor wedding in September — something for a warm afternoon that still works once it cools, under $600.",
    image: heroParty,
    focus: "object-[52%_35%]",
  },
  {
    id: "ms3",
    label: "Two weeks in Kyoto",
    hint: "Pack for the weather, and the walking.",
    brief:
      "Two weeks in Kyoto in November — layers for 8–15°C, and shoes I can genuinely walk 15km a day in.",
    image: heroPuffer,
    focus: "object-[66%_38%]",
  },
  {
    id: "ms4",
    label: "Moving somewhere colder",
    hint: "A coat, boots and knitwear that agree.",
    brief:
      "Moving to a city that gets properly cold — a coat, boots and two or three knits that work together at 0–8°C, about $2,000 for all of it.",
    image: heroRain,
    focus: "object-[66%_45%]",
  },
  {
    id: "ms5",
    label: "Best man in July",
    hint: "Standing up, in the heat, on camera.",
    brief:
      "Best man at a July wedding — suit, shirt and shoes that survive a hot afternoon and close-up photographs, up to $1,400 together.",
    image: heroTailoring,
    focus: "object-[54%_42%]",
  },
];

/**
 * The concierge's opening line on the start page.
 *
 * Specific on purpose. "How can I help you today?" is the line every assistant
 * opens with and it says nothing — it proves only that the page loaded. Naming an
 * actual piece and an actual number proves the assistant was working while the
 * user was away, which is the entire promise of the product.
 *
 * Which is also the constraint: every claim here has to be true of something in
 * this file. The Tank is `mockSavedItems`, the Kelly is `mockMissions`. When the
 * backend lands this becomes a generated brief, and a real one that invents a
 * price movement is worse than no brief at all.
 */
export interface MockConciergeBriefing {
  /** Two sentences at most. It sits above a composer, not in a thread. */
  body: string;
  /** What the reader can do about it, and where that goes. */
  action: { label: string; href: string };
}

export const mockConciergeBriefing: MockConciergeBriefing = {
  body: "Two of your missions moved while you were away. The Cartier Tank is $340 under where it sat on Tuesday, and a Kelly 25 in sellier has come up at a reseller I've checked out.",
  action: { label: "Show me both", href: "/missions" },
};

/**
 * Snapi Memory — what the assistant has learned, grouped.
 *
 * Ordered by when each becomes useful: taste first (aesthetic, then categories),
 * then the houses that taste resolves to, then free-form tags, and finally the
 * values that override all of it. A "no exotic leathers" outranks a favourite
 * brand, so it reads last and stays last.
 *
 * Seeded rather than empty. Every other surface in the app carries mock data, and
 * five headings above five empty rows read as an unfinished form rather than as a
 * profile — the panel could not be judged in the state it will actually ship in.
 *
 * The brands here are the *user's* stated preferences, which is a different claim
 * from the register's logo assignment: saying someone likes Hermès asserts nothing
 * about Hermès. It is the one place in this file where naming a real house needs
 * no caveat.
 */
export interface MockMemorySection {
  id: string;
  label: string;
  /** Short enough to sit on one line as a pill — two or three words, not a phrase. */
  tags: string[];
}

export const mockMemory: MockMemorySection[] = [
  {
    id: "mem1",
    label: "Preferred Aesthetic Types",
    tags: ["Quiet luxury", "Minimal tailoring", "Heritage"],
  },
  {
    id: "mem2",
    label: "Preferred Categories",
    tags: ["Outerwear", "Bags", "Footwear", "Knitwear"],
  },
  {
    id: "mem3",
    label: "Favorite Brands",
    tags: ["Hermès", "Loro Piana", "Bottega Veneta"],
  },
  {
    id: "mem4",
    label: "Tags",
    tags: ["Under $2,000", "Made in Italy", "Ships to India"],
  },
  {
    id: "mem5",
    label: "Values",
    tags: ["No exotic leathers", "Repairable over replaceable"],
  },
];

/**
 * Notifications — what changed while the user was away.
 *
 * Four kinds, and the kind is what the row is *about* rather than a label on it:
 *
 *  - `price` — something being watched moved. The only kind that carries a number, and
 *    the number is the whole message.
 *  - `mission` — an agent found something, or a sweep finished. No product, because a
 *    mission update is about a *set*.
 *  - `list` / `cart` — a piece already set aside changed: back in stock, last one,
 *    price held. These are the ones a shopper acts on immediately.
 *
 * `href` is where the row goes, and every one of them resolves today. A notification
 * that leads nowhere is worse than no notification: it trains people to stop tapping.
 *
 * ## The timestamps are relative, deliberately
 *
 * Written as offsets from module load rather than as dates, because the page groups by
 * recency — Today, Previous 7 days, Older. Hardcoded ISO strings would drift into the
 * wrong bucket the week after they were authored, and the top group would empty out
 * while the fixture still claimed to be fresh.
 *
 * `read` seeds the sidebar badge's two unread. The page owns it from there.
 */
export type NotificationKind = "price" | "mission" | "list" | "cart";

export interface MockNotification {
  id: string;
  kind: NotificationKind;
  /** One line, and it carries the fact. Not "Price drop" — *which* price, and by how much. */
  title: string;
  /** The sentence under it: why this matters, or what to do about it. */
  body: string;
  /** ISO 8601, UTC. Grouped into Today / Previous 7 days / Older for display. */
  updatedAt: string;
  /** Where the row leads. Every one resolves. */
  href: string;
  /** Cover art, where the notification is about a specific piece. */
  image: ImageSource | null;
  focus?: string;
  read: boolean;
}

/**
 * A notification before it has been given a date.
 *
 * The fixture stores an *age* and not a timestamp, and that is a correctness
 * requirement rather than a convenience. It used to hold `updatedAt: hoursAgo(2)`,
 * where `hoursAgo` read `Date.now()` at module scope — and a module in this app is
 * evaluated twice: once in the server process, once again in the browser on every load.
 * The server's copy is fixed at the moment the process booted, the browser's is fixed at
 * the moment the page opened, so the two ISO strings drifted apart by however long the
 * server had been up. Every render of the notifications page was a hydration mismatch,
 * and the longer the server ran the wider it got.
 *
 * Ages cannot drift. They are turned into dates once per request by `notificationsAt`,
 * and that one reading is what both the HTML and the client receive.
 */
type NotificationSeed = Omit<MockNotification, "updatedAt"> & {
  /** How long ago this happened, counted back from whenever the page is served. */
  ageHours: number;
};

const notificationSeeds: NotificationSeed[] = [
  {
    id: "n1",
    kind: "price",
    title: "Kelly 28 Retourné is $1,400 down",
    body: "Now $16,200 at Fashionphile — the lowest it has been since you started watching it.",
    ageHours: 2,
    href: "/missions/m1",
    image: atelierMannequin,
    focus: "object-[50%_40%]",
    read: false,
  },
  {
    id: "n2",
    kind: "mission",
    title: "Three new pieces for A winter coat that isn't black",
    body: "Two coats and a cashmere overshirt, all inside your $2,800 ceiling.",
    ageHours: 5,
    href: "/missions/m1",
    image: null,
    read: false,
  },
  {
    id: "n3",
    kind: "list",
    title: "Oran Sandal is back in your size",
    body: "EU 38 has returned at Hermès. It went in eleven days last time.",
    ageHours: 9,
    href: "/list",
    image: resortSlipTall,
    read: true,
  },
  {
    id: "n4",
    kind: "cart",
    title: "One left of the Cashmere Storm System Coat",
    body: "It has been in your cart for three days. Loro Piana shows a single unit in your size.",
    ageHours: 28,
    href: "/cart",
    image: bridalLight,
    focus: "object-[45%_40%]",
    read: true,
  },
  {
    id: "n5",
    kind: "price",
    title: "Elmira Wool Coat held its price through the sale",
    body: "Still $4,490 at Net-a-Porter. Nothing in the archive suggests it will move again this season.",
    ageHours: 50,
    href: "/list",
    image: poolsideResort,
    read: true,
  },
  {
    id: "n6",
    kind: "mission",
    title: "A winter coat that isn't black swept 40 sellers",
    body: "No new matches this time. Snapi will keep going and only flag what fits.",
    ageHours: 74,
    href: "/missions/m1",
    image: null,
    read: true,
  },
  {
    id: "n7",
    kind: "list",
    title: "Classic Flap Bag moved to a verified seller",
    body: "The listing you saved is now with a seller Snapi has checked out. Papers present.",
    ageHours: 120,
    href: "/list",
    image: heroBackpack,
    focus: "object-[62%_55%]",
    read: true,
  },
  {
    id: "n8",
    kind: "cart",
    title: "Your cart total is $21,340",
    body: "Five pieces, held at today's prices. Two of them are the last in your size.",
    ageHours: 210,
    href: "/cart",
    image: null,
    read: true,
  },
];

/**
 * The notifications as of `now`, newest still newest.
 *
 * Called once per request, in `Providers`, so the timestamps in the server-rendered
 * HTML are the same strings the browser hydrates with — see `NotificationSeed` for what
 * happens when they are not. The parameter exists so that there is exactly one clock
 * reading behind a whole page, rather than one per module instance.
 */
export function notificationsAt(now: number): MockNotification[] {
  return notificationSeeds.map(({ ageHours, ...rest }) => ({
    ...rest,
    updatedAt: new Date(now - ageHours * 60 * 60 * 1000).toISOString(),
  }));
}

/**
 * The notifications for the request being served. ⚠️ Server only.
 *
 * The clock read lives here rather than at the call site, and that is not a way around
 * the lint rule that objected to it — the rule is right. `react-hooks/purity` says a
 * component's render must not read a moving value, because a render that happens twice
 * would produce two answers. What it is pointing at is that this is not a calculation
 * the component performs; it is data the component is *given*, and the fix is to say so.
 *
 * It stands in for `await fetchNotifications()`. When there is a backend this becomes
 * that, asynchronously, and the call site does not otherwise change.
 *
 * Calling it from a client component would put the reading back in the browser and
 * bring back the hydration mismatch this whole arrangement exists to remove — see
 * `NotificationSeed`. There is no `import "server-only"` guard to enforce that because
 * this module is shared with client code by design.
 */
export function currentNotifications(): MockNotification[] {
  return notificationsAt(Date.now());
}

/**
 * Counts that drive sidebar badges.
 *
 * `missions` is the number still open — anything not `done` in `mockMissions`. A
 * badge that counted everything would never go down, which trains people to stop
 * reading it.
 *
 * Notifications used to have an entry here and no longer needs one: that badge counts
 * the unread in `notificationsAt` through `NotificationsProvider`, so it falls as
 * things are read instead of stating a constant the page could contradict.
 */
export const mockCounts = {
  missions: 4,
} as const;

export interface MockRecent {
  id: string;
  title: string;
  modality: SearchModality;
  /** ISO string. Grouped into Today / Previous 7 days / Older for display. */
  updatedAt: string;
}

/**
 * Recent conversations, newest first.
 *
 * Titles are deliberately varied in length: a sidebar that only ever gets
 * short strings in development will truncate badly the first time a real user
 * types a paragraph.
 */
export const mockRecents: MockRecent[] = [
  {
    id: "r1",
    title: "Warm rain jacket under $120, not bulky",
    modality: "text",
    updatedAt: "2026-08-07T09:12:00.000Z",
  },
  {
    id: "r2",
    title: "Those sneakers from the café",
    modality: "image",
    updatedAt: "2026-08-07T07:40:00.000Z",
  },
  {
    id: "r3",
    title: "Noise-cancelling headphones for open offices",
    modality: "voice",
    updatedAt: "2026-08-06T18:05:00.000Z",
  },
  {
    id: "r4",
    title: "Birthday gift, 9-year-old who likes space",
    modality: "text",
    updatedAt: "2026-08-04T14:22:00.000Z",
  },
  {
    id: "r5",
    title: "Standing desk under 60 inches",
    modality: "text",
    updatedAt: "2026-08-02T11:03:00.000Z",
  },
  {
    id: "r6",
    title: "Running shoes for flat feet",
    modality: "text",
    updatedAt: "2026-07-28T16:47:00.000Z",
  },
  {
    id: "r7",
    title:
      "Something to wear to a September wedding in Positano that survives a suitcase and forty degrees",
    modality: "text",
    updatedAt: "2026-07-26T10:19:00.000Z",
  },
  {
    id: "r8",
    title: "This watch, but cheaper",
    modality: "image",
    updatedAt: "2026-07-24T15:33:00.000Z",
  },
  {
    id: "r9",
    title: "Is this Bottega listing real?",
    modality: "url",
    updatedAt: "2026-07-21T08:58:00.000Z",
  },
  {
    id: "r10",
    title: "Linen shirts that don't go see-through",
    modality: "voice",
    updatedAt: "2026-07-18T12:14:00.000Z",
  },
  {
    id: "r11",
    title: "Cashmere care — can this be washed at home?",
    modality: "text",
    updatedAt: "2026-07-15T20:02:00.000Z",
  },
  {
    id: "r12",
    title: "The lamp in this photo",
    modality: "image",
    updatedAt: "2026-07-11T17:26:00.000Z",
  },
  {
    id: "r13",
    title: "Carry-on that fits under a Ryanair seat",
    modality: "text",
    updatedAt: "2026-07-06T09:44:00.000Z",
  },
  {
    id: "r14",
    title: "Price history on this trench",
    modality: "url",
    updatedAt: "2026-06-29T13:51:00.000Z",
  },
  {
    id: "r15",
    title: "Sunglasses for a small face",
    modality: "voice",
    updatedAt: "2026-06-22T18:37:00.000Z",
  },
  {
    id: "r16",
    title: "Wedding guest dress, navy, no sequins",
    modality: "text",
    updatedAt: "2026-06-14T11:08:00.000Z",
  },
];

/* ===========================================================================
 * Missions — standing briefs the agent works in the background
 * ========================================================================= */

/**
 * Where a mission is in its lifecycle.
 *
 *  - `running`  — actively sweeping the merchant network right now.
 *  - `watching` — brief understood, nothing new to report; wakes on a change.
 *  - `found`    — has a match the user has not looked at yet. The only status
 *                 that is really a call to action.
 *  - `done`     — closed by the user, or fulfilled. Kept for reference.
 *
 * Not rendered on the mission grid — the tiles are deliberately spare. It stays
 * on the shape because it is what the mission's own page is built around.
 */
export type MissionStatus = "running" | "watching" | "found" | "done";

export interface MockMission {
  id: string;
  /**
   * The user's own label. Editable — which is exactly why it is stored rather
   * than derived from the brief: renaming must not change what the agent hunts.
   */
  name: string;
  /** The standing instruction the agent works from. */
  brief: string;
  status: MissionStatus;
  /** Ceiling the user set. `null` means no cap was given, not "free". */
  budget: Money | null;
  /**
   * Collections the agent has assembled for this mission — the grouped sets of
   * candidates it surfaces, not individual products. This is the one number the
   * card shows, so it has to mean something on its own.
   */
  collections: number;
  /** ISO 8601, UTC. Not on the card; belongs on the mission's own page. */
  lastSweptAt: string;
  createdAt: string;
  /**
   * Cover art. `null` renders the studio placeholder, which is a finished-looking
   * state — so a mission created in-app is not visibly missing anything.
   */
  image: ImageSource | null;
  /**
   * `object-position` class for the 3:4 card crop. Belongs to the photograph, not
   * the card: if the image moves to another mission, this moves with it.
   */
  focus?: string;
}

/**
 * Exactly one mission, and the count is the design decision.
 *
 * One is enough to show the card, the status chip, the budget and the collections
 * count doing their jobs, and it is what a real account looks like a minute after
 * someone writes their first brief. Five fixtures used to live here and they made the
 * board look like a finished product nobody had used — which hid the two states that
 * actually matter, the empty board and the first card on it. Deleting one mission in
 * the UI still reaches the onboarding, so both are one click apart.
 *
 * `running` rather than `found`, because that is the state that says what a mission
 * *is*: a standing instruction being swept, not a saved search with results attached.
 *
 * The cover is assigned by hand, and it has to be. A `Math.random()` pick renders one
 * image on the server and another on the client — a hydration mismatch — and a
 * different one per request, so the page flickers and never caches. The `focus` below
 * belongs to this photograph, not to this mission: 1600×1066 landscape into a 3:4 box
 * keeps only the middle half of the width, and a centre crop lands beside the subject
 * rather than on her.
 *
 * Every consumer already handles both this and an empty array: `MissionsBoard` seeds
 * its state from it, `/missions/[id]` resolves against it, and `ChatStart` reads it
 * for "In motion".
 */
export const mockMissions: MockMission[] = [
  {
    id: "m1",
    name: "A winter coat that isn't black",
    brief: "Wool or wool-cashmere, mid-calf, camel/oatmeal/charcoal. No logos, no belt.",
    status: "running",
    budget: { amount: 280000, currency: "USD" },
    collections: 3,
    lastSweptAt: "2026-08-18T06:20:00.000Z",
    createdAt: "2026-08-11T19:30:00.000Z",
    image: streetStyleFurCoat,
    focus: "object-[85%_50%]",
  },
];

/* ===========================================================================
 * Home page content
 *
 * Every `image` field is `null` today and typed to accept a URL, so real
 * photography drops in without touching a component. Aspect ratios are already
 * reserved by <MediaFrame />, so nothing reflows when they do.
 * ========================================================================= */

/**
 * Rotating hero prompts.
 *
 * Each is a short, natural-language request of the kind Snapi is meant to
 * accept — deliberately spanning three different visual territories (wet city
 * outerwear / jewellery still-life / leather patina) so the three backdrops
 * won't feel like variations of one photograph.
 *
 * `image` drives the banner's whole treatment. While every entry is `null` the
 * hero keeps its typographic look on the ambient wash; the moment any image is
 * supplied it becomes a photographic banner with a scrim and fixed light type in
 * both themes. See `HeroStage`.
 *
 * Image brief: landscape, ~2400×1400, mid-to-dark. The headline sits over the
 * upper-left, so keep that area quiet.
 */
export interface MockHeroPrompt {
  id: string;
  /** 3–5 words. Longer and it stops reading like something someone would type. */
  text: string;
  image: ImageSource | null;
  /**
   * `object-position` class. Required in practice, not optional polish: the band
   * is ~2:1 on desktop but *portrait* on a phone, so a 2.5:1 source gets cropped
   * to roughly its middle third there. Centre-cropping hero1 that hard loses the
   * subject completely.
   */
  focus?: string;
}

/**
 * Keyed by flavour, because both halves of a prompt change with the edition.
 *
 * The text and the photograph are one unit — "A warm coat under $200" only works
 * over the puffer-jacket shot, and "A trench for Paris rain" only over the fog.
 * An earlier version kept the wording in `FLAVOUR_COPY` and paired it to a shared
 * image list by index; that held only while the two editions shared photography,
 * and broke the moment they did not. Content that must agree belongs in one
 * object.
 *
 * The lists do not have to be the same length — `HeroStage` rotates whatever it
 * is given.
 */
export const mockHeroPrompts: Record<Flavour, MockHeroPrompt[]> = {
  /* Boutique: provenance and permanence, over quiet editorial photography. */
  signature: [
    {
      id: "hp1",
      text: "A trench for Paris rain",
      image: heroRain,
      // Subject stands well right of centre.
      focus: "object-[70%_50%]",
    },
    {
      id: "hp2",
      text: "Quiet gold, nothing loud",
      image: heroTailoring,
      focus: "object-[54%_42%]",
    },
    {
      id: "hp3",
      text: "One bag, worn for decades",
      image: heroBag,
      focus: "object-[46%_55%]",
    },
  ],

  /* Marketplace: budget, occasion and constraint, over everyday photography.
   * All three sources are 1500×1000 (3:2) — narrower than the banner's ~2:1, so
   * they crop horizontally on desktop and hard vertically on a phone. The focus
   * values put the subject right of centre, clear of the headline's upper-left. */
  "all-rounder": [
    {
      id: "ar1",
      text: "A warm coat under $200",
      image: heroPuffer,
      focus: "object-[72%_45%]",
    },
    {
      id: "ar2",
      text: "Something to wear Friday",
      image: heroParty,
      // A group shot: faces sit in the upper half, so the vertical crop is biased
      // up or a phone shows five torsos.
      focus: "object-[55%_38%]",
    },
    {
      id: "ar3",
      text: "A bag that fits a laptop",
      image: heroBackpack,
      focus: "object-[58%_48%]",
    },
  ],
};

/**
 * "The Edit" — the editorial archive.
 *
 * One list serves three surfaces, which is why the shape carries more than any
 * single one of them renders: the home bento takes the first five, `/edit` lays
 * out all of them as a magazine, and `/edit/[slug]` resolves any of them into a
 * workspace. Splitting it would mean a story that exists on the index and 404s
 * when opened.
 *
 * Ordered newest first.
 */
export interface MockEditStory {
  id: string;
  slug: string;
  title: string;
  /**
   * The deck — the line under the headline that says what the piece argues.
   * Rendered on `/edit`, where a headline alone is not enough to choose from
   * twenty-two; the home bento omits it for space.
   */
  standfirst: string;
  category: string;
  author: string;
  /** ISO 8601, UTC. Rendered with `formatDate`, which pins the zone. */
  publishedAt: string;
  readMinutes: number;
  /**
   * `null` on purpose for the dispatch column — those are text-only by design, so
   * the eye has somewhere to rest between image blocks. Not a missing asset.
   */
  image: ImageSource | null;
  /**
   * `object-position` class, only where a centre crop would cut the subject.
   * Belongs to the photo, not the card — if the image moves slots, this moves
   * with it.
   */
  focus?: string;
}

/**
 * Photo assignment is fixed, not shuffled.
 *
 * A `Math.random()` pick would render a different image on the server than on the
 * client (hydration mismatch) and a different one on every request, so the page
 * would flicker and never cache. Where an image is meant to vary, it has to come
 * from a stable seed or the data layer — never from render-time randomness.
 *
 * Within that constraint the pairing is by *crop*, not by subject, since content
 * matching was explicitly not required: the exact 2:3 source takes the portrait
 * feature slot, the only landscape source takes a landscape slot, and the
 * remaining portraits go where their centre crop survives. Two content matches
 * came free (fur coat → outerwear, gold-toned backdrop → quiet gold) and were
 * kept.
 */
export const mockEditStories: MockEditStory[] = [
  {
    id: "e1",
    slug: "handbags-defining-modern-elegance",
    title: "5 Handbags Defining Modern Elegance",
    standfirst:
      "Five shapes that have outlasted the trend cycle, and what each of them actually solves.",
    category: "Accessories",
    author: "Marguerite Vaillant",
    publishedAt: "2026-08-04T09:00:00.000Z",
    readMinutes: 6,
    // 1202×1800 — a true 2:3, so the feature card crops nothing.
    image: atelierMannequin,
  },
  {
    id: "e2",
    slug: "tailoring-refined",
    title: "Tailoring, Refined",
    standfirst:
      "The shoulder is the tell. A cutter in Savile Row explains what to look at before the label.",
    category: "Menswear",
    author: "Idris Okonjo",
    publishedAt: "2026-07-29T09:00:00.000Z",
    readMinutes: 4,
    image: bridalLight,
    // Subject sits slightly right of centre; nudged so she survives the 4:3 crop.
    focus: "object-[58%_38%]",
  },
  {
    id: "e3",
    slug: "the-case-for-quiet-gold",
    title: "The Case for Quiet Gold",
    standfirst: "Why the pieces that read as heirlooms are almost never the loudest in the case.",
    category: "Jewellery",
    author: "Anneke de Vries",
    publishedAt: "2026-07-22T09:00:00.000Z",
    readMinutes: 5,
    image: sneakersStudio,
    // Shot is framed low — the shoes are near the bottom edge. A centre crop into
    // 4:3 would keep the shins and lose the product entirely.
    focus: "object-[50%_74%]",
  },
  {
    id: "e4",
    slug: "winter-outerwear-considered",
    title: "Winter Outerwear, Considered",
    standfirst: "Weight, drape, and the honest cost of a coat you intend to keep for a decade.",
    category: "Outerwear",
    author: "Marguerite Vaillant",
    publishedAt: "2026-07-15T09:00:00.000Z",
    readMinutes: 7,
    // 1600×1066 — the only landscape source, so it goes in a landscape slot.
    image: streetStyleFurCoat,
  },
  {
    id: "e5",
    slug: "watches-that-hold-their-value",
    title: "Watches That Hold Their Value",
    standfirst:
      "Reference numbers, service papers, and the four questions that decide the resale floor.",
    category: "Watches",
    author: "Tomás Regueiro",
    publishedAt: "2026-07-08T09:00:00.000Z",
    readMinutes: 8,
    image: poolsideResort,
    focus: "object-[50%_42%]",
  },
  {
    id: "e6",
    slug: "the-long-life-of-a-good-coat",
    title: "The Long Life of a Good Coat",
    standfirst:
      "Thirty years of one gabardine, told through its repairs. What wears out first is never the fabric.",
    category: "Outerwear",
    author: "Idris Okonjo",
    publishedAt: "2026-07-01T09:00:00.000Z",
    readMinutes: 9,
    image: heroRain,
    focus: "object-[62%_45%]",
  },
  {
    id: "e7",
    slug: "our-story",
    title: "Our Story",
    standfirst:
      "The piece you want exists — in stock, at a fair price, from a seller worth trusting. Finding it should not take six tabs and a leap of faith. That is the whole reason Snapi exists.",
    // The house's own note, which is why the category is the house. It sits in
    // the closer slot on `/edit` deliberately: a publication signs off in its own
    // voice, and it is the one place on the page that is not someone else's story.
    category: "Snapi",
    author: "Snapi",
    publishedAt: "2026-06-24T09:00:00.000Z",
    readMinutes: 6,
    image: heroTailoring,
    focus: "object-[52%_42%]",
  },
  {
    id: "e8",
    slug: "one-bag-twenty-years",
    title: "One Bag, Twenty Years",
    standfirst:
      "Patina is the only finish that cannot be bought. A leather conservator on what ages well and what merely gets old.",
    category: "Accessories",
    author: "Anneke de Vries",
    publishedAt: "2026-06-17T09:00:00.000Z",
    readMinutes: 5,
    image: heroBag,
    focus: "object-[48%_52%]",
  },
  {
    id: "e9",
    slug: "how-to-read-a-cashmere-label",
    title: "How to Read a Cashmere Label",
    standfirst:
      "Ply, gauge, micron, origin — and which of the four the price is actually tracking.",
    category: "Knitwear",
    author: "Anneke de Vries",
    publishedAt: "2026-06-10T09:00:00.000Z",
    readMinutes: 3,
    image: null,
  },
  {
    id: "e10",
    slug: "the-sole-that-outlives-the-shoe",
    title: "The Sole That Outlives the Shoe",
    standfirst:
      "Welted, blake, or glued. A cobbler on which of the three is worth resoling twice, and how to tell them apart in a listing photograph.",
    category: "Shoes",
    author: "Idris Okonjo",
    publishedAt: "2026-06-03T09:00:00.000Z",
    readMinutes: 4,
    image: null,
  },
  {
    id: "e11",
    slug: "wax-wool-or-down",
    title: "Wax, Wool, or Down",
    standfirst:
      "Three coats for the same winter, and the weather each is honestly built for. Only one of them survives real rain.",
    category: "Outerwear",
    author: "Marguerite Vaillant",
    publishedAt: "2026-05-27T09:00:00.000Z",
    readMinutes: 3,
    image: null,
  },
  {
    id: "e12",
    slug: "ateliers-we-visited-this-year",
    title: "The Ateliers We Visited This Year",
    standfirst:
      "Eleven workrooms across five countries, and the quiet argument each of them makes for doing it slowly.",
    category: "Craft",
    author: "Tomás Regueiro",
    publishedAt: "2026-05-20T09:00:00.000Z",
    readMinutes: 11,
    image: null,
  },
  // ── The three remaining photographs ──────────────────────────────────────
  // Every other shoot in the asset set is already above. `sneakers-tall` and
  // `resort-slip-tall` look like two more but are portrait crops of
  // `sneakers-studio` and `poolside-resort`, so using them would put the same
  // picture on the page twice. These three are the archive's real ceiling for
  // picture-led stories; everything after them is text-only by necessity as much
  // as by design.
  {
    id: "e13",
    slug: "colour-used-sparingly",
    title: "Colour, Used Sparingly",
    standfirst:
      "One saturated piece against an otherwise neutral wardrobe does more work than six. Where to spend the single note.",
    category: "Style",
    author: "Anneke de Vries",
    publishedAt: "2026-05-13T09:00:00.000Z",
    readMinutes: 4,
    image: heroPuffer,
    focus: "object-[66%_38%]",
  },
  {
    id: "e14",
    slug: "dressing-for-the-wedding",
    title: "Dressing for the Wedding",
    standfirst:
      "Black tie, cocktail, and the phrase 'smart casual' on an invitation — what each is actually asking for, and the one piece that answers all three.",
    category: "Wedding",
    author: "Marguerite Vaillant",
    publishedAt: "2026-05-06T09:00:00.000Z",
    readMinutes: 5,
    image: heroParty,
    focus: "object-[52%_35%]",
  },
  {
    id: "e15",
    slug: "the-everyday-carry-reconsidered",
    title: "The Everyday Carry, Reconsidered",
    standfirst:
      "A laptop, a notebook, and the eleven hours in between. What a bag has to survive before it has earned the commute.",
    category: "Accessories",
    author: "Idris Okonjo",
    publishedAt: "2026-04-29T09:00:00.000Z",
    readMinutes: 4,
    image: heroBackpack,
    focus: "object-[62%_55%]",
  },
  // ── Departments ──────────────────────────────────────────────────────────
  // Text-only, and deliberately shorter in the standfirst: these render as a
  // compact index rather than as cards, so a three-line deck would break the
  // column's rhythm.
  {
    id: "e16",
    slug: "what-a-lining-tells-you",
    title: "What a Lining Tells You",
    standfirst:
      "Bemberg, viscose, or none at all — the cheapest place to find out what a jacket really cost to make.",
    category: "Tailoring",
    author: "Idris Okonjo",
    publishedAt: "2026-04-22T09:00:00.000Z",
    readMinutes: 3,
    image: null,
  },
  {
    id: "e17",
    slug: "buying-vintage-without-guessing",
    title: "Buying Vintage Without Guessing",
    standfirst: "Six checks that take two minutes each and settle almost every listing.",
    category: "Archive",
    author: "Tomás Regueiro",
    publishedAt: "2026-04-15T09:00:00.000Z",
    readMinutes: 6,
    image: null,
  },
  {
    id: "e18",
    slug: "the-fourth-black-jumper",
    title: "The Fourth Black Jumper",
    standfirst:
      "On the quiet arithmetic of buying the same thing again, and when it is the right call.",
    category: "Knitwear",
    author: "Anneke de Vries",
    publishedAt: "2026-04-08T09:00:00.000Z",
    readMinutes: 4,
    image: null,
  },
  {
    id: "e19",
    slug: "sizing-across-borders",
    title: "Sizing, Across Borders",
    standfirst:
      "An Italian 50, a UK 40, and a Japanese L are three different garments. Measure, do not convert.",
    category: "Fit",
    author: "Marguerite Vaillant",
    publishedAt: "2026-04-01T09:00:00.000Z",
    readMinutes: 3,
    image: null,
  },
  {
    id: "e20",
    slug: "when-a-sale-is-not-a-saving",
    title: "When a Sale Is Not a Saving",
    standfirst:
      "Reference prices, seasonal cycles, and the discount that was written into the ticket in advance.",
    category: "Market",
    author: "Tomás Regueiro",
    publishedAt: "2026-03-25T09:00:00.000Z",
    readMinutes: 5,
    image: null,
  },
  {
    id: "e21",
    slug: "care-labels-translated",
    title: "Care Labels, Translated",
    standfirst: "Nine symbols, plain English, and the two that are worth ignoring.",
    category: "Craft",
    author: "Anneke de Vries",
    publishedAt: "2026-03-18T09:00:00.000Z",
    readMinutes: 2,
    image: null,
  },
  {
    id: "e22",
    slug: "the-second-hand-question",
    title: "The Second-Hand Question",
    standfirst:
      "What resale is good at, what it is not, and the categories where it is simply the better buy.",
    category: "Market",
    author: "Idris Okonjo",
    publishedAt: "2026-03-11T09:00:00.000Z",
    readMinutes: 7,
    image: null,
  },
];

/**
 * The letter that opens the issue.
 *
 * Prose, not a card. Every other block on `/edit` is a link to somewhere else;
 * this one is the only place the house speaks in its own voice at length, and it
 * uses it to say what Snapi actually does — which is the one thing a page of
 * headlines cannot tell a first-time reader.
 *
 * Written against features that exist: seller counts, price history, missions.
 * A letter that promises capabilities the product does not have is the fastest
 * way to make everything else on the page read as marketing too.
 *
 * Paragraphs as an array rather than one string with newlines: the renderer needs
 * real `<p>` elements to get the spacing and the reading rhythm right, and
 * splitting prose on `\n` in a component is the kind of thing that survives right
 * up until someone writes a line break into the copy.
 */
export interface MockEditorsLetter {
  eyebrow: string;
  title: string;
  paragraphs: string[];
}

export const mockEditorsLetter: MockEditorsLetter = {
  eyebrow: "From the desk",
  title: "An assistant, not a search box",
  paragraphs: [
    "Every piece in this issue is already for sale somewhere. Finding one was never the hard part — finding the right one, in your size, from a seller worth trusting, at a price that is not quietly last season's, is.",
    "That is the work Snapi does. Describe what you are after in a sentence and it reads the listings the way a good buyer would: who genuinely has stock, what the piece was going for last month, which sellers ship without a story, and whether the version in front of you is the one the review was written about.",
    "It keeps watching after you close the tab. A mission holds the thing you are still deciding on, and Snapi comes back when the price moves or your size appears. Nothing arrives that you did not ask for.",
  ],
};

/**
 * The pull-quote band.
 *
 * One line, set larger than anything else on the page except the masthead. It is
 * lifted from a piece that appears elsewhere on the index but is *not* that
 * piece's standfirst — a quote that repeats the deck two rows above reads as a
 * templating bug rather than as emphasis.
 *
 * Unattributed on purpose, so the shape is one field. It reads as the
 * publication's own line rather than as a quotation from a named writer, which is
 * why there is nowhere here to put a byline or a source link.
 */
export interface MockPullQuote {
  quote: string;
}

export const mockEditPullQuote: MockPullQuote = {
  quote: "The best thing you can say about a coat is that you eventually stopped noticing it.",
};

/**
 * Designer brands.
 *
 * `logo` stays null until a real asset exists; `monogram` is the fallback and is
 * authored per brand rather than derived from the name — "Louis Vuitton" must
 * render "LV", which no slicing rule gets right for every maison.
 *
 * A logo is only ever set on the maison it actually belongs to. Unlike the
 * editorial covers — decorative photography, freely reassignable — a trademark
 * asserts identity: Gucci's mark beside "Hermès" is a false statement about who
 * sells what, and mock data has a habit of shipping. Brands without an asset show
 * their monogram, which is a deliberate designed state, not a gap.
 *
 * Source logo files from official brand asset kits or the merchant feed. Do not
 * scrape them: resolution is unreliable and usage terms usually are not met.
 */
/**
 * A maison, as Snapi actually knows it: a mark and a name.
 *
 * Deliberately nothing else. Founding year, house, city — none of that comes
 * through a merchant feed, and carrying a field the product cannot fill is how a
 * UI ends up designed around information that will never arrive.
 *
 * `monogram` is not extra information; it is a rendering of the name for when no
 * artwork exists. `slug` is the URL. Two facts, three fields.
 */
export interface MockBrand {
  id: string;
  slug: string;
  name: string;
  monogram: string;
  logo: ImageSource | null;
}

/**
 * ⚠️ PLACEHOLDER_LOGOS — MUST NOT SHIP. Search this token to strip it.
 *
 * Only three logo assets exist (Gucci, Louis Vuitton, Versace). To fill the
 * register for design review, those three are repeated across the other
 * thirty-four maisons — so thirty-four plates currently show the wrong house's
 * trademark.
 *
 * That is a misattribution, not a styling placeholder: it tells a customer that
 * Hermès' mark is Gucci's. Before this is exposed to any real traffic, either
 * supply the missing assets or set those `logo` fields back to `null`, which
 * renders the monogram fallback — a finished-looking state that the plate and the
 * home tile both already handle.
 *
 * The three brands that own their mark keep it correctly — that costs nothing.
 *
 * Distribution is fixed rather than randomised: a `Math.random()` pick would
 * render one mark on the server and another in the browser (a hydration mismatch)
 * and a different one on every request. The three are cycled in alphabetical
 * order so no two identical marks land side by side in the grid.
 */
export const mockBrands: MockBrand[] = [
  {
    id: "b1",
    slug: "hermes",
    name: "Hermès",
    monogram: "H",
    logo: logoGucci, // PLACEHOLDER_LOGOS
  },
  {
    id: "b2",
    slug: "louis-vuitton",
    name: "Louis Vuitton",
    monogram: "LV",
    logo: logoLouisVuitton, // correct
  },
  {
    id: "b3",
    slug: "burberry",
    name: "Burberry",
    monogram: "B",
    logo: logoVersace, // PLACEHOLDER_LOGOS
  },
  {
    id: "b4",
    slug: "cartier",
    name: "Cartier",
    monogram: "C",
    logo: logoLouisVuitton, // PLACEHOLDER_LOGOS
  },
  {
    id: "b5",
    slug: "chanel",
    name: "Chanel",
    monogram: "CC",
    logo: logoVersace, // PLACEHOLDER_LOGOS
  },
  {
    id: "b6",
    slug: "gucci",
    name: "Gucci",
    monogram: "GG",
    logo: logoGucci, // correct
  },
  {
    id: "b7",
    slug: "prada",
    name: "Prada",
    monogram: "P",
    logo: logoGucci, // PLACEHOLDER_LOGOS
  },
  {
    id: "b8",
    slug: "dior",
    name: "Dior",
    monogram: "D",
    logo: logoLouisVuitton, // PLACEHOLDER_LOGOS
  },
  {
    id: "b9",
    slug: "bottega-veneta",
    name: "Bottega Veneta",
    monogram: "BV",
    logo: logoVersace, // PLACEHOLDER_LOGOS
  },
  {
    id: "b10",
    slug: "saint-laurent",
    name: "Saint Laurent",
    monogram: "SL",
    logo: logoLouisVuitton, // PLACEHOLDER_LOGOS
  },
  {
    id: "b11",
    slug: "versace",
    name: "Versace",
    monogram: "V",
    logo: logoVersace, // correct
  },
  {
    id: "b12",
    slug: "loro-piana",
    name: "Loro Piana",
    monogram: "LP",
    logo: logoGucci, // PLACEHOLDER_LOGOS
  },

  /*
   * The rest of the directory. Every one carries a borrowed mark — see the
   * PLACEHOLDER_LOGOS warning above. The three assets are cycled in alphabetical
   * order, which is what keeps identical marks off the same grid row.
   */
  { id: "b13", slug: "alaia", name: "Alaïa", monogram: "A", logo: logoVersace }, // PLACEHOLDER_LOGOS
  { id: "b14", slug: "balenciaga", name: "Balenciaga", monogram: "B", logo: logoGucci }, // PLACEHOLDER_LOGOS
  {
    id: "b15",
    slug: "brunello-cucinelli",
    name: "Brunello Cucinelli",
    monogram: "BC",
    logo: logoLouisVuitton,
  }, // PLACEHOLDER_LOGOS
  { id: "b16", slug: "celine", name: "Celine", monogram: "C", logo: logoVersace }, // PLACEHOLDER_LOGOS
  { id: "b17", slug: "chloe", name: "Chloé", monogram: "C", logo: logoGucci }, // PLACEHOLDER_LOGOS
  {
    id: "b18",
    slug: "dolce-gabbana",
    name: "Dolce & Gabbana",
    monogram: "D&G",
    logo: logoLouisVuitton,
  }, // PLACEHOLDER_LOGOS
  { id: "b19", slug: "fendi", name: "Fendi", monogram: "F", logo: logoVersace }, // PLACEHOLDER_LOGOS
  { id: "b20", slug: "ferragamo", name: "Ferragamo", monogram: "SF", logo: logoGucci }, // PLACEHOLDER_LOGOS
  {
    id: "b21",
    slug: "giorgio-armani",
    name: "Giorgio Armani",
    monogram: "GA",
    logo: logoLouisVuitton,
  }, // PLACEHOLDER_LOGOS
  { id: "b22", slug: "givenchy", name: "Givenchy", monogram: "G", logo: logoVersace }, // PLACEHOLDER_LOGOS
  { id: "b23", slug: "jacquemus", name: "Jacquemus", monogram: "J", logo: logoGucci }, // PLACEHOLDER_LOGOS
  { id: "b24", slug: "jil-sander", name: "Jil Sander", monogram: "JS", logo: logoLouisVuitton }, // PLACEHOLDER_LOGOS
  { id: "b25", slug: "khaite", name: "Khaite", monogram: "K", logo: logoVersace }, // PLACEHOLDER_LOGOS
  { id: "b26", slug: "lanvin", name: "Lanvin", monogram: "L", logo: logoGucci }, // PLACEHOLDER_LOGOS
  { id: "b27", slug: "loewe", name: "Loewe", monogram: "L", logo: logoLouisVuitton }, // PLACEHOLDER_LOGOS
  { id: "b28", slug: "max-mara", name: "Max Mara", monogram: "MM", logo: logoVersace }, // PLACEHOLDER_LOGOS
  { id: "b29", slug: "miu-miu", name: "Miu Miu", monogram: "MM", logo: logoGucci }, // PLACEHOLDER_LOGOS
  { id: "b30", slug: "moncler", name: "Moncler", monogram: "M", logo: logoLouisVuitton }, // PLACEHOLDER_LOGOS
  { id: "b31", slug: "patek-philippe", name: "Patek Philippe", monogram: "PP", logo: logoVersace }, // PLACEHOLDER_LOGOS
  { id: "b32", slug: "rolex", name: "Rolex", monogram: "R", logo: logoGucci }, // PLACEHOLDER_LOGOS
  {
    id: "b33",
    slug: "stella-mccartney",
    name: "Stella McCartney",
    monogram: "SM",
    logo: logoLouisVuitton,
  }, // PLACEHOLDER_LOGOS
  // Files under T, not R — the article is part of the name, as every stockist
  // that carries it lists it.
  { id: "b34", slug: "the-row", name: "The Row", monogram: "TR", logo: logoVersace }, // PLACEHOLDER_LOGOS
  { id: "b35", slug: "tom-ford", name: "Tom Ford", monogram: "TF", logo: logoGucci }, // PLACEHOLDER_LOGOS
  { id: "b36", slug: "valentino", name: "Valentino", monogram: "V", logo: logoLouisVuitton }, // PLACEHOLDER_LOGOS
  { id: "b37", slug: "zegna", name: "Zegna", monogram: "Z", logo: logoVersace }, // PLACEHOLDER_LOGOS
];

/** "More For You" — merchandising entry points. */
export interface MockCollection {
  id: string;
  slug: string;
  title: string;
  copy: string;
  /**
   * Optional scarcity/status marker. No longer rendered on the home grid — kept
   * because it belongs on the collection's own page, so the shape stays correct
   * for it.
   */
  tag: string | null;
  image: ImageSource | null;
  /**
   * `object-position` class. Not optional polish on this card: it is 16:10 on a
   * phone and 4:5 from `sm` up, so a portrait source is cropped along *opposite*
   * axes at the two sizes and one centre crop cannot serve both. Belongs to the
   * photograph, not the card.
   */
  focus?: string;
}

export const mockCollections: MockCollection[] = [
  {
    id: "c1",
    slug: "private-selection",
    title: "Private Selection",
    copy: "Invitation-only pieces from partner boutiques.",
    tag: null,
    image: atelierMannequin,
    focus: "object-[50%_40%]",
  },
  {
    id: "c2",
    slug: "seasonal-highlights",
    title: "Seasonal Highlights",
    copy: "What the maisons are leading with this season.",
    tag: null,
    image: poolsideResort,
    focus: "object-[50%_42%]",
  },
  {
    id: "c3",
    slug: "limited-availability",
    title: "Limited Availability",
    copy: "Single-unit stock across our merchant network.",
    tag: null,
    image: bridalLight,
    focus: "object-[45%_50%]",
  },
  {
    id: "c4",
    slug: "newly-listed",
    title: "Newly Listed",
    copy: "Added to Snapi in the last seven days.",
    tag: null,
    image: sneakersStudio,
    // Framed low — pushed down hard so the shoes survive both crops. At 16:10 the
    // card keeps only 38% of this source's height.
    focus: "object-[50%_78%]",
  },
];

/* ===========================================================================
 * Snapi List — saved pieces
 * ========================================================================= */

export interface MockSavedItem {
  id: string;
  slug: string;
  brand: string;
  name: string;
  /**
   * Integer minor units plus a currency, per `Money` — never a float. A cart
   * total built from floats drifts, and a bare number breaks the first time a
   * second market is added.
   */
  price: Money;
  /** ISO 8601, UTC. Rendered with `formatDate`, which pins the zone. */
  savedAt: string;
  image: ImageSource | null;
  /**
   * `object-position` class, only where a centre crop would cut the subject.
   * Belongs to the photo, not the card — if the image moves slots, this moves
   * with it. Absent on the sources already shot portrait, which the tile's 4:5
   * frame barely crops at all.
   */
  focus?: string;
}

export const mockSavedItems: MockSavedItem[] = [
  {
    id: "s1",
    slug: "burberry-kensington-heritage-trench",
    brand: "Burberry",
    name: "Kensington Heritage Trench Coat",
    price: { amount: 219000, currency: "USD" },
    savedAt: "2026-07-12T10:04:00.000Z",
    image: heroRain,
    focus: "object-[66%_45%]",
  },
  {
    id: "s2",
    slug: "loro-piana-baby-cashmere-scarf",
    brand: "Loro Piana",
    name: "Baby Cashmere Scarf",
    price: { amount: 127500, currency: "USD" },
    savedAt: "2026-07-28T16:41:00.000Z",
    image: streetStyleFurCoat,
    focus: "object-[60%_38%]",
  },
  {
    id: "s3",
    slug: "cartier-love-bracelet-yellow-gold",
    brand: "Cartier",
    name: "Love Bracelet",
    price: { amount: 735000, currency: "USD" },
    savedAt: "2026-08-01T09:15:00.000Z",
    image: heroParty,
    focus: "object-[52%_35%]",
  },
  {
    id: "s4",
    slug: "bottega-veneta-cassette-intrecciato",
    brand: "Bottega Veneta",
    name: "Cassette Intrecciato Bag",
    price: { amount: 390000, currency: "USD" },
    savedAt: "2026-08-04T19:02:00.000Z",
    image: heroBag,
    focus: "object-[48%_50%]",
  },
  {
    id: "s5",
    slug: "prada-brushed-leather-loafers",
    brand: "Prada",
    name: "Brushed Leather Loafers",
    price: { amount: 105000, currency: "USD" },
    savedAt: "2026-08-06T08:30:00.000Z",
    image: sneakersStudio,
    focus: "object-[50%_74%]",
  },
  {
    id: "s6",
    slug: "hermes-oran-sandal",
    brand: "Hermès",
    name: "Oran Sandal",
    price: { amount: 79000, currency: "USD" },
    savedAt: "2026-07-22T11:20:00.000Z",
    image: resortSlipTall,
  },
  {
    id: "s7",
    slug: "chanel-classic-flap-medium",
    brand: "Chanel",
    name: "Classic Flap Bag",
    price: { amount: 1080000, currency: "USD" },
    savedAt: "2026-07-19T14:55:00.000Z",
    image: heroBackpack,
    focus: "object-[62%_55%]",
  },
  {
    id: "s8",
    slug: "dior-book-tote",
    brand: "Dior",
    name: "Book Tote",
    price: { amount: 350000, currency: "USD" },
    savedAt: "2026-07-16T07:48:00.000Z",
    image: atelierMannequin,
    focus: "object-[50%_40%]",
  },
  {
    id: "s9",
    slug: "saint-laurent-le-smoking-blazer",
    brand: "Saint Laurent",
    name: "Le Smoking Wool Blazer",
    price: { amount: 329000, currency: "USD" },
    savedAt: "2026-07-09T18:12:00.000Z",
    image: heroTailoring,
    focus: "object-[54%_42%]",
  },
  {
    id: "s10",
    slug: "gucci-horsebit-1955-shoulder",
    brand: "Gucci",
    name: "Horsebit 1955 Shoulder Bag",
    price: { amount: 298000, currency: "USD" },
    savedAt: "2026-07-05T09:03:00.000Z",
    image: bridalLight,
    focus: "object-[45%_40%]",
  },
  {
    id: "s11",
    slug: "louis-vuitton-capucines-bb",
    brand: "Louis Vuitton",
    name: "Capucines BB",
    price: { amount: 670000, currency: "USD" },
    savedAt: "2026-06-30T13:37:00.000Z",
    image: heroPuffer,
    focus: "object-[66%_38%]",
  },
  {
    id: "s12",
    slug: "versace-medusa-biggie-sunglasses",
    brand: "Versace",
    name: "Medusa Biggie Sunglasses",
    // Deliberately not a whole amount — exercises the decimal branch in the
    // price formatter, which every other item here would hide.
    price: { amount: 41550, currency: "USD" },
    savedAt: "2026-06-24T16:29:00.000Z",
    image: heroParty,
    focus: "object-[52%_35%]",
  },
  {
    id: "s13",
    slug: "prada-re-nylon-gabardine-cap",
    brand: "Prada",
    name: "Re-Nylon Gabardine Cap",
    price: { amount: 56000, currency: "USD" },
    savedAt: "2026-06-18T10:41:00.000Z",
    image: streetStyleFurCoat,
    focus: "object-[60%_38%]",
  },
  {
    id: "s14",
    slug: "loro-piana-summer-charms-walk",
    brand: "Loro Piana",
    name: "Summer Charms Walk Loafers",
    price: { amount: 119500, currency: "USD" },
    savedAt: "2026-06-11T12:06:00.000Z",
    image: sneakersTall,
  },
];

/**
 * The cart — five pieces, and five is the point.
 *
 * A cart is a decision that has nearly been made, so it is short by nature. The
 * fixture is deliberately a subset of the saved list rather than its own inventory:
 * these are pieces that were set aside and then chosen, which is the actual path
 * through the product, and it means the two pages share photography instead of
 * doubling the asset budget to look different.
 *
 * Typed as `MockSavedItem` rather than a `MockCartItem` twin, because today a cart
 * line and a saved line carry exactly the same fields and a second identical interface
 * would be two things to keep in step for no gain. `savedAt` reads as "added" here —
 * the tile's label is a prop for that reason. When quantity, size and a reserved price
 * arrive, that is the moment the cart earns its own type, and the field that forces it
 * will be quantity.
 *
 * Dates are recent by design: a cart holding something added two months ago is an
 * abandoned cart, which is a different screen with different copy.
 */
export const mockCartItems: MockSavedItem[] = [
  {
    id: "c1",
    slug: "burberry-kensington-heritage-trench",
    brand: "Burberry",
    name: "Kensington Heritage Trench Coat",
    price: { amount: 219000, currency: "USD" },
    savedAt: "2026-08-18T09:12:00.000Z",
    image: heroRain,
    focus: "object-[66%_45%]",
  },
  {
    id: "c2",
    slug: "chanel-classic-flap-medium",
    brand: "Chanel",
    name: "Classic Flap Bag",
    price: { amount: 1080000, currency: "USD" },
    savedAt: "2026-08-16T18:40:00.000Z",
    image: heroBackpack,
    focus: "object-[62%_55%]",
  },
  {
    id: "c3",
    slug: "cartier-love-bracelet-yellow-gold",
    brand: "Cartier",
    name: "Love Bracelet",
    price: { amount: 735000, currency: "USD" },
    savedAt: "2026-08-14T11:05:00.000Z",
    image: heroParty,
    focus: "object-[52%_35%]",
  },
  {
    id: "c4",
    slug: "loro-piana-baby-cashmere-scarf",
    brand: "Loro Piana",
    name: "Baby Cashmere Scarf",
    price: { amount: 127500, currency: "USD" },
    savedAt: "2026-08-11T15:28:00.000Z",
    image: streetStyleFurCoat,
    focus: "object-[60%_38%]",
  },
  {
    id: "c5",
    slug: "hermes-oran-sandal",
    brand: "Hermès",
    name: "Oran Sandal",
    price: { amount: 79000, currency: "USD" },
    savedAt: "2026-08-08T08:02:00.000Z",
    image: resortSlipTall,
  },
];

/* ===========================================================================
 * Workspace — the full-screen chat + products surface
 * ========================================================================= */

/**
 * One turn in a conversation.
 *
 * `snapi` rather than `assistant`: the role is rendered, and the surrounding UI
 * calls the agent by name everywhere else.
 */
export interface MockMessage {
  id: string;
  role: "user" | "snapi";
  body: string;
}

/**
 * A product Snapi has surfaced.
 *
 * `matchNote` is the differentiator made visible — *why* this was returned, in the
 * user's own terms. Without it a result grid is indistinguishable from a search
 * page, and the whole premise is that the match is explainable rather than magic.
 */
/**
 * What a piece *is*, for filing rather than for describing.
 *
 * A closed set, and the closedness is the point: a mission's collections are these
 * groups, so a free-text category would produce "Bags", "bags" and "Handbags" as three
 * separate collections within a week. Seven buckets is also about the resolution a
 * shopper thinks at — "Outerwear" is a decision, "Wool coats" is a filter.
 *
 * Ordered as a wardrobe is built rather than alphabetically, and `MISSION_CATEGORY_ORDER`
 * relies on that: the collections on a mission read in this order every time, so the
 * page does not rearrange itself as pieces are added.
 */
export type ProductCategory =
  "Outerwear" | "Tailoring" | "Bags" | "Shoes" | "Jewellery" | "Watches" | "Accessories";

/** Declaration order is display order — see `ProductCategory`. */
export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  "Outerwear",
  "Tailoring",
  "Bags",
  "Shoes",
  "Jewellery",
  "Watches",
  "Accessories",
];

export interface MockProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  /**
   * Which collection this lands in when it is added to a mission.
   *
   * Stored, not inferred from the name. A word list ("coat", "loafer", "bag") files
   * "Cashmere Storm System Coat" correctly and "Kelly 28 Retourné" not at all, and the
   * failure is silent — the piece just turns up in the wrong collection. A real feed
   * supplies a category or a taxonomy id; this is that field.
   */
  category: ProductCategory;
  price: Money;
  /** Where it is actually buyable. Trust matters more than price on resale. */
  merchant: string;
  /**
   * ⚠️ The merchant's *homepage*, not this listing.
   *
   * A real feed supplies a deep link to the product itself, and that is what belongs
   * here. These are bare domains on purpose: inventing a path on a real retailer's
   * site produces a URL that 404s for anyone who clicks it, and a Buy button that
   * lands on an error page is worse than one that lands on a homepage.
   *
   * Same class of caveat as `PLACEHOLDER_LOGOS`. These are genuine houses named as
   * the seller of mock inventory they may not carry, so the pairing is a claim the
   * data cannot back. Fine for a design review, not fine in front of traffic —
   * replace with feed URLs before launch.
   */
  vendorUrl: string;
  /** One line on why this answers the brief. */
  matchNote: string;
  /**
   * Catalogue prose — what the piece *is*, in two or three sentences.
   *
   * Distinct from `matchNote`, and the difference is load-bearing: the note is Snapi's
   * argument for why this answers *your* brief, and would read differently for a
   * different search. This is the listing's own description and does not change.
   */
  description: string;
  /**
   * The facts a buyer decides on, in the order they decide on them.
   *
   * A list rather than named fields, because a coat has a back length and a watch has
   * a case width, and a schema with `caseWidth` on a coat is a schema that will be
   * fought. The labels are the seller's; the renderer only lines them up.
   *
   * These are also the rows `ProductComparison` should read once it can — see the note
   * there about having only price to compare on.
   */
  details: Array<{ label: string; value: string }>;
  /** Scarcity or condition marker. `null` for most — a badge on everything is wallpaper. */
  badge: string | null;
  image: ImageSource | null;
  /**
   * Width ÷ height, when it cannot be inferred from the image itself.
   *
   * Required for remote URLs. The card decides whether to crop or contain from
   * this — without it every image is assumed to fit the tile and a banner-shaped
   * merchant asset gets two thirds of itself cropped away. Same contract note as
   * `MockPromo.ratio`.
   */
  ratio?: number;
  /** `object-position`. Only applies when the image is cropped, never when contained. */
  focus?: string;
}

/**
 * Photography is reused across products.
 *
 * Unlike the brand logos, these are decorative crops rather than trademarks, so
 * repeating one across two products misattributes nothing — the same licence that
 * let The Edit borrow them applies here.
 */
export const mockProducts: MockProduct[] = [
  {
    id: "pr1",
    category: "Bags",
    description:
      "A Kelly 25 in sellier construction — the stiffer of the two builds, stitched so the bag holds its shape rather than slouching into it. Epsom leather takes a scratch far better than Togo, which is why it is the one most often bought to actually carry. Papers and a dated stamp present.",
    details: [
      { label: "Material", value: "Epsom calfskin, palladium hardware" },
      { label: "Measurements", value: "25 × 19 × 9 cm" },
      { label: "Condition", value: "Pristine · no corner wear" },
      { label: "Included", value: "Box, clochette, lock, two keys, rain cover" },
      { label: "Colour", value: "Étoupe · palladium" },
      { label: "Origin", value: "France" },
      { label: "Year", value: "2021" },
      { label: "Authentication", value: "Verified by Snapi · blind stamp checked" },
    ],
    slug: "hermes-kelly-25-sellier-etoupe",
    brand: "Hermès",
    name: "Kelly 25 Sellier",
    price: { amount: 1485000, currency: "USD" },
    merchant: "Madison Avenue Couture",
    vendorUrl: "https://www.madisonavenuecouture.com",
    matchNote: "Etoupe with gold hardware — the exact spec, and under your ceiling.",
    badge: "Verified",
    image: streetStyleFurCoat,
    focus: "object-[62%_45%]",
  },
  {
    id: "pr2",
    category: "Bags",
    description:
      "The retourné build, stitched inside out so the leather softens with use and the corners round off over a decade rather than staying square. One size up on the 25, which is the difference between a bag that takes a slim laptop and one that does not.",
    details: [
      { label: "Material", value: "Togo calfskin, gold hardware" },
      { label: "Measurements", value: "28 × 22 × 10 cm" },
      { label: "Condition", value: "Excellent · light corner softening" },
      { label: "Included", value: "Box, clochette, lock, one key" },
      { label: "Colour", value: "Gold · gold hardware" },
      { label: "Origin", value: "France" },
      { label: "Year", value: "2019" },
      { label: "Authentication", value: "Authenticated in-house by Fashionphile" },
    ],
    slug: "hermes-kelly-28-retourne-gold",
    brand: "Hermès",
    name: "Kelly 28 Retourné",
    price: { amount: 1620000, currency: "USD" },
    merchant: "Fashionphile",
    vendorUrl: "https://www.fashionphile.com",
    matchNote: "Softer stitch and one size up. Slightly over, so flagged not hidden.",
    badge: null,
    image: atelierMannequin,
    focus: "object-[50%_40%]",
  },
  {
    id: "pr3",
    category: "Outerwear",
    description:
      "Storm System is a treatment rather than a fabric: a membrane bonded behind the cashmere so it turns rain without the weight or the rustle of a shell. Mid-calf, unlined through the body, and completely unbranded on the outside.",
    details: [
      { label: "Material", value: "Baby cashmere, Storm System membrane" },
      { label: "Measurements", value: "Mid-calf · 118 cm back length" },
      { label: "Condition", value: "New with tags" },
      { label: "Included", value: "Garment bag, spare buttons" },
      { label: "Colour", value: "Storm grey" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "Sold direct by the house" },
    ],
    slug: "loro-piana-cashmere-storm-coat",
    brand: "Loro Piana",
    name: "Cashmere Storm System Coat",
    price: { amount: 745000, currency: "USD" },
    merchant: "Loro Piana",
    vendorUrl: "https://www.loropiana.com",
    matchNote: "Mid-calf, oatmeal, no visible branding anywhere on it.",
    badge: null,
    image: bridalLight,
    focus: "object-[48%_45%]",
  },
  {
    id: "pr4",
    category: "Outerwear",
    description:
      "An unstructured shoulder and a straight fall from it — the cut The Row is bought for, and the reason it reads as expensive from across a room with no logo to help. Camel wool that holds a press through a winter.",
    details: [
      { label: "Material", value: "Virgin wool, viscose lining" },
      { label: "Measurements", value: "Oversized · 112 cm back length" },
      { label: "Condition", value: "New with tags" },
      { label: "Included", value: "Garment bag" },
      { label: "Colour", value: "Camel" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "New from an authorised stockist" },
    ],
    slug: "the-row-camel-wool-coat",
    brand: "The Row",
    name: "Elmira Wool Coat",
    price: { amount: 449000, currency: "USD" },
    merchant: "Net-a-Porter",
    vendorUrl: "https://www.net-a-porter.com",
    matchNote: "Camel, unstructured shoulder. Closest thing to your saved trench.",
    badge: "Low stock",
    image: poolsideResort,
    focus: "object-[50%_40%]",
  },
  {
    id: "pr5",
    category: "Watches",
    description:
      "A Tank Louis on its original dial, unpolished and unredialled, which is the pairing that decides the resale floor on a watch this age. Manual wind, so it stops if you do — and the papers are present, which most 1978 examples cannot say.",
    details: [
      { label: "Material", value: "18k yellow gold, sapphire cabochon crown" },
      { label: "Measurements", value: "23 × 30 mm case · 16 cm strap" },
      { label: "Condition", value: "Very good · original dial, unpolished case" },
      { label: "Included", value: "Papers, service record, later strap" },
      { label: "Colour", value: "Yellow gold · silvered dial" },
      { label: "Origin", value: "Switzerland" },
      { label: "Year", value: "1978" },
      { label: "Authentication", value: "Serial verified · movement serviced" },
    ],
    slug: "cartier-tank-louis-1978",
    brand: "Cartier",
    name: "Tank Louis, 1978",
    price: { amount: 890000, currency: "USD" },
    merchant: "Watches of Switzerland",
    vendorUrl: "https://www.watchesofswitzerland.com",
    matchNote: "Manual wind, original dial, papers present. Pre-1990 as asked.",
    badge: "Archive",
    image: heroTailoring,
    focus: "object-[50%_45%]",
  },
  {
    id: "pr6",
    category: "Shoes",
    description:
      "The rubber-studded sole is the whole point: a walkable loafer that does not announce itself as a walking shoe. Unlined suede, so it takes the shape of the foot within a week and never quite goes back.",
    details: [
      { label: "Material", value: "Suede, rubber-studded sole" },
      { label: "Measurements", value: "EU 42 · runs true" },
      { label: "Condition", value: "New in box" },
      { label: "Included", value: "Box, dust bags, spare laces" },
      { label: "Colour", value: "Chocolate" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "New from an authorised stockist" },
    ],
    slug: "loro-piana-summer-walk-chocolate",
    brand: "Loro Piana",
    name: "Summer Walk Loafers",
    price: { amount: 119500, currency: "USD" },
    merchant: "Mr Porter",
    vendorUrl: "https://www.mrporter.com",
    matchNote: "Rubber-studded sole. The one pair here you can genuinely walk in.",
    badge: null,
    // 1012×1800 — 9:16. Outside the crop band, so this one letterboxes onto the
    // studio plate rather than losing 44% of its height to a square.
    image: sneakersTall,
  },
  {
    id: "pr7",
    category: "Shoes",
    description:
      "Intrecciato woven by hand, which is why no two panels align identically and why a repair is possible at all. Unlined and soft from the first wear; the leather is thin enough that a half size up is the safer buy.",
    details: [
      { label: "Material", value: "Woven lambskin, leather sole" },
      { label: "Measurements", value: "EU 41 · runs a half size large" },
      { label: "Condition", value: "New in box" },
      { label: "Included", value: "Box, dust bags" },
      { label: "Colour", value: "Fondente" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "Sold direct by the house" },
    ],
    slug: "bottega-veneta-intrecciato-loafer",
    brand: "Bottega Veneta",
    name: "Intrecciato Loafer",
    price: { amount: 128000, currency: "USD" },
    merchant: "Bottega Veneta",
    vendorUrl: "https://www.bottegaveneta.com",
    matchNote: "Unlined suede, breaks in fast. Runs a half size large.",
    badge: null,
    image: heroBag,
    focus: "object-[50%_50%]",
  },
  {
    id: "pr8",
    category: "Tailoring",
    description:
      "Linen cut loosely enough to hang rather than cling, in the undyed shade that reads as deliberate rather than unfinished. It creases — that is linen — and it is the two-piece that survives an August wedding in a hot room.",
    details: [
      { label: "Material", value: "Washed linen, unlined" },
      { label: "Measurements", value: "IT 50 · relaxed through the shoulder" },
      { label: "Condition", value: "New with tags" },
      { label: "Included", value: "Garment bag, spare buttons" },
      { label: "Colour", value: "Sand" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "Sold direct by the house" },
    ],
    slug: "brunello-cucinelli-linen-suit",
    brand: "Brunello Cucinelli",
    name: "Linen Two-Piece",
    price: { amount: 398000, currency: "USD" },
    merchant: "Brunello Cucinelli",
    vendorUrl: "https://www.brunellocucinelli.com",
    matchNote: "Packs without creasing — the reason it beat the silk options.",
    badge: null,
    image: heroRain,
    focus: "object-[50%_40%]",
  },
  {
    id: "pr9",
    category: "Tailoring",
    description:
      "Bias-cut silk, which is what makes a slip fall in a line instead of a tube, and what makes it unforgiving of a bad alteration. Straight neck, no lining, and heavy enough at 22 momme not to cling.",
    details: [
      { label: "Material", value: "22-momme silk charmeuse" },
      { label: "Measurements", value: "UK 10 · 132 cm length" },
      { label: "Condition", value: "Excellent · worn once" },
      { label: "Included", value: "Garment bag" },
      { label: "Colour", value: "Navy" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "2024" },
      { label: "Authentication", value: "New from an authorised stockist" },
    ],
    slug: "khaite-silk-slip-dress-navy",
    brand: "Khaite",
    name: "Silk Slip Dress",
    price: { amount: 178000, currency: "USD" },
    merchant: "Matches",
    vendorUrl: "https://www.matchesfashion.com",
    matchNote: "Navy, no embellishment. Reads as evening without reading as bridal.",
    badge: null,
    // 900×1800 — a 1:2 full-length shot, the shape a square would decapitate.
    image: resortSlipTall,
  },
  {
    id: "pr10",
    category: "Bags",
    slug: "hermes-birkin-30-togo",
    brand: "Hermès",
    name: "Birkin 30, Togo",
    price: { amount: 2140000, currency: "USD" },
    merchant: "Fashionphile",
    vendorUrl: "https://www.fashionphile.com",
    matchNote: "The one that holds a laptop. Corners are honest for its age.",
    description:
      "A Birkin 30 in Togo, the grained calf that takes a knock without showing it. Papers present, and the hardware is unpolished — which is what you want on a bag this age, because a polish takes the edges with it.",
    details: [
      { label: "Material", value: "Togo calfskin, palladium hardware" },
      { label: "Measurements", value: "30 × 22 × 16 cm" },
      { label: "Condition", value: "Very good · corner wear consistent with use" },
      { label: "Included", value: "Box, clochette, lock, two keys" },
      { label: "Colour", value: "Étain · palladium" },
      { label: "Origin", value: "France" },
      { label: "Year", value: "2018" },
      { label: "Authentication", value: "Verified by Snapi · blind stamp checked" },
    ],
    badge: "Verified",
    image: heroBag,
    focus: "object-[48%_50%]",
  },
  {
    id: "pr11",
    category: "Bags",
    slug: "celine-16-medium-smooth-calf",
    brand: "Celine",
    name: "16 Bag, Medium",
    price: { amount: 590000, currency: "USD" },
    merchant: "Net-a-Porter",
    vendorUrl: "https://www.net-a-porter.com",
    matchNote: "Structured but not stiff — the compromise most bags miss.",
    description:
      "The 16 in smooth calf, which is the version that keeps its shape without reading as a briefcase. Unlined interior in suede, one flat pocket, and a clasp that opens one-handed.",
    details: [
      { label: "Material", value: "Smooth calfskin, brushed hardware" },
      { label: "Measurements", value: "32 × 23 × 12 cm" },
      { label: "Condition", value: "Excellent · faint interior marks" },
      { label: "Included", value: "Dust bag" },
      { label: "Colour", value: "Black" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "2022" },
      { label: "Authentication", value: "New from an authorised stockist" },
    ],
    badge: null,
    image: heroBackpack,
    focus: "object-[62%_55%]",
  },
  {
    id: "pr12",
    category: "Bags",
    slug: "loewe-puzzle-small-classic",
    brand: "Loewe",
    name: "Puzzle Small",
    price: { amount: 348000, currency: "USD" },
    merchant: "Mr Porter",
    vendorUrl: "https://www.mrporter.com",
    matchNote: "Four ways to carry it, and it folds flat to pack.",
    description:
      "Cut from a single piece and folded rather than assembled, which is why it collapses flat and still holds a shape when full. Crossbody, shoulder, top handle or by hand.",
    details: [
      { label: "Material", value: "Classic calfskin" },
      { label: "Measurements", value: "24 × 16 × 11 cm" },
      { label: "Condition", value: "New in box" },
      { label: "Included", value: "Box, dust bag, strap" },
      { label: "Colour", value: "Tan" },
      { label: "Origin", value: "Spain" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "New from an authorised stockist" },
    ],
    badge: null,
    image: resortSlipTall,
  },
  {
    id: "pr13",
    category: "Bags",
    slug: "the-row-margaux-15",
    brand: "The Row",
    name: "Margaux 15",
    price: { amount: 495000, currency: "USD" },
    merchant: "Matches",
    vendorUrl: "https://www.matchesfashion.com",
    matchNote: "No logo anywhere on it, which is the whole argument.",
    description:
      "Grained leather, a single compartment and two handles that sit flat when the bag is set down. There is no branding on the exterior at all — the recognition is the shape.",
    details: [
      { label: "Material", value: "Grained calfskin, leather lining" },
      { label: "Measurements", value: "38 × 26 × 18 cm" },
      { label: "Condition", value: "New with tags" },
      { label: "Included", value: "Dust bag" },
      { label: "Colour", value: "Black" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "New from an authorised stockist" },
    ],
    badge: "Low stock",
    image: streetStyleFurCoat,
    focus: "object-[60%_38%]",
  },
  {
    id: "pr14",
    category: "Outerwear",
    slug: "max-mara-teddy-camel-coat",
    brand: "Max Mara",
    name: "Teddy Camel Coat",
    price: { amount: 452000, currency: "USD" },
    merchant: "Loro Piana",
    vendorUrl: "https://www.maxmara.com",
    matchNote: "Camel, mid-calf, and warm without a lining. Reads as the brief.",
    description:
      "Alpaca and wool brushed to a pile, cut oversized so it goes over tailoring. Unlined through the body, which is what keeps it from becoming a duvet at 12°C.",
    details: [
      { label: "Material", value: "Alpaca and virgin wool" },
      { label: "Measurements", value: "Mid-calf · 116 cm back length" },
      { label: "Condition", value: "New with tags" },
      { label: "Included", value: "Garment bag" },
      { label: "Colour", value: "Camel" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "New from an authorised stockist" },
    ],
    badge: null,
    image: heroRain,
    focus: "object-[66%_45%]",
  },
  {
    id: "pr15",
    category: "Shoes",
    slug: "church-s-shannon-derby",
    brand: "Church's",
    name: "Shannon Derby",
    price: { amount: 87000, currency: "USD" },
    merchant: "Mr Porter",
    vendorUrl: "https://www.mrporter.com",
    matchNote: "Resoleable, which is the only durability claim that means anything.",
    description:
      "Goodyear-welted derby in polished binder calf, on a rubber-tipped leather sole. The welt is the point: it can be resoled four or five times, so the shoe outlasts the sole by a decade.",
    details: [
      { label: "Material", value: "Polished binder calf, leather sole" },
      { label: "Measurements", value: "UK 9 · fits true" },
      { label: "Condition", value: "New in box" },
      { label: "Included", value: "Box, dust bags, shoe trees" },
      { label: "Colour", value: "Ebony" },
      { label: "Origin", value: "England" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "New from an authorised stockist" },
    ],
    badge: null,
    image: sneakersStudio,
    focus: "object-[50%_74%]",
  },
  {
    id: "pr16",
    category: "Jewellery",
    slug: "cartier-love-bracelet-yellow-gold",
    brand: "Cartier",
    name: "Love Bracelet",
    price: { amount: 735000, currency: "USD" },
    merchant: "Watches of Switzerland",
    vendorUrl: "https://www.cartier.com",
    matchNote: "The one you never take off. Screwdriver included, which matters.",
    description:
      "18k yellow gold, the 6.1mm width, closed with the original screw system rather than a clasp. It is meant to stay on — which is why the surface is expected to mark, and why an unmarked one is usually a replacement.",
    details: [
      { label: "Material", value: "18k yellow gold" },
      { label: "Measurements", value: "Size 17 · 6.1mm wide" },
      { label: "Condition", value: "Very good · light surface marks" },
      { label: "Included", value: "Box, papers, screwdriver" },
      { label: "Colour", value: "Yellow gold" },
      { label: "Origin", value: "France" },
      { label: "Year", value: "2016" },
      { label: "Authentication", value: "Verified by Snapi · serial checked" },
    ],
    badge: "Verified",
    image: heroParty,
    focus: "object-[52%_35%]",
  },
  {
    id: "pr17",
    category: "Jewellery",
    slug: "van-cleef-vintage-alhambra-pendant",
    brand: "Van Cleef & Arpels",
    name: "Vintage Alhambra Pendant",
    price: { amount: 412000, currency: "USD" },
    merchant: "Net-a-Porter",
    vendorUrl: "https://www.vancleefarpels.com",
    matchNote: "Quiet at a distance, unmistakable up close. Wears with everything.",
    description:
      "A single motif in mother-of-pearl on a 16-inch yellow gold chain, beaded around the edge in the way that dates the piece to the vintage line rather than the sweet.",
    details: [
      { label: "Material", value: "18k yellow gold, mother-of-pearl" },
      { label: "Measurements", value: "15mm motif · 42cm chain" },
      { label: "Condition", value: "Excellent" },
      { label: "Included", value: "Box, pouch, certificate" },
      { label: "Colour", value: "Yellow gold · mother-of-pearl" },
      { label: "Origin", value: "France" },
      { label: "Year", value: "2020" },
      { label: "Authentication", value: "Certificate present · numbered" },
    ],
    badge: null,
    image: bridalLight,
    focus: "object-[45%_40%]",
  },
  {
    id: "pr18",
    category: "Accessories",
    slug: "loro-piana-baby-cashmere-scarf",
    brand: "Loro Piana",
    name: "Baby Cashmere Scarf",
    price: { amount: 127500, currency: "USD" },
    merchant: "Loro Piana",
    vendorUrl: "https://www.loropiana.com",
    matchNote: "The warmest thing here by weight, and it goes over the coat you pick.",
    description:
      "Baby cashmere — the first combing of a hircus goat, which is why a scarf costs what a coat does elsewhere. Undyed, fringed by hand, and light enough to fold into a coat pocket.",
    details: [
      { label: "Material", value: "Baby cashmere" },
      { label: "Measurements", value: "200 × 70 cm" },
      { label: "Condition", value: "New with tags" },
      { label: "Included", value: "Box, dust bag" },
      { label: "Colour", value: "Undyed natural" },
      { label: "Origin", value: "Italy" },
      { label: "Year", value: "Current season" },
      { label: "Authentication", value: "Sold direct by the house" },
    ],
    badge: null,
    image: streetStyleFurCoat,
    focus: "object-[60%_38%]",
  },
];

/* ===========================================================================
 * Trending Now — the All Rounder mosaic at `/trends`
 * ========================================================================= */

/**
 * How much of the mosaic a card occupies.
 *
 * Split in two, and the split is the point.
 *
 * **Only `portrait` and `standard` can hold a photograph.** Merchant product
 * imagery is shot portrait or square — 3:4, 4:5, 1:1 — and nothing in a real feed
 * is 2.7:1. A wide cell holding a product shot has to crop away two thirds of it
 * or letterbox it onto a plate, and doing that to a third of the page is not a
 * layout, it is damage. So the wide cell exists only as `band`, which carries
 * type.
 *
 * Enforced through the types rather than by convention: `MockTrendProduct.shape`
 * simply cannot be `"band"`. A future card that tries to put an image in a wide
 * cell fails to compile instead of shipping a ruined crop.
 */
export type TrendImageShape = "portrait" | "standard";
export type TrendTileShape = "standard" | "band";
export type TrendShape = TrendImageShape | TrendTileShape;

interface TrendBase {
  id: string;
}

export interface MockTrendProduct extends TrendBase {
  kind: "product";
  /** Never `band` — see `TrendImageShape`. */
  shape: TrendImageShape;
  slug: string;
  brand: string;
  name: string;
  price: Money;
  /** How many sellers carry it — a marketplace's own unit of reassurance. */
  sellers: number;
  /** Momentum or scarcity marker. `null` on most; a badge on everything is wallpaper. */
  badge: string | null;
  image: ImageSource | null;
  focus?: string;
}

/**
 * A typographic tile — no photograph, just a claim and a way in.
 *
 * These do the work the wide cells used to do with pictures. Five of sixteen,
 * and they are what stops the page reading as a stock list: an unbroken field of
 * product photography flattens however the shapes vary, and the eye needs
 * somewhere to land that is not another picture.
 *
 * No piece count. One used to sit at the top of each tile and it was the wrong
 * fact: it described the destination when what the reader needs to know is that
 * tapping opens the assistant with `query` already written. The card says that
 * instead, which is a promise it can actually keep.
 */
export interface MockTrendTile extends TrendBase {
  kind: "tile";
  shape: TrendTileShape;
  label: string;
  caption: string;
  query: string;
}

export type MockTrendItem = MockTrendProduct | MockTrendTile;

/**
 * Order is the layout.
 *
 * The grid places these in sequence and the spans are chosen so each run closes
 * its rows exactly. The alternative is `grid-auto-flow: dense`, which fills holes
 * by pulling later cards forward and silently decouples the visual order from the
 * DOM order a keyboard follows.
 *
 * At six columns the runs are:
 *
 *   masthead + portrait + portrait      4 rows
 *   standard x3                         2 rows
 *   band + standard                     2 rows
 *   portrait + portrait + 2 standard    4 rows
 *   standard + band                     2 rows
 *   standard x3                         2 rows
 *
 * Hence exactly four portraits, ten standards and two bands. The counts are
 * load-bearing: add a card without redoing the arithmetic and the mosaic opens a
 * hole.
 *
 * ## Eleven photographs, eleven image cards
 *
 * The asset set holds eleven distinct shoots, not thirteen: `sneakers-tall` and
 * `resort-slip-tall` are portrait crops of `sneakers-studio` and
 * `poolside-resort`. Using both crops of one shoot puts the same picture on the
 * page twice, which reads as a bug however far apart they sit. So the tall crop
 * takes the portrait cell, the wide original stays on the pages that already use
 * it, and the three standard cells left over become tiles.
 *
 * That is also why the tiles land at 4, 11 and 15 rather than in a row at the
 * end: they are the page's punctuation, and punctuation only works spread out.
 *
 * Every photograph is inside its cell's crop band except the rain shot at 2.51,
 * which is banner-shaped and letterboxes onto the studio plate — the one honest
 * demonstration of what happens to an asset too wide to crop.
 */
export const mockTrendItems: MockTrendItem[] = [
  {
    kind: "product",
    id: "t1",
    shape: "portrait",
    slug: "chunky-court-sneakers",
    brand: "Adidas",
    name: "Chunky Court Sneakers",
    price: { amount: 12000, currency: "USD" },
    sellers: 11,
    badge: "Trending",
    image: sneakersTall,
  },
  {
    kind: "product",
    id: "t2",
    shape: "portrait",
    slug: "merino-turtleneck",
    brand: "Uniqlo",
    name: "Extra Fine Merino Turtleneck",
    price: { amount: 4990, currency: "USD" },
    sellers: 3,
    badge: "Lowest price",
    image: atelierMannequin,
    focus: "object-[50%_40%]",
  },
  {
    kind: "product",
    id: "t3",
    shape: "standard",
    slug: "colour-block-puffer",
    brand: "COS",
    name: "Colour-Block Puffer",
    price: { amount: 18900, currency: "USD" },
    sellers: 6,
    badge: null,
    image: heroPuffer,
    focus: "object-[66%_38%]",
  },
  {
    kind: "tile",
    id: "t4",
    shape: "standard",
    label: "Free next-day",
    caption: "Only the sellers who can genuinely get it to you tomorrow.",
    query: "Anything that arrives tomorrow",
  },
  {
    kind: "product",
    id: "t5",
    shape: "standard",
    slug: "shearling-collar-trucker",
    brand: "Levi's",
    name: "Shearling Collar Trucker",
    price: { amount: 16500, currency: "USD" },
    sellers: 9,
    badge: "Back in stock",
    image: streetStyleFurCoat,
    focus: "object-[60%_38%]",
  },
  {
    kind: "tile",
    id: "t6",
    shape: "band",
    label: "Under $50",
    caption: "Everything worth having at the bottom of the range.",
    query: "Something good under $50",
  },
  {
    kind: "product",
    id: "t7",
    shape: "standard",
    slug: "leather-laptop-backpack",
    brand: "Herschel",
    name: "Leather Laptop Backpack",
    price: { amount: 9900, currency: "USD" },
    sellers: 14,
    badge: null,
    image: heroBackpack,
    focus: "object-[62%_55%]",
  },
  {
    kind: "product",
    id: "t8",
    shape: "portrait",
    slug: "linen-two-piece-set",
    brand: "Mango",
    name: "Linen Two-Piece Set",
    price: { amount: 8990, currency: "USD" },
    sellers: 7,
    badge: null,
    image: resortSlipTall,
  },
  {
    kind: "product",
    id: "t9",
    shape: "portrait",
    slug: "satin-slip-dress",
    brand: "Reformation",
    name: "Satin Slip Dress",
    price: { amount: 24800, currency: "USD" },
    sellers: 4,
    badge: null,
    image: bridalLight,
    focus: "object-[45%_40%]",
  },
  {
    kind: "product",
    id: "t10",
    shape: "standard",
    slug: "sequin-mini-dress",
    brand: "Rixo",
    name: "Sequin Mini Dress",
    price: { amount: 31500, currency: "USD" },
    sellers: 5,
    badge: null,
    image: heroParty,
    focus: "object-[52%_35%]",
  },
  {
    kind: "tile",
    id: "t11",
    shape: "standard",
    label: "4.5 stars and up",
    caption: "Enough real reviews behind them to mean something.",
    query: "Only things people actually rate well",
  },
  {
    kind: "product",
    id: "t12",
    shape: "standard",
    slug: "tailored-blazer",
    brand: "Mango",
    name: "Relaxed Tailored Blazer",
    price: { amount: 9900, currency: "USD" },
    sellers: 10,
    badge: null,
    image: heroTailoring,
    focus: "object-[54%_42%]",
  },
  {
    kind: "tile",
    id: "t13",
    shape: "band",
    label: "Price dropped this week",
    caption: "Snapi has been watching these, and the number finally moved.",
    query: "What dropped in price this week",
  },
  {
    kind: "product",
    id: "t14",
    shape: "standard",
    slug: "quilted-shoulder-bag",
    brand: "Charles & Keith",
    name: "Quilted Shoulder Bag",
    price: { amount: 7900, currency: "USD" },
    sellers: 12,
    badge: "Trending",
    image: heroBag,
    focus: "object-[48%_50%]",
  },
  {
    kind: "tile",
    id: "t15",
    shape: "standard",
    label: "New this week",
    caption: "Listed in the last seven days, across every seller Snapi checks.",
    query: "What is new this week",
  },
  {
    kind: "product",
    id: "t16",
    shape: "standard",
    slug: "wool-overcoat",
    brand: "Zara",
    name: "Wool Blend Overcoat",
    price: { amount: 12900, currency: "USD" },
    sellers: 8,
    badge: null,
    image: heroRain,
    focus: "object-[66%_45%]",
  },
];

/**
 * Marquee product promotions.
 *
 * Unlike The Edit and More For You, the type here sits *on* the photograph, so
 * these keep `MediaFrame`'s scrim.
 *
 * ## Shape is data, not layout
 *
 * The rail renders every card at its artwork's own aspect ratio — landscape,
 * portrait, square and banner creative all sit in one strip at a shared height.
 * That only works if the shape is *known before render*. A static import carries
 * its intrinsic dimensions, so local assets need nothing declared.
 *
 * A remote URL carries none. When these come from the backend, either the feed
 * sends width and height (set `ratio` from them) or every card falls back to the
 * same default shape and the entire point of the layout is lost. This is the one
 * field that must not be forgotten in the API contract.
 */
export interface MockPromo {
  id: string;
  slug: string;
  product: string;
  hook: string;
  brand: string;
  image: ImageSource | null;
  /**
   * Width ÷ height, when it cannot be inferred from the image itself.
   * Required for remote URLs; redundant (and ignored) for static imports.
   */
  ratio?: number;
  /**
   * `object-position`. Only bites at the extremes: inside the rail's ratio band
   * the card matches the artwork exactly and nothing is cropped, so this is the
   * fallback for an asset wide or tall enough to be clamped.
   */
  focus?: string;
}

/**
 * No `focus` on any of these, and that is the point: every current asset falls
 * inside the rail's ratio band, so each card matches its artwork exactly and
 * nothing is cropped. The values that used to be here were tuned for a 16:10
 * crop that no longer happens — an inert setting that reads as a decision is
 * worse than none.
 *
 * The seven span 0.61 → 2.51, i.e. portrait, near-square, landscape and banner.
 * A true 1:1 is not in the asset set yet; the layout handles it, this fixture
 * just does not demonstrate it.
 */
export const mockPromos: MockPromo[] = [
  {
    id: "p1",
    slug: "burberry-trench-coats",
    product: "Burberry Trench Coats",
    hook: "Timeless Classics",
    brand: "Burberry",
    // 1500×597 — banner.
    image: heroRain,
  },
  {
    id: "p2",
    slug: "louis-vuitton-wallets",
    product: "Louis Vuitton Wallets",
    hook: "Limited Stock",
    brand: "Louis Vuitton",
    // 1500×698 — banner.
    image: heroBag,
  },
  {
    id: "p3",
    slug: "versace-sunglasses",
    product: "Versace Sunglasses",
    hook: "Bold Looks Only",
    brand: "Versace",
    // 1500×750 — 2:1 banner.
    image: heroTailoring,
  },
  {
    id: "p4",
    slug: "cartier-love-bracelets",
    product: "Cartier Love Bracelets",
    hook: "Icon Status",
    brand: "Cartier",
    // 1600×1066 — 3:2 landscape.
    image: streetStyleFurCoat,
  },
  {
    id: "p5",
    slug: "loro-piana-knitwear",
    product: "Loro Piana Knitwear",
    hook: "Cashmere, Quietly",
    brand: "Loro Piana",
    // 1202×1800 — 2:3 portrait.
    image: atelierMannequin,
  },
  {
    id: "p6",
    slug: "bottega-veneta-totes",
    product: "Bottega Veneta Totes",
    hook: "Intrecciato Craft",
    brand: "Bottega Veneta",
    // 1585×1800 — near square.
    image: bridalLight,
  },
  {
    id: "p7",
    slug: "prada-loafers",
    product: "Prada Loafers",
    hook: "New Season",
    brand: "Prada",
    // 1100×1800 — the tallest asset, and the one nearest the rail's lower clamp.
    image: sneakersStudio,
  },
];
