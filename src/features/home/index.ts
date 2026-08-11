/**
 * Public surface of the `home` slice.
 *
 * Other code imports from here, never from `./components/*` directly — see
 * `src/features/README.md`.
 */
export { HeroBanner } from "./components/hero-banner";
// RibbonDivider is intentionally not exported — it is the banner's closing edge,
// only ever composed by HeroBanner.
export { TheEdit } from "./components/the-edit";
export { DesignerWorlds } from "./components/designer-worlds";
export { MoreForYou } from "./components/more-for-you";
export { ProductMarquee } from "./components/product-marquee";
