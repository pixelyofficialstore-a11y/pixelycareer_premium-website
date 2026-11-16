/**
 * Section anchors for ad links (/offer#process, #pricing, #faq) and in-page links.
 * A section names the element to land on (its heading) with data-anchor; it lands GAP px below the fixed header.
 */

/** Old or alternative names that land on another section. */
const ALIAS: Record<string, string> = { "how-it-works": "process" };
export const ANCHOR_GAP = 24;

/** The element a #hash lands on: the section's [data-anchor] heading, else the element itself. */
export function anchorTarget(hash: string): HTMLElement | null {
  let id = hash.replace(/^#/, "");
  try { id = decodeURIComponent(id); } catch { /* a malformed hash is used as it is */ }
  if (!id) return null;
  const el = document.getElementById(id) ?? (ALIAS[id] ? document.getElementById(ALIAS[id]) : null);
  if (!el) return null;
  return el.matches("[data-anchor]") ? el : el.querySelector<HTMLElement>("[data-anchor]") ?? el;
}

/**
 * The scroll position that puts the target just below the header. Away from the top of the page the header sits at
 * top 0 and covers the announcement bar, so the header's own height is the offset; near the top, the bar is added.
 */
export function anchorY(target: HTMLElement): number {
  const header = document.querySelector("header");
  const h = header ? header.offsetHeight : 72;
  const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar-h")) || 0;
  // Layout position, not the drawn one: a heading that has not revealed yet is still moved down by its animation.
  // (Do not mark a sticky element: its offsetTop follows the scroll. Mark its non-sticky container, as the FAQ does.)
  let raw = 0;
  for (let el: HTMLElement | null = target; el; el = el.offsetParent as HTMLElement | null) raw += el.offsetTop;
  const y = raw - h - ANCHOR_GAP;
  // Close to the top the header has not moved up yet, so the bar is still showing above it.
  return Math.max(0, y < 40 ? y - bar : y);
}
