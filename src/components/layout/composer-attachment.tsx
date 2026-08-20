"use client";

import { Mic, Plus, X } from "lucide-react";
import * as React from "react";

import { ICON_BUTTON } from "@/components/layout/composer-styles";
import { cn } from "@/lib/utils";

/**
 * Picking a reference image, shared by both composers.
 *
 * The docked composer and the workspace one are the same object at two sizes, so
 * the attach behaviour lives here rather than twice. Two copies of object-URL
 * lifecycle handling is two chances to leak.
 */

export interface Attachment {
  /** An object URL. Valid only for this document's lifetime. */
  url: string;
  name: string;
}

export function useAttachment() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = React.useState<Attachment | null>(null);

  /**
   * Revoke on replace and on unmount.
   *
   * `createObjectURL` pins the whole file in memory until its URL is revoked —
   * nothing garbage-collects it, not even navigating away within an SPA. Picking a
   * dozen photos over a session without this holds all twelve. The cleanup runs on
   * every change of `attachment`, which covers replacement and teardown in one.
   */
  React.useEffect(() => {
    if (!attachment) return;
    return () => URL.revokeObjectURL(attachment.url);
  }, [attachment]);

  const open = React.useCallback(() => inputRef.current?.click(), []);
  const clear = React.useCallback(() => setAttachment(null), []);

  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Clear the input before doing anything with the file. A file input fires
    // `change` only when its value *differs*, so re-picking the same photo after
    // removing it would be silently ignored — the classic "the button stopped
    // working" bug. Resetting on every pick means the next one always fires.
    event.target.value = "";

    if (!file) return;
    setAttachment({ url: URL.createObjectURL(file), name: file.name });
  }, []);

  return { attachment, inputRef, open, onChange, clear };
}

/**
 * The hidden file input.
 *
 * `accept="image/*"` filters the OS picker rather than validating anything, which
 * is the honest limit of what a client can do here — the real check belongs on the
 * upload endpoint that does not exist yet.
 */
export function AttachmentInput({
  inputRef,
  onChange,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      onChange={onChange}
      className="hidden"
      // Not focusable and not announced: the visible Plus button carries the
      // label and opens this. A reachable hidden input is a control a keyboard
      // user lands on with nothing to see.
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

/**
 * The picked image, above the field.
 *
 * A plain `<img>`, not `next/image`: the source is a `blob:` URL that exists only
 * in this browser tab, so there is nothing for an optimiser on the server to fetch,
 * resize or cache. `next/image` would need `unoptimized` to do the same job and
 * would still ship a wrapper around it.
 *
 * The remove control overhangs the corner rather than sitting inside the frame —
 * inside, it covers the very thumbnail it is describing.
 */
export function AttachmentThumb({
  attachment,
  onRemove,
  size = "md",
}: {
  attachment: Attachment;
  onRemove: () => void;
  size?: "sm" | "md";
}) {
  return (
    <span className="relative inline-block shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL, see above */}
      <img
        src={attachment.url}
        alt={`Attached image: ${attachment.name}`}
        className={cn(
          "rounded-lg object-cover ring-1 ring-[oklch(0%_0_0/0.12)] dark:ring-white/15",
          size === "sm" ? "size-12" : "size-14",
        )}
      />

      <button
        type="button"
        // `stopPropagation` because the whole card focuses the field on click —
        // without it, removing an image also drops the caret into the textarea.
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${attachment.name}`}
        className={cn(
          "absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full",
          // Fixed white-on-black glass rather than theme tokens: it sits on a
          // photograph, and a photograph does not lighten because the UI did.
          "border border-white/25 bg-black/60 text-white/90 backdrop-blur-sm",
          "transition-colors duration-200 hover:bg-danger hover:text-white",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </span>
  );
}

/**
 * Attach and dictate, immediately before Send.
 *
 * They led the pill row until the row was regrouped by what each control acts on:
 * these two and Send all act on the *message*, while the pills describe the search,
 * so the three that belong together now sit together at the end of the row. It also
 * puts a picture and a dictation one thumb-width from the button that sends them,
 * which is where a hand already is.
 *
 * Send keeps its hairline and its gold, so being adjacent does not make it a third
 * icon button.
 *
 * The mic is inert — there is no speech pipeline yet. Left as a real button rather
 * than a disabled one for the same reason the pills are: the action is not
 * unavailable to this user, it simply is not built, and a permanently disabled
 * control teaches people to stop trying.
 */
export function ComposerActions({
  onAttach,
  hasAttachment,
  size = "md",
}: {
  onAttach: () => void;
  hasAttachment: boolean;
  size?: "sm" | "md";
}) {
  const button = cn(ICON_BUTTON, size === "sm" ? "size-[26px]" : "size-[30px]");
  const glyph = size === "sm" ? "size-3.5" : "size-4";

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAttach();
        }}
        // The label changes with state — "Add an image" is wrong once there is
        // one, because this replaces rather than appends.
        aria-label={hasAttachment ? "Replace the attached image" : "Attach an image"}
        className={button}
      >
        <Plus className={glyph} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={(event) => event.stopPropagation()}
        aria-label="Dictate"
        className={button}
      >
        <Mic className={glyph} aria-hidden="true" />
      </button>
    </span>
  );
}
