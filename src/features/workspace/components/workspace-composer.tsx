"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  autoGrow,
  BETWEEN_MS,
  BLOOM,
  BLOOM_FOCUS,
  BLOOM_HOVER,
  DELETE_MS,
  HOLD_MS,
  PANEL,
  PILL,
  SEND_BUTTON,
  TYPE_MS,
} from "@/components/layout/composer-styles";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

/**
 * The workspace composer — the marketing hero's chat card, at full size.
 *
 * Built from the same shared material as the sidebar's (`composer-styles`), so the
 * two are the same object rather than two approximations of one. What differs here
 * is only what the extra width allows:
 *
 *  - Prompts run their full length. The sidebar trims them to ~26 characters
 *    because a 205px field pushes the caret out of view; this column is twice that.
 *  - Type is 14px rather than 13px, and the pill row carries the full category set.
 *  - The field grows further before it scrolls — there is no Recents column
 *    underneath it to squeeze.
 *
 * ## `navigateOnSubmit`
 *
 * On the start page a submit is a *navigation* — the question becomes `?q=` and the
 * page turns into the answered split view. In the split view itself a submit is a
 * new turn in a thread that does not exist yet, so it stays inert.
 *
 * A boolean rather than an `onSubmit` callback because the caller is a Server
 * Component and a function cannot cross that boundary. The alternative is a client
 * wrapper whose entire job is to relay one handler, which is more moving parts for
 * the same two behaviours.
 */

const PROMPTS = [
  "A trench that survives Paris rain",
  "Quiet gold, nothing loud",
  "One bag I'll carry for decades",
  "Loafers I can walk 10km in",
  "Something for a September wedding",
] as const;

const CATEGORIES = ["Clothing", "Shoes", "Bags", "Jewellery", "Watches"] as const;

const HEADING_ID = "workspace-composer-heading";

export function WorkspaceComposer({ navigateOnSubmit = false }: { navigateOnSubmit?: boolean }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [promptIndex, setPromptIndex] = React.useState(0);
  const [typedLength, setTypedLength] = React.useState(0);
  const [phase, setPhase] = React.useState<"typing" | "deleting">("typing");

  // The decorative line shows only while the field is untouched — the hero's exact
  // swap, which stops the demo text competing with real input.
  const showDemo = !focused && value.length === 0;
  const canSend = value.trim().length > 0;

  React.useEffect(() => {
    if (!showDemo) return;

    const current = PROMPTS[promptIndex] ?? "";
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      timer =
        typedLength < current.length
          ? setTimeout(() => setTypedLength((l) => l + 1), TYPE_MS)
          : setTimeout(() => setPhase("deleting"), HOLD_MS);
    } else {
      timer =
        typedLength > 0
          ? setTimeout(() => setTypedLength((l) => l - 1), DELETE_MS)
          : setTimeout(() => {
              setPromptIndex((i) => (i + 1) % PROMPTS.length);
              setPhase("typing");
            }, BETWEEN_MS);
    }

    return () => clearTimeout(timer);
  }, [showDemo, phase, typedLength, promptIndex]);

  /**
   * Enter sends, Shift+Enter inserts a line break.
   *
   * `isComposing` is the important guard: while an IME candidate window is open
   * (Japanese, Chinese, Korean), Enter commits the candidate. Submitting on it
   * would send a half-finished word and clear the field mid-composition.
   */
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (value.trim().length === 0) return;
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const prompt = value.trim();
        if (!navigateOnSubmit || prompt.length === 0) return;
        // `push`, not `replace`: the start page is somewhere the user was and may
        // well want back, and it is the only route that leads anywhere else.
        router.push(routes.newChat(prompt));
      }}
      onClick={() => inputRef.current?.focus()}
      className={cn(
        // 1.5px of padding is what reveals the rotating layer beneath as a border.
        "group/composer relative w-full cursor-text overflow-hidden rounded-[20px] p-[1.5px]",
        BLOOM,
        BLOOM_HOVER,
        BLOOM_FOCUS,
        "transition-[box-shadow] duration-300 ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
        // No hover/focus scale here. In the sidebar the card floats in its own
        // space; docked to the bottom of a column it would push against the edges
        // it is aligned to, which reads as a wobble rather than a lift.
      )}
    >
      {/* Rotating gold sweep. 220% with the negative offsets keeps the gradient's
          centre on the panel's centre as it turns, so the highlight tracks the
          whole perimeter instead of clipping at a corner. */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -mt-[110%] -ml-[110%] h-[220%] w-[220%] animate-ring-sweep motion-reduce:animate-none"
        style={{ background: "var(--ring-sweep-gradient)" }}
      />

      <div className={cn("relative flex w-full flex-col gap-7 rounded-[18.5px] p-4", PANEL)}>
        <div className="w-full">
          <p
            id={HEADING_ID}
            className="mb-2.5 text-[11px] leading-4 text-content-muted dark:text-white/60"
          >
            Your personal shopper
          </p>

          <div className="relative w-full">
            {showDemo ? (
              <p
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 flex items-center text-sm leading-6 tracking-[0.01em] text-content-muted dark:text-white/85"
              >
                <span className="mr-1.5 text-gold">✦</span>
                <span className="truncate">
                  {(PROMPTS[promptIndex] ?? "").slice(0, typedLength)}
                </span>
                <span className="ml-0.5 inline-block h-[0.95em] w-[2px] shrink-0 animate-caret-blink bg-gold motion-reduce:animate-none" />
              </p>
            ) : null}

            {/* A textarea, not an input: an input cannot wrap, so a long sentence
                scrolls sideways inside it and the tail of what you typed goes
                invisible. */}
            <textarea
              ref={inputRef}
              rows={1}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                autoGrow(event.currentTarget);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={showDemo ? undefined : "Ask Snapi anything…"}
              aria-label="Ask Snapi anything"
              aria-describedby={HEADING_ID}
              autoComplete="off"
              className={cn(
                "w-full resize-none bg-transparent text-content dark:text-white/95",
                "text-sm leading-6 tracking-[0.01em]",
                "caret-gold placeholder:text-content-subtle focus:outline-none dark:placeholder:text-white/45",
                // The `30vh` term is a guard, not decoration: this is docked to the
                // bottom of a fixed-height column, and at the rem cap alone a short
                // viewport would push the thread above it off screen.
                "max-h-[min(18rem,30vh)] overflow-y-auto",
                "[scrollbar-width:thin] [scrollbar-color:oklch(60%_0.01_60/0.35)_transparent]",
              )}
            />
          </div>
        </div>

        <div className="flex w-full items-end justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap gap-[5px]">
            {CATEGORIES.map((label) => (
              <button
                key={label}
                type="button"
                onClick={(event) => event.stopPropagation()}
                className={PILL}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Kept mounted and faded rather than conditionally rendered — mounting
              it on the first keystroke would shift the pill row sideways. */}
          <button
            type="submit"
            aria-label="Send"
            disabled={!canSend}
            tabIndex={canSend ? 0 : -1}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              SEND_BUTTON,
              "size-[38px]",
              canSend ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
            )}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="oklch(20% 0.02 70)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
