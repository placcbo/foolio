/**
 * Column detection — banded gutter detection at the ITEM level.
 *
 * This must run BEFORE line assembly. A two-column resume places sidebar and
 * main-column text at the same y; if lines were assembled first, those items
 * would cluster into a single "CONTACT   SUMMARY" line and the gutter would be
 * gone. So we detect the gutter from item geometry and tag each item with a
 * reading-order group; `lines.js` then assembles lines within each group.
 *
 * A resume is NOT globally N-column: it usually has a full-width header, then
 * columns below. We detect a gutter per horizontal band and only treat it as a
 * real column boundary when it persists over a tall run of bands.
 *
 *   group 'A' — full-width band above the column region (header)
 *   group 'L' — left column of the region
 *   group 'R' — right column of the region
 *   group 'B' — full-width band below the region (footer/full-width tail)
 *
 * Reading order is A, L, R, B per page. Pure: tags items, returns gutters.
 */

/**
 * @typedef {import('../extract/pdf.js').PositionedItem & { group?: string, column?: number }} TaggedItem
 * @typedef {import('../extract/pdf.js').PageMeta} PageMeta
 */

/**
 * @typedef {Object} Gutter
 * @property {number} page
 * @property {number} xStart
 * @property {number} xEnd
 * @property {number} yStart
 * @property {number} yEnd
 */

const BAND_HEIGHT = 40;
const BUCKET = 2; // px per x-bucket
const MIN_GUTTER_FRAC = 0.04; // >= 4% page width
const MIN_REGION_HEIGHT_FRAC = 0.25; // >= 25% page height
const MIN_REGION_ITEMS = 10;
const MIN_SIDE_ITEMS = 5; // each column must carry this many, else false gutter

export const READING_GROUPS = ['A', 'L', 'R', 'B'];

/**
 * Tag every item with a reading-order group + column. Mutates items in place
 * (adds `.group` and `.column`) and returns column metadata.
 * @param {TaggedItem[]} items
 * @param {PageMeta[]} pages
 * @returns {{ items: TaggedItem[], multiColumn: boolean, gutters: Gutter[] }}
 */
export function assignColumns(items, pages) {
  /** @type {Gutter[]} */
  const gutters = [];
  let multiColumn = false;

  for (const page of pages) {
    const pageItems = items.filter((i) => i.page === page.page);
    if (!pageItems.length) continue;

    const region = detectRegion(pageItems, page);
    let applied = false;
    if (region) {
      const { y0, y1, gx } = region;
      const inRegion = pageItems.filter((i) => center(i) >= 0 && i.y >= y0 && i.y < y1);
      const left = inRegion.filter((i) => center(i) <= gx);
      const right = inRegion.filter((i) => center(i) > gx);
      if (left.length >= MIN_SIDE_ITEMS && right.length >= MIN_SIDE_ITEMS) {
        multiColumn = true;
        applied = true;
        gutters.push({
          page: page.page,
          xStart: region.xStart,
          xEnd: region.xEnd,
          yStart: y0,
          yEnd: y1,
        });
        for (const it of pageItems) {
          if (it.y < y0) {
            it.group = 'A';
            it.column = 0;
          } else if (it.y >= y1) {
            it.group = 'B';
            it.column = 0;
          } else if (center(it) <= gx) {
            it.group = 'L';
            it.column = 0;
          } else {
            it.group = 'R';
            it.column = 1;
          }
        }
      }
    }
    if (!applied) {
      for (const it of pageItems) {
        it.group = 'A';
        it.column = 0;
      }
    }
  }

  return { items, multiColumn, gutters };
}

/**
 * Detect at most one two-column region on a page (the common sidebar/main
 * split). Occupancy is built from item spans.
 * @param {TaggedItem[]} pageItems
 * @param {PageMeta} page
 * @returns {null | { y0:number, y1:number, gx:number, xStart:number, xEnd:number }}
 */
