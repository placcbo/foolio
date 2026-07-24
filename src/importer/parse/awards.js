/**
 * Awards parser — title, issuer, date, description.
 *
 * Pure: section lines in, { items, fields } out.
 */

import { findDateRanges } from '../patterns/dates.js';
import { CONFIDENCE, fieldMeta } from '../schema/confidence.js';

const SPLIT_RE = /\s+[–—|]\s+|\s+(?:by|from)\s+/i;

/**
 * @param {import('../layout/lines.js').Line[]} lines
 * @returns {{ items: import('../schema/resume.js').Award[], fields: Record<string, import('../schema/resume.js').FieldMeta> }}
 */
export function parseAwards(lines) {
  /** @type {import('../schema/resume.js').Award[]} */
  const items = [];
  /** @type {Record<string, import('../schema/resume.js').FieldMeta>} */
  const fields = {};
  let current = null;

  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;

    // A bullet or clearly-continuation line extends the previous award.
    if (line.isBullet && current) {
      current.description = (current.description ? current.description + ' ' : '') + text;
      continue;
    }

    const dates = findDateRanges(text);
    const date = dates.length ? dates[0].rawText : '';
    let clean = text;
    for (const d of dates) clean = clean.replace(d.rawText, '');
    clean = clean.replace(/\s*[|–—-]\s*$/, '').replace(/\s{2,}/g, ' ').trim();

    const parts = clean.split(SPLIT_RE).map((s) => s.trim()).filter(Boolean);
    const i = items.length;
    current = { title: parts[0] || clean, issuer: parts[1] || '', date, description: '' };
    items.push(current);
    fields[`awards.${i}.title`] = fieldMeta(CONFIDENCE.STRUCTURAL, 'line');
  }

  return { items, fields };
}
