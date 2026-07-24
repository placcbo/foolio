/**
 * Education parser — institution / degree / field / grade / location / dates,
 * over the shared date-anchored segmentation. Grade is captured verbatim and
 * never reformatted.
 *
 * Pure: section lines in, { items, fields } out.
 */

import { segmentEntries } from './entries.js';
import { findDateRanges, toDateRange } from '../patterns/dates.js';
import { hasDegree, DEGREE_RE, extractGrade } from '../patterns/dictionaries/degrees.js';
import { hasInstitution } from '../patterns/dictionaries/institutions.js';
import { isLocation } from '../patterns/dictionaries/locations.js';
import { CONFIDENCE, fieldMeta } from '../schema/confidence.js';

/**
 * @param {import('../layout/lines.js').Line[]} sectionLines
 * @returns {{ items: import('../schema/resume.js').EducationItem[], fields: Record<string, import('../schema/resume.js').FieldMeta> }}
 */
export function parseEducation(sectionLines) {
  const { entries } = segmentEntries(sectionLines);
  /** @type {import('../schema/resume.js').EducationItem[]} */
  const items = [];
  /** @type {Record<string, import('../schema/resume.js').FieldMeta>} */
  const fields = {};

  for (const block of entries) {
    const item = parseBlock(block);
    const i = items.length;
    items.push(item);
    if (item.institution) {
      fields[`education.${i}.institution`] = fieldMeta(CONFIDENCE.DICTIONARY, 'institution-keyword');
    }
    if (item.degree) fields[`education.${i}.degree`] = fieldMeta(CONFIDENCE.DICTIONARY, 'degree-dict');
    if (item.grade) fields[`education.${i}.grade`] = fieldMeta(CONFIDENCE.STRONG, 'verbatim');
  }
  return { items, fields };
}

/**
 * @param {import('./entries.js').EntryBlock} block
 * @returns {import('../schema/resume.js').EducationItem}
 */
function parseBlock(block) {
  const item = {
    institution: '', degree: '', field: '', location: '',
    dates: toDateRange(block.dates), grade: '', bullets: [],
  };

  for (const line of block.lines) {
    if (line.isBullet) {
      item.bullets.push(line.text.trim());
      continue;
    }
    const grade = extractGrade(line.text);
    if (grade && !item.grade) item.grade = grade; // verbatim

    for (const seg of splitSegments(stripDates(line.text))) {
      if (!seg) continue;
      if (!item.location && isLocation(seg)) {
        item.location = seg;
        continue;
      }
      if (!item.degree && hasDegree(seg)) {
        const { degree, field } = splitDegree(seg);
        item.degree = degree;
        if (field) item.field = field;
        continue;
      }
      if (!item.institution && hasInstitution(seg)) {
        item.institution = seg;
        continue;
      }
    }
  }

  // Fallbacks: if institution/degree still empty, use best-guess header lines.
  if (!item.institution || !item.degree) {
    const headers = block.lines
      .filter((l) => !l.isBullet)
      .flatMap((l) => splitSegments(stripDates(l.text)))
      .filter((s) => s && !isLocation(s) && !extractGrade(s));
    for (const seg of headers) {
      if (!item.degree && hasDegree(seg)) item.degree = splitDegree(seg).degree;
      else if (!item.institution && seg !== item.degree) item.institution = seg;
    }
  }

  return item;
}

/**
 * Split a degree segment into degree + field on " in " / " of " / ",".
 * @param {string} seg
 * @returns {{ degree: string, field: string }}
 */
function splitDegree(seg) {
  // Prefer " in " (the field marker) over " of " — "Master of Science in Data
  // Science" must split to degree "Master of Science", field "Data Science".
  const inMatch = seg.match(/\s+in\s+/i);
  if (inMatch) {
    return {
      degree: seg.slice(0, inMatch.index).trim(),
      field: seg.slice(inMatch.index + inMatch[0].length).trim(),
    };
  }
  const comma = seg.indexOf(',');
  if (comma > 0 && DEGREE_RE.test(seg.slice(0, comma))) {
    return { degree: seg.slice(0, comma).trim(), field: seg.slice(comma + 1).trim() };
  }
  return { degree: seg.trim(), field: '' };
}

function splitSegments(text) {
  return text.split(/\s*[|·]\s*|\s+[—–]\s+/).map((s) => s.trim()).filter(Boolean);
}

function stripDates(text) {
  const ranges = findDateRanges(text);
  if (!ranges.length) return text;
  let out = '';
  let pos = 0;
  for (const r of ranges) {
    out += text.slice(pos, r.index);
    pos = r.index + r.rawText.length;
  }
  out += text.slice(pos);
  return out.replace(/\s*[|·—–-]\s*$/, '').replace(/\s{2,}/g, ' ').trim();
}
