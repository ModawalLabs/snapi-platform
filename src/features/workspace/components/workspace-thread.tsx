import { Sparkles } from "lucide-react";

import type { MockMessage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * The conversation, seeded from whatever was clicked to open the workspace.
 *
 * Two treatments, not one bubble style recoloured:
 *
 *  - **You** get a bubble. It is the shorter, denser half of the exchange, and a
 *    contained shape makes the turn boundaries scannable.
 *  - **Snapi** gets plain prose under a small gold mark. Wrapping a paragraph of
 *    reasoning in a bubble at this column width leaves a ragged shape with more
 *    padding than text, and the assistant's voice should read as editorial rather
 *    than as chat.
 *
 * A Server Component — messages are given, nothing here reacts.
 */
export function WorkspaceThread({ messages }: { messages: MockMessage[] }) {
  return (
    <ol className="flex flex-col gap-6">
      {messages.map((message) =>
        message.role === "user" ? (
          <li key={message.id} className="flex justify-end">
            <p
              className={cn(
                "max-w-[92%] rounded-2xl rounded-br-md border border-gold-border bg-gold-subtle px-3.5 py-2.5",
                "text-sm leading-relaxed text-content",
              )}
            >
              {message.body}
            </p>
          </li>
        ) : (
          <li key={message.id} className="flex gap-3">
            <span
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-gold-border bg-gold-subtle"
              aria-hidden="true"
            >
              <Sparkles className="size-3 text-gold" />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-content-muted">
              {message.body}
            </p>
          </li>
        ),
      )}
    </ol>
  );
}
