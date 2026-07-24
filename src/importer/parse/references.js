/**
 * References parser — detects the "available upon request" sentence and reports
 * it via meta rather than fabricating a person; otherwise parses name / title /
 * company / email / phone.
 *
 * Pure: section lines in, { items, availableOnRequest, fields } out.
 */

import { extractEmail, extractPhone, stripLeadingPua } from '../patterns/contact.js';
import { hasJobTitle } from '../patterns/dictionaries/jobTitles.js';
import { CONFIDENCE, fieldMeta } from '../schema/confidence.js';

const ON_REQUEST_RE = /references?\s+(?:are\s+)?available\s+(?:up)?on\s+request/i;
const PERSON_NAME_RE = /^[A-Z][a-z'’.-]+(?:\s+[A-Z][a-z'’.-]+){1,3}$/;

/**
 * @param {import('../layout/lines.js').Line[]} lines
 * @returns {{ items: import('../schema/resume.js').Reference[], availableOnRequest: boolean, fields: Record<string, import('../schema/resume.js').FieldMeta> }}
 */
export function parseReferences(lines) {
  /** @type {import('../schema/resume.js').Reference[]} */
  const items = [];
  /** @type {Record<string, import('../schema/resume.js').FieldMeta>} */
  const fields = {};
  let availableOnRequest = false;
  let current = null;

  const startPerson = (name) => {
    current = { name, title: '', company: '', email: '', phone: '' };
    fields[`references.${items.length}.name`] = fieldMeta(CONFIDENCE.TIEBREAK, 'line');
    items.push(current);
  };

  for (const line of lines) {
    const text = stripLeadingPua(line.text).trim();
    if (!text) continue;
    if (ON_REQUEST_RE.test(text)) {
      availableOnRequest = true;
      continue;
    }

    const email = extractEmail(text);
    const phone = extractPhone(text);
    if (email || phone) {
      if (!current) startPerson('');
      if (email && !current.email) current.email = email;
      if (phone && !current.phone) current.phone = phone;
      continue;
    }

    const looksLikeName = PERSON_NAME_RE.test(text) && !hasJobTitle(text) && !/,/.test(text);
    if (looksLikeName && (!current || current.name)) {
      startPerson(text);
    } else if (current && !current.name) {
      current.name = text;
    } else if (current && !current.title) {
      const parts = text.split(/\s*[,|–—]\s*|\s+at\s+/i);
      current.title = parts[0].trim();
      if (parts[1]) current.company = parts[1].trim();
    } else {
      startPerson(text);
    }
  }

  return { items, availableOnRequest, fields };
}
