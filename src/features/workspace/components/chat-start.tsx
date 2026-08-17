import { ArrowRight, ArrowUpRight, Bookmark, Radar, X } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import { Logo } from "@/components/layout/logo";
import { routes } from "@/config/routes";
import { WorkspaceComposer } from "@/features/workspace/components/workspace-composer";
import {
  mockConciergeBriefing,
  mockCounts,
  mockMissions,
  mockRecents,
  mockSavedItems,
  mockUser,
  type MockMission,
  type MockRecent,
  type MockSavedItem,
} from "@/lib/mock-data";
import { MODALITY_ICON, MODALITY_LABEL } from "@/lib/modality";
import { cn, formatPrice } from "@/lib/utils";

/**
 * `/chat` with nothing asked yet — where a session begins.
 *
 * The blank state of the same surface `Workspace` renders answered, which is why
 * it shares the route. Submit the composer and `?q=` sends you to the split view;
 * come back with an empty query and you land here.
 *
 * ## The composition: one centred column
 *
 * Nothing beside the type and nothing behind it — the greeting, the brief and the
 * composer sit on the optical centre of the page, with a band of standing
 * information ruled off underneath. The register is carried entirely by the display
 * serif and the ambient wash.
 *
 * It held a photographic plate on one third, and then a quilt of the house mark in
 * its place. Both were removed: a page whose one job is to receive a question reads
 * better with the question centred on it than with the eye split between two halves,
 * and the ornament was competing with the only thing on screen that matters.
 *
 * What survives of that is one layer that adds no content at all: a paper grain over
 * everything, which turns a flat cream rectangle into a surface. That is the whole
 * difference between a page and a swatch. An oversized monogram sat behind the type
 * alongside it for a while and came out again — the grain works because you never
 * catch it, and a logo at any opacity is still a logo you eventually catch.
 *
 * The composer is the one element that resets to left, because a text field cannot
 * be centred.
 *
 * ## What stops it being an empty chat screen
 *
 * A blank composer under a greeting is the weakest page in any assistant product:
 * it asks the user to invent the interaction, and most people bounce rather than
 * guess. Four things carry it, in descending order of weight:
 *
 *  1. **The concierge line.** Not "how can I help" — an actual claim about two
 *     actual pieces, which says the assistant has been working. Set as speech
 *     rather than in a panel, for the reason given on `ConciergeLine`. The
 *     composer's rotating prompt handles "what can I even type", so this does not
 *     have to.
 *  2. **The date line.** A greeting is a splash screen; a greeting with today's
 *     date and a live count is a briefing.
 *  3. **Pick up where you left off.** Most sessions are a continuation, not a new
 *     idea. Without it, the page is a dead end for anyone who already asked.
 *  4. **What is in motion.** Missions change without the user acting, which is the
 *     only thing that makes a page a dashboard rather than a menu.
 *
 * ## The entrance
 *
 * Everything fades up in sequence over ~700ms: eyebrow, headline, date, brief,
 * composer, band. `fill-mode-both` is what makes a staggered reveal work at all —
 * without it a delayed element is fully visible during its own delay and then jumps
 * to the start of its animation.
 *
 * A Server Component apart from the composer. The date is stamped on the server,
 * which is safe because this route is already dynamic (it reads `?q=`) — the same
 * value in a Client Component would be a hydration mismatch waiting for midnight.
 */

/**
 * One reveal, five delays.
 *
 * Long and slow (700ms, the app's standard decelerating curve) because this is an
 * arrival, not a state change. A 150ms fade reads as a page that was slow to paint;
 * 700ms reads as a page opening.
 */
const REVEAL = cn(
  "animate-in fill-mode-both fade-in slide-in-from-bottom-3",
  "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
  "motion-reduce:animate-none",
);