function detectRegion(pageItems, page) {
  const pageW = page.width;
  const pageH = page.height;
  const numBuckets = Math.ceil(pageW / BUCKET);

  const contentMinX = Math.min(...pageItems.map((i) => i.x));
  const contentMaxX = Math.max(...pageItems.map((i) => i.x + i.width));

  const numBands = Math.ceil(pageH / BAND_HEIGHT);
  /** @type {([number, number] | null)[]} */
  const bandGutters = [];
  for (let b = 0; b < numBands; b += 1) {
    const y0 = b * BAND_HEIGHT;
    const y1 = y0 + BAND_HEIGHT;
    const bandItems = pageItems.filter((i) => i.y >= y0 && i.y < y1);
    if (!bandItems.length) {
      bandGutters.push(null);
      continue;
    }
    const occ = new Uint8Array(numBuckets);
    for (const it of bandItems) {
      const a = Math.max(0, Math.floor(it.x / BUCKET));
      const c = Math.min(numBuckets - 1, Math.ceil((it.x + it.width) / BUCKET));
      for (let k = a; k <= c; k += 1) occ[k] = 1;
    }
    bandGutters.push(findGutter(occ, pageW, contentMinX, contentMaxX));
  }

  // Merge vertically-adjacent bands whose gutters overlap in x.
  /** @type {({ bands:number[], xStart:number, xEnd:number })[]} */
  const runs = [];
  let cur = null;
  for (let i = 0; i < bandGutters.length; i += 1) {
    const g = bandGutters[i];
    if (!g) {
      cur = null;
      continue;
    }
    if (cur && overlaps(cur.xStart, cur.xEnd, g[0], g[1])) {
      cur.bands.push(i);
      cur.xStart = Math.max(cur.xStart, g[0]);
      cur.xEnd = Math.min(cur.xEnd, g[1]);
    } else {
      cur = { bands: [i], xStart: g[0], xEnd: g[1] };
      runs.push(cur);
    }
  }

  let best = null;
  let bestSpan = 0;
  for (const run of runs) {
    const y0 = run.bands[0] * BAND_HEIGHT;
    const y1 = (run.bands[run.bands.length - 1] + 1) * BAND_HEIGHT;
    const span = y1 - y0;
    if (span < MIN_REGION_HEIGHT_FRAC * pageH) continue;
    const count = pageItems.filter((i) => i.y >= y0 && i.y < y1).length;
    if (count < MIN_REGION_ITEMS) continue;
    if (span > bestSpan) {
      bestSpan = span;
      best = { y0, y1, gx: (run.xStart + run.xEnd) / 2, xStart: run.xStart, xEnd: run.xEnd };
    }
  }
  return best;
}

/**
 * Widest interior zero-occupancy run wide enough to be a gutter.
 * @param {Uint8Array} occ
 * @param {number} pageW
 * @param {number} contentMinX
 * @param {number} contentMaxX
 * @returns {[number, number] | null}
 */
function findGutter(occ, pageW, contentMinX, contentMaxX) {
  const minWidth = MIN_GUTTER_FRAC * pageW;
  let bestStart = -1;
  let bestEnd = -1;
  let runStart = -1;
  for (let i = 0; i <= occ.length; i += 1) {
    const zero = i < occ.length && occ[i] === 0;
    if (zero && runStart === -1) {
      runStart = i;
    } else if (!zero && runStart !== -1) {
      const x0 = runStart * BUCKET;
      const x1 = i * BUCKET;
      if (x0 > contentMinX + 2 && x1 < contentMaxX - 2 && x1 - x0 >= minWidth) {
        if (x1 - x0 > bestEnd - bestStart) {
          bestStart = x0;
          bestEnd = x1;
        }
      }
      runStart = -1;
    }
  }
  return bestStart === -1 ? null : [bestStart, bestEnd];
}

function center(it) {
  return it.x + it.width / 2;
}

function overlaps(a0, a1, b0, b1) {
  return a0 <= b1 && b0 <= a1;
}
