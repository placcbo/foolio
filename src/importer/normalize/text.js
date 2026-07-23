/**
 * Text normalization — unicode, whitespace, ligatures, dashes, quotes.
 *
 * Two outputs per string:
 *   - PARSE text: fully canonicalized (dashes -> "-", smart quotes -> straight)
 *     so regexes and dictionaries match reliably.
 *   - DISPLAY text: NFKC + whitespace + ligatures only — keeps the original
 *     dashes and curly quotes so what we show the user reads as they wrote it.
 *
 * Steps run in this order (order matters): NFKC, whitespace, ligatures, then
 * (parse only) dashes and smart quotes, then collapse + trim.
 *
 * Regexes use \u escapes rather than literal invisible characters: several of
 * these codepoints are unprintable (and U+2028/U+2029 are line terminators that
 * cannot legally sit inside a regex literal), so escapes keep the source
 * unambiguous and parseable.
 *
 * Pure string transforms.
 */

// Zero-width / BOM: remove entirely. (ZWSP, ZWNJ, ZWJ, word-joiner, BOM.)
const ZERO_WIDTH_RE = /[​‌‍⁠﻿]/g;
// Non-breaking / en..hair / narrow / medium-math / ideographic spaces -> space.
const NBSP_RE = /[   -   　]/g;

// Ligatures. NFKC already expands most, but PDFs sometimes carry them past
// NFKC in odd fonts, so we repair explicitly too.
const LIGATURES = [
  [/ﬀ/g, 'ff'],
  [/ﬁ/g, 'fi'],
  [/ﬂ/g, 'fl'],
  [/ﬃ/g, 'ffi'],
  [/ﬄ/g, 'ffl'],
  [/ﬅ/g, 'st'],
  [/ﬆ/g, 'st'],
];

// Dashes -> hyphen-minus (parse copy only).
const DASH_RE = /[‐‑‒–—―−]/g;

// Smart quotes -> straight (parse copy only).
const SINGLE_QUOTE_RE = /[‘’‚‛′`´]/g;
const DOUBLE_QUOTE_RE = /[“”„‟″]/g;

/**
 * Shared prefix: NFKC, strip zero-width, fold odd spaces, repair ligatures.
 * @param {string} s
 * @returns {string}
 */
function base(s) {
  let out = (s || '').normalize('NFKC').replace(ZERO_WIDTH_RE, '').replace(NBSP_RE, ' ');
  for (const [re, rep] of LIGATURES) out = out.replace(re, rep);
  return out;
}

/**
 * Collapse runs of spaces/tabs and trim.
 * @param {string} s
 * @returns {string}
 */
function collapse(s) {
  return s.replace(/[ \t]{2,}/g, ' ').trim();
}

/**
 * Full canonicalization for parsing.
 * @param {string} s
 * @returns {string}
 */
export function toParseText(s) {
  let out = base(s);
  out = out.replace(DASH_RE, '-');
  out = out.replace(SINGLE_QUOTE_RE, "'").replace(DOUBLE_QUOTE_RE, '"');
  return collapse(out);
}

/**
 * Display normalization — keeps original dashes and curly quotes.
 * @param {string} s
 * @returns {string}
 */
export function toDisplayText(s) {
  return collapse(base(s));
}