export function ChatStart() {
  const recents = [...mockRecents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // Open missions only. A dashboard strip that counted the finished ones would
  // never go down, which teaches people to stop reading it.
  const missions = mockMissions.filter((mission) => mission.status !== "done").slice(0, 3);

  const saved = [...mockSavedItems]
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    .slice(0, 3);

  return (
    <div className="ambient-canvas relative flex min-h-dvh flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-5 sm:px-8">
        {/* The logo is not a link back: the close button is right beside it and does
            that job explicitly, and two controls going to the same place is one
            control too many. */}
        <Logo />
        <CloseButton />
      </header>

      <main className="flex flex-1 flex-col justify-center px-5 pt-2 pb-10 sm:px-8 lg:pb-14">
        {/* Centred on the page and centred *as* type, now that there is nothing
            beside it to balance against. `max-w-3xl` is the measure: centred text
            past ~70 characters loses the start of the next line, and the composer
            is the widest thing it has to agree with. */}
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className={cn("text-eyebrow text-gold", REVEAL)}>Snapi Concierge</p>

          {/* The display serif, unlike the profile dialog's UI sans. This is the
              page's masthead rather than a field label — the one line that sets the
              register for the whole session. */}
          <h1
            className={cn(
              "mt-3.5 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.04] font-normal tracking-[-0.012em] text-balance text-content",
              REVEAL,
              "delay-100",
            )}
          >
            Good to see you, {mockUser.name}.
            <span className="block text-content-muted">What are we looking for?</span>
          </h1>

          <DateLine className={cn(REVEAL, "delay-150")} />

          <ConciergeLine className={cn(REVEAL, "delay-200")} />

          {/* `text-left` resets the centring for the field. `text-align` inherits,
              so without it the typed sentence and the rotating prompt would both sit
              centred inside the textarea — which no input has ever done and which
              makes the caret jump sideways on every keystroke.

              This is also the one place a submit does something: it becomes `?q=`
              and the page turns into the answered split view. */}
          <div className={cn("mt-8 text-left", REVEAL, "delay-300")}>
            <WorkspaceComposer navigateOnSubmit />
          </div>
        </div>
      </main>

      {/* ── Standing band ──────────────────────────────────────────────────────
          Ruled off and full width. Everything above it is about starting;
          everything in it is already underway. */}
      <footer
        className={cn(
          "shrink-0 border-t border-border bg-surface/50 backdrop-blur-sm",
          REVEAL,
          "delay-500",
        )}
      >
        <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-border lg:grid-cols-3">
          <StartBlock
            title="Pick up where you left off"
            action={{ label: "All chats", href: routes.chats() }}
          >
            {recents.map((recent) => (
              <RecentRow key={recent.id} recent={recent} />
            ))}
          </StartBlock>

          <StartBlock title="In motion" action={{ label: "All missions", href: routes.missions() }}>
            {missions.map((mission) => (
              <MissionRow key={mission.id} mission={mission} />
            ))}
          </StartBlock>

          {/* Full width on the two-column step rather than stranded at half: a
              lone third cell beside empty space is the one arrangement that reads
              as a mistake. */}
          <StartBlock
            title="Set aside"
            action={{ label: "Snapi List", href: routes.snapiList() }}
            className="border-t border-border sm:col-span-2 sm:border-t lg:col-span-1 lg:border-t-0"
          >
            {saved.map((item) => (
              <SavedRow key={item.id} item={item} />
            ))}
          </StartBlock>
        </div>
      </footer>

      {/* Last in the DOM so it lies over everything, including the composer's
          white panel. Grain that stops at the edge of a card would draw the card
          instead of unifying the surface — on real paper the ink is printed *on*
          the tooth, not beside it. */}
      <div
        aria-hidden="true"
        className="paper-grain pointer-events-none absolute inset-0 opacity-[0.09] dark:opacity-[0.075]"
      />
    </div>
  );
}

/**
 * Close.
 *
 * A bordered surface chip in theme tokens. It carried a second, white-on-black
 * variant while there was a plate for it to sit on; with the page down to one
 * ground there is one material, and the branch went with the plate.
 */
function CloseButton() {
  return (
    <Link
      href={routes.home()}
      aria-label="Close"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface/70 backdrop-blur-xl",
        "text-content-subtle transition-[background-color,border-color,color] duration-200",
        "hover:border-border-strong hover:bg-surface hover:text-content",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      <X className="size-4" aria-hidden="true" />
    </Link>
  );
}

/**
 * Today, and what is running.
 *
 * `Intl` with the zone pinned to UTC, matching `formatDate` — an unpinned
 * formatter renders the server's zone into HTML and then disagrees with the
 * browser's for anyone the other side of midnight.
 *
 * The rule between the two halves does real work: without it the date and the
 * count read as one sentence, and "10 August 4 missions running" is not one.
 */
function DateLine({ className }: { className?: string }) {
  // `en-GB` for the day-before-month order — "Friday, 14 August", not "Friday,
  // August 14". The app is written in British English throughout (jewellery,
  // colour), and a masthead date is the last place to switch register.
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date());

  // Widened off the literal type. `mockCounts` is `as const`, so `missions` is the
  // literal `4` and TypeScript reads the plural check as provably dead code — it is
  // right about the fixture and wrong about the field, which will be a real number.
  const running: number = mockCounts.missions;

  return (
    <p
      className={cn(
        "mt-4 flex items-center justify-center gap-3 text-[11px] tracking-wide",
        className,
      )}
    >
      <span className="tabular text-content-muted">{today}</span>
      <span className="h-px w-5 bg-border-strong" aria-hidden="true" />
      <span className="tabular text-content-subtle">
        {running} {running === 1 ? "mission" : "missions"} running
      </span>
    </p>
  );
}

