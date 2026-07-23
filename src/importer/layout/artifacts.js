/**
 * Header / footer / page-number removal.
 *
 * Candidate zone: the top 8% and bottom 8% of each page. A candidate line is
 * dropped when it is a page-number pattern, or when the same normalized text
 * appears in the same zone on >= 2 pages (a running header/footer). We NEVER
 * drop a top-zone line on page 1 — that is the candidate's name. Every drop is
 * logged so a wrongly-removed heading is diagnosable.
 *
 * Pure: input lines, output kept lines + a list of dropped-line warnings.
 */

/**
 * @typedef {import('./lines.js').Line} Line
 * @typedef {import('../extract/pdf.js').PageMeta} PageMeta
 */

const ZONE_FRAC = 0.08;
const PAGE_NUM_RE = /^\s*(page\s*)?\d+\s*(of|\/)\s*\d+\s*$/i;
const BARE_NUM_RE = /^\s*[-–—]?\s*\d{1,2}\s*[-–—]?\s*$/;

/**
 * @param {Line[]} lines
 * @param {PageMeta[]} pages
 * @param {number} pageCount
 * @returns {{ lines: Line[], dropped: string[] }}
 */
export function removeArtifacts(lines, pages, pageCount) {
  const pageH = new Map(pages.map((p) => [p.page, p.height]));

  // "zone" tag per line: 'top' | 'bottom' | null.
  /** @param {Line} l */
  const zoneOf = (l) => {
    const h = pageH.get(l.page) || 792;
    if (l.y <= h * ZONE_FRAC) return 'top';
    if (l.y >= h * (1 - ZONE_FRAC)) return 'bottom';
    return null;
  };

  // Count normalized text occurrences within each zone across pages, so a
  // running header/footer repeating on >= 2 pages can be recognized.
  /** @type {Map<string, Set<number>>} */
  const zoneTextPages = new Map();
  for (const l of lines) {
    const z = zoneOf(l);
    if (!z) continue;
    const key = z + '|' + norm(l.text);
    if (!zoneTextPages.has(key)) zoneTextPages.set(key, new Set());
    zoneTextPages.get(key).add(l.page);
  }

  /** @type {Line[]} */ const kept = [];
  /** @type {string[]} */ const dropped = [];

  for (const l of lines) {
    const z = zoneOf(l);
    if (!z) {
      kept.push(l);
      continue;
    }
    // Never strip the name block: top zone of page 1.
    if (z === 'top' && l.page === 1) {
      kept.push(l);
      continue;
    }

    const isPageNum = PAGE_NUM_RE.test(l.text) || BARE_NUM_RE.test(l.text);
    const key = z + '|' + norm(l.text);
    const repeats = pageCount > 1 && (zoneTextPages.get(key)?.size || 0) >= 2;

    if (isPageNum || repeats) {
      dropped.push(
        `artifact: dropped ${z}-zone line on page ${l.page} ` +
          `(${isPageNum ? 'page-number' : 'repeated header/footer'}): "${l.text}"`,
      );
      continue;
    }
    kept.push(l);
  }

  return { lines: kept, dropped };
}

/**
 * @param {string} s
 * @returns {string}
 */
function norm(s) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}
