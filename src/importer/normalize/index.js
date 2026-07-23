/**
 * Normalization orchestrator (added as the natural barrel for the three
 * normalize/ modules; keeps importResume's wiring to a single call).
 *
 * Runs the Phase 3 sequence over a unified `Line[]`:
 *   1. per line: canonicalize text (parse copy) + keep a display copy,
 *      strip the bullet marker and set `isBullet`, recompute `allCaps`,
 *      normalize `cells`;
 *   2. merge wrapped lines + de-hyphenate.
 *
 * Adds `displayText` to each line (original dashes/quotes preserved); `text`
 * becomes the parse copy. Pure: Line[] in, Line[] out.
 */

import { toParseText, toDisplayText } from './text.js';
import { canonicalizeBullet } from './bullets.js';
import { mergeWrappedLines } from './merge.js';

/**
 * @typedef {import('../layout/lines.js').Line & { displayText?: string }} Line
 */

/**
 * @param {Line[]} lines
 * @returns {Line[]}
 */
export function normalizeLines(lines) {
  const perLine = lines.map((line) => {
    const parse = canonicalizeBullet(toParseText(line.text));
    const display = canonicalizeBullet(toDisplayText(line.displayText ?? line.text));
    const text = parse.text;
    const letters = text.replace(/[^a-z]/gi, '');
    const allCaps = letters.length >= 2 && text === text.toUpperCase() && /[A-Z]/.test(text);
    return {
      ...line,
      text,
      displayText: display.text,
      isBullet: Boolean(line.isBullet) || parse.isBullet,
      allCaps,
      cells: (line.cells || []).map((c) => toParseText(c)).filter((c) => c !== ''),
    };
  });

  return mergeWrappedLines(perLine);
}

export { toParseText, toDisplayText } from './text.js';
export { canonicalizeBullet } from './bullets.js';
export { mergeWrappedLines } from './merge.js';
