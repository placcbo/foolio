/**
 * Projects parser — name, technologies, url, dates, description, bullets.
 * Name is the first non-bullet header line (often before " — " or " | ").
 * Technologies come from a "Tech:/Stack:/Tools:/Built with/Technologies:" line
 * or a trailing parenthesized list.
 *
 * Pure: section lines in, { items, fields } out.
 */

import { segmentEntries } from './entries.js';
import { toDateRange } from '../patterns/dates.js';
import { extractWebsite } from '../patterns/contact.js';
import { CONFIDENCE, fieldMeta } from '../schema/confidence.js';

const TECH_PREFIX_RE = /^(?:tech|stack|tools|technologies|built with)\s*[:—–-]?\s*/i;

/**
 * @param {import('../layout/lines.js').Line[]} sectionLines
 * @returns {{ items: import('../schema/resume.js').ProjectItem[], fields: Record<string, import('../schema/resume.js').FieldMeta> }}
 */
export function parseProjects(sectionLines) {
  const { entries } = segmentEntries(sectionLines);
  /** @type {import('../schema/resume.js').ProjectItem[]} */
  const items = [];
  /** @type {Record<string, import('../schema/resume.js').FieldMeta>} */
  const fields = {};

  for (const block of entries) {
    const item = {
      name: '', description: '', technologies: [], url: '',
      dates: toDateRange(block.dates), bullets: [],
    };
    /** @type {string[]} */
    const descParts = [];

    for (const line of block.lines) {
      const text = line.text.trim();
      if (!text) continue;

      if (line.isBullet) {
        item.bullets.push(text);
        continue;
      }
      const url = extractWebsite(text);
      if (url && !item.url) item.url = url;

      if (TECH_PREFIX_RE.test(text)) {
        item.technologies = splitTech(text.replace(TECH_PREFIX_RE, ''));
        continue;
      }
      if (!item.name) {
        const paren = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
        const head = paren ? paren[1] : text;
        item.name = head.split(/\s+[—–|]\s+/)[0].replace(url, '').trim() || head.trim();
        if (paren && /,/.test(paren[2])) item.technologies = splitTech(paren[2]);
        continue;
      }
      descParts.push(text);
    }

    item.description = descParts.join(' ').trim();
    const i = items.length;
    items.push(item);
    if (item.name) fields[`projects.${i}.name`] = fieldMeta(CONFIDENCE.STRUCTURAL, 'first-line');
  }

  return { items, fields };
}

function splitTech(text) {
  return text.split(/\s*[,;|/]\s*|\s{2,}/).map((s) => s.trim()).filter(Boolean);
}
