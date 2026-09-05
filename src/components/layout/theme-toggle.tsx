"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Tooltip } from "@/components/ui/tooltip";
import { useIsHydrated } from "@/hooks/use-is-hydrated";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

/**
 * Theme control.
 *
 * A three-way segmented control rather than a two-state switch, because
 * "follow my OS" is a distinct choice from "always dark" — a binary toggle
 * silently discards it the first time the user touches the control.
 *
 * Until hydration completes neither form commits to a theme: the stored one is not
 * knowable on the server, and rendering a guess causes a hydration mismatch. Both
 * branches fall back to System, which is what the server has no choice but to assume.
 */
export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const hydrated = useIsHydrated();

  // In the rail there is no room for three segments, so it becomes a single
  // button that advances through the options.
  if (collapsed) {
    // `hydrated` gates this exactly as it gates the segmented control below, and for
    // the same reason — it was missing here, which is a real bug rather than an
    // oversight of style: this branch is the one the rail actually renders, so anyone
    // with a theme other than System saw the server send Monitor / "Theme: System" and
    // the client draw Moon / "Theme: Dark". React reported a hydration failure on every
    // page in the shell. Before hydration the stored theme is not knowable, so the
    // server's guess is the one both sides make, and the effect corrects it after.
    const currentIndex = hydrated ? OPTIONS.findIndex((option) => option.value === theme) : -1;
    const current = OPTIONS[currentIndex === -1 ? 1 : currentIndex] ?? OPTIONS[1]!;
    const next = OPTIONS[(currentIndex === -1 ? 1 : currentIndex + 1) % OPTIONS.length]!;

    return (
      <button
        type="button"
        onClick={() => setTheme(next.value)}
        aria-label={`Theme: ${current.label}. Switch to ${next.label}.`}
        className={cn(
          "group relative grid h-10 w-10 place-items-center rounded-md text-content-muted hover:bg-surface-raised hover:text-content",
          "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        <current.Icon className="size-[18px]" aria-hidden="true" />
        <Tooltip label={`Theme: ${current.label}`} />
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-sunken p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = hydrated && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "grid size-7 place-items-center rounded-full transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-ring",
              active
                ? "bg-surface text-gold shadow-premium-sm"
                : "text-content-subtle hover:text-content",
            )}
          >
            <Icon className="size-[15px]" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
