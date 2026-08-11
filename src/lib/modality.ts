import { Mic, ScanLine, Search, Type, type LucideIcon } from "lucide-react";

import type { SearchModality } from "@/types/domain";

/**
 * How a conversation started, as an icon and a word.
 *
 * Shared by the sidebar's Recents column and the chat history page, and kept in a
 * module with **no** `"use client"` directive so a Server Component can import it.
 * A shared constant declared inside a client module is replaced by a
 * client-reference proxy when a server module imports it, which fails at runtime
 * in a way that looks nothing like its cause — this project has been bitten by
 * that once already.
 *
 * The label is not decoration: in the sidebar the icon carries no text, so
 * anywhere the modality is the only signal it needs a name behind it.
 */
export const MODALITY_ICON: Record<SearchModality, LucideIcon> = {
  text: Type,
  image: ScanLine,
  voice: Mic,
  url: Search,
};

export const MODALITY_LABEL: Record<SearchModality, string> = {
  text: "Typed",
  image: "From a photo",
  voice: "Spoken",
  url: "From a link",
};
