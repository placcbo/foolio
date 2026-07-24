/**
 * Certifications parser — name + issuer (split on " – ", " | ", " by ",
 * " from "), a single date, and a URL. Recognizes "Issued", "Expires",
 * "Credential ID".
 *
 * Pure: section lines in, { items, fields } out.
 */

import { findDateRanges } from '../patterns/dates.js';
import { extractWebsite } from '../patterns/contact.js';
import { CONFIDENCE, fieldMeta } from '../schema/confidence.js';

const SPLIT_RE = /\s+[–—|]\s+|\s+(?:by|from)\s+/i;

/**
 * @param {import('../layout/lines.js').Line[]} lines
 * @returns {{ items: import('../schema/resume.js').Certification[], fields: Record<string, import('../schema/resume.js').FieldMeta> }}
 */
export function parseCertifications(lines) {
  /** @type {import('../schema/resume.js').Certification[]} */
  const items = [];
  /** @type {Record<string, import('../schema/resume.js').FieldMeta>} */
  const fields = {};

  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;

    const url = extractWebsite(text);
    const dates = findDateRanges(text);
    const date = dates.length ? dates[0].rawText : '';

    // Strip date + credential-id noise before splitting name/issuer.
    let clean = text;
    for (const d of dates) clean = clean.replace(d.rawText, '');
    clean = clean
      .replace(/\b(issued|obtained|earned|completed)\b\s*:?/i, '')
      .replace(/\b(expires?|valid until)\b.*$/i, '')
      .replace(/\bcredential id\b\s*:?.*$/i, '')
      .replace(url, '')
      .replace(/\s*[|–—-]\s*$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const parts = clean.split(SPLIT_RE).map((s) => s.trim()).filter(Boolean);
    const name = parts[0] || clean;
    const issuer = parts[1] || '';
    if (!name) continue;

    const i = items.length;
    items.push({ name, issuer, date, url });
    fields[`certifications.${i}.name`] = fieldMeta(CONFIDENCE.STRUCTURAL, 'line');
  }

  return { items, fields };
}