/**
 * The concierge's brief — spoken, not filed.
 *
 * No card, no border, no tint. A boxed message reads as a *notice about* the
 * assistant; unboxed type on the page reads as the assistant talking, and on a
 * page whose whole premise is that someone is attending to you, that difference is
 * the entire effect. It was a panel and it looked like a system alert.
 *
 * Also deliberately not a chat bubble, which was the other option. A single bubble
 * implies a conversation the user has not had yet, and the reply affordance it
 * suggests is the composer directly below — making the bubble a decoy.
 *
 * The `✦` is what marks it as Snapi's voice rather than the page's own copy. It is
 * the same glyph the composer's rotating prompt carries, in the same gold, so the
 * two are recognisably one speaker. An icon in a circular chip would have rebuilt
 * the box in miniature.
 *
 * `56ch`, not the column's full width: this is the only multi-line paragraph on the
 * page, and centred text past roughly seventy characters loses the start of each
 * next line.
 */
function ConciergeLine({ className }: { className?: string }) {
  const { body, action } = mockConciergeBriefing;

  return (
    <div className={cn("mt-6", className)}>
      <p className="mx-auto max-w-[56ch] text-[15px] leading-relaxed text-content-muted sm:text-base">
        <span className="mr-1.5 text-gold" aria-hidden="true">
          ✦
        </span>
        {body}
      </p>

      <Link
        href={action.href}
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-sm text-[13px] font-semibold text-gold",
          "transition-colors duration-300 hover:text-gold-hover",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        )}
      >
        {action.label}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

/** One cell of the standing band. Same header shape for all three. */
function StartBlock({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action: { label: string; href: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("px-5 py-5 sm:px-6 sm:py-6", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-eyebrow text-content-subtle">{title}</h2>

        <Link
          href={action.href}
          className={cn(
            "shrink-0 rounded-sm text-[11px] font-medium text-content-subtle transition-colors duration-200",
            "hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          {action.label}
        </Link>
      </div>

      <ul className="mt-1.5 flex flex-col">{children}</ul>
    </section>
  );
}

/** Shared row chrome. Three lists, one rhythm — different icons, identical metrics. */
const ROW = cn(
  "group flex items-center gap-3 rounded-md py-2 text-[13px] text-content-muted",
  "transition-colors duration-200 hover:text-content",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

const ROW_ICON =
  "size-3.5 shrink-0 text-content-subtle transition-colors duration-200 group-hover:text-gold";

/** One past conversation. The modality icon is the only thing distinguishing them at a glance. */
function RecentRow({ recent }: { recent: MockRecent }) {
  const Icon = MODALITY_ICON[recent.modality];

  return (
    <li>
      <Link href={routes.chat(recent.id)} className={ROW}>
        <Icon className={ROW_ICON} aria-hidden="true" />
        {/* The modality has a word behind it for anyone who cannot see the icon —
            `MODALITY_LABEL` exists for exactly this. */}
        <span className="sr-only">{MODALITY_LABEL[recent.modality]}: </span>
        {/* `truncate` does nothing on a flex child without `min-w-0`. */}
        <span className="min-w-0 flex-1 truncate">{recent.title}</span>
        <ArrowUpRight
          className="size-3.5 shrink-0 text-content-subtle opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

/**
 * One open mission.
 *
 * Shows the collection count rather than the status word. "Running" tells the user
 * the system is alive; "2 collections" tells them it has found something, which is
 * the only version of that fact worth a line here.
 */
function MissionRow({ mission }: { mission: MockMission }) {
  return (
    <li>
      <Link href={routes.mission(mission.id)} className={ROW}>
        <Radar className={ROW_ICON} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{mission.name}</span>
        <span className="tabular shrink-0 text-[11px] text-content-subtle">
          {mission.collections === 0
            ? "Watching"
            : `${mission.collections} ${mission.collections === 1 ? "collection" : "collections"}`}
        </span>
      </Link>
    </li>
  );
}

/** One saved piece. Price rather than brand — the brand is usually in the name. */
function SavedRow({ item }: { item: MockSavedItem }) {
  return (
    <li>
      <Link href={routes.product(item.slug)} className={ROW}>
        <Bookmark className={ROW_ICON} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{item.name}</span>
        <span className="tabular shrink-0 text-[11px] text-content-subtle">
          {formatPrice(item.price.amount, {
            currency: item.price.currency,
            showDecimals: item.price.amount % 100 !== 0,
          })}
        </span>
      </Link>
    </li>
  );
}
