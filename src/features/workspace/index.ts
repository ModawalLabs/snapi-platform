/**
 * Public surface of the `workspace` slice.
 *
 * Other code imports from here, never from `./components/*` directly — see
 * `src/features/README.md`.
 */
export { ChatStart } from "./components/chat-start";
export { Workspace } from "./components/workspace";
export { brandSeed, chatSeed, missionSeed, promptSeed, storySeed } from "./lib/seeds";
