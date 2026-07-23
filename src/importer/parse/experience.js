/**
 * Experience parser — the hardest field assignment in the system. Company vs.
 * job title is genuinely ambiguous without ML, so every field carries a
 * confidence score rather than pretending to be sure.
 *
 * Per entry block: strip the date, break the header into segments (cells, then
 * pipe/dash/comma splits), pull out any location, then assign company vs. title
 * by best global pairing of dictionary/structural scores. When no strong signal
 * exists, fall back to a position heuristic at confidence 0.45.
 *
 * Layout D (one company, several stacked roles, each with its own date) is
 * detected and emitted as multiple entries sharing the company.
 *
 * Pure: section lines in, { items, fields } out.
 */

import { segmentEntries, lineDate } from './entries.js';
import { findDateRanges, toDateRange } from '../patterns/dates.js';
import { hasCompanySuffix } from '../patterns/dictionaries/companySuffixes.js';
import { hasJobTitle, hasSeniority } from '../patterns/dictionaries/jobTitles.js';
import { isLocation } from '../patterns/dictionaries/locations.js';
import { CONFIDENCE, fieldMeta } from '../schema/confidence.js';

/**
 * @typedef {import('../layout/lines.js').Line} Line
 * @typedef {import('../schema/resume.js').ExperienceItem} ExperienceItem
 */

const HEADER_MAX_WORDS = 8;

/**
 * @param {Line[]} sectionLines
 * @returns {{ items: ExperienceItem[], fields: Record<string, import('../schema/resume.js').FieldMeta> }}
 */
export function parseExperience(sectionLines) {
  const { entries } = segmentEntries(sectionLines);
  /** @type {ExperienceItem[]} */
  const items = [];
  /** @type {Record<string, import('../schema/resume.js').FieldMeta>} */
  const fields = {};

  for (const block of entries) {
    for (const parsed of parseBlock(block)) {
      const idx = items.length;
      items.push(parsed.item);
      fields[`experience.${idx}.company`] = parsed.companyMeta;
      fields[`experience.${idx}.title`] = parsed.titleMeta;
      if (parsed.item.dates.rawText) {
        fields[`experience.${idx}.dates`] = fieldMeta(
          block.dates?.confidence ?? CONFIDENCE.STRUCTURAL,
          'date-anchored',
        );
      }
    }
  }

  return { items, fields };
}

/**
 * Split a block into header lines, bullets, and description prose.
 * @param {import('./entries.js').EntryBlock} block
 */
function partition(block) {
  /** @type {Line[]} */ const header = [];
  /** @type {string[]} */ const bullets = [];
  /** @type {Line[]} */ const desc = [];
  let inHeader = true;
  for (const line of block.lines) {
    if (line.isBullet) {
      inHeader = false;
      bullets.push(cleanBullet(line.text));
      continue;
    }
    // A leading line is header while it looks like one: short, or carrying a
    // date (the "Company | Location | Dates" line is long but is still header),
    // or bold. Only long, date-less, non-bold prose becomes description.
    const words = line.text.trim() ? line.text.trim().split(/\s+/).length : 0;
    const headerish = words <= HEADER_MAX_WORDS || Boolean(lineDate(line)) || line.bold;
    if (inHeader && headerish) header.push(line);
    else {
      inHeader = false;
      desc.push(line);
    }
  }
  return { header, bullets, description: desc.map((l) => l.text).join(' ').trim() };
}

/**
 * Parse one entry block into one or more experience items.
 * @param {import('./entries.js').EntryBlock} block
 */
function parseBlock(block) {
  const { header, bullets, description } = partition(block);

  // Layout D: >= 2 header lines that are each a role (title token) with a date,
  // plus a company-suffix line without a title -> one company, several roles.
  const roleLines = header.filter((l) => lineDate(l) && hasJobTitle(stripDates(l.text)));
  const companyLine = header.find(
    (l) => hasCompanySuffix(stripDates(l.text)) && !hasJobTitle(stripDates(l.text)),
  );
  if (roleLines.length >= 2 && companyLine) {
    const company = firstSegment(companyLine);
    return roleLines.map((rl, i) => {
      const title = stripDates(rl.text).trim();
      return {
        item: {
          company,
          title,
          location: '',
          dates: toDateRange(lineDate(rl)),
          bullets: i === 0 ? bullets : [],
          description: i === 0 ? description : '',
        },
        companyMeta: fieldMeta(CONFIDENCE.DICTIONARY, 'company-suffix'),
        titleMeta: fieldMeta(CONFIDENCE.DICTIONARY, 'title-dictionary'),
      };
    });
  }

  const { company, title, location, companyMeta, titleMeta } = classifyHeader(header);
  return [
    {
      item: {
        company,
        title,
        location,
        dates: toDateRange(block.dates),
        bullets,
        description,
      },
      companyMeta,
      titleMeta,
    },
  ];
}

/**
 * Classify a header's segments into company / title / location.
 * @param {Line[]} header
 */
function classifyHeader(header) {
  let location = '';
  /** @type {{text:string, line:number}[]} */
  const parts = [];

  header.forEach((line, li) => {
    let segs;
    if (line.cells && line.cells.length > 1) {
      segs = line.cells.filter((c) => c.trim() && !isPureDate(c));
    } else {
      segs = [stripDates(line.text)];
    }
    for (const seg of segs) {
      for (const sub of splitSegment(stripDates(seg))) {
        const s = stripPreposition(sub.trim());
        if (!s.text) continue;
        if (isLocation(s.text)) {
          if (!location) location = s.text;
          continue;
        }
        // Comma-separated title/company packing ("Senior Dev, Acme Inc").
        if (/,\s/.test(s.text)) {
          for (const piece of s.text.split(/,\s*/)) {
            const p = piece.trim();
            if (!p) continue;
            if (isLocation(p)) {
              if (!location) location = p;
            } else {
              parts.push({ text: p, line: li, companyBoost: s.companyBoost });
            }
          }
        } else {
          parts.push({ text: s.text, line: li, companyBoost: s.companyBoost });
        }
      }
    }
  });

  return assign(parts, location);
}

/**
 * Best-pairing assignment of company vs. title across candidate parts.
 * @param {{text:string, line:number, companyBoost?:number}[]} parts
 * @param {string} location
 */
function assign(parts, location) {
  const scored = parts.map((p) => ({
    text: p.text,
    line: p.line,
    company: (hasCompanySuffix(p.text) ? 3 : 0) + (p.companyBoost || 0),
    title: (hasJobTitle(p.text) ? 3 : 0) + (hasSeniority(p.text) ? 1.5 : 0),
  }));

  let companyPart = null;
  let titlePart = null;

  if (scored.length === 1) {
    const only = scored[0];
    if (only.title >= only.company) titlePart = only;
    else companyPart = only;
  } else if (scored.length >= 2) {
    // Evaluate every ordered (company, title) pair; pick the max total.
    let best = -Infinity;
    for (let i = 0; i < scored.length; i += 1) {
      for (let j = 0; j < scored.length; j += 1) {
        if (i === j) continue;
        const total = scored[i].company + scored[j].title;
        if (total > best) {
          best = total;
          companyPart = scored[i];
          titlePart = scored[j];
        }
      }
    }
    // If neither has any signal, fall back to position: first = title,
    // second = company (dominant ATS layout), at tiebreak confidence.
    if (companyPart.company === 0 && titlePart.title === 0) {
      titlePart = scored[0];
      companyPart = scored[1];
    }
  }

  return {
    company: companyPart ? companyPart.text : '',
    title: titlePart ? titlePart.text : '',
    location,
    companyMeta: metaFor(companyPart, 'company', companyPart ? companyPart.company : -1),
    titleMeta: metaFor(titlePart, 'title', titlePart ? titlePart.title : -1),
  };
}

/**
 * @param {{}|null} part
 * @param {string} kind
 * @param {number} score
 */
function metaFor(part, kind, score) {
  if (!part) return fieldMeta(CONFIDENCE.ABSENT, `${kind}-absent`);
  if (score >= 3) return fieldMeta(CONFIDENCE.DICTIONARY, `${kind}-dictionary`);
  if (score > 0) return fieldMeta(CONFIDENCE.STRUCTURAL, `${kind}-partial`);
  return fieldMeta(CONFIDENCE.TIEBREAK, `${kind}-position`);
}

/* ------------------------------------------------------------------ utils */

function splitSegment(text) {
  return text.split(/\s*[|·]\s*|\s+[—–]\s+/).filter((s) => s.trim());
}

function stripPreposition(text) {
  const m = text.match(/^(?:at|for)\s+/i) || text.match(/^@\s*/);
  if (m) return { text: text.slice(m[0].length).trim(), companyBoost: 3 };
  return { text, companyBoost: 0 };
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
  return out.replace(/\s*[|·—–-]\s*$/, '').replace(/^\s*[|·—–-]\s*/, '').replace(/\s{2,}/g, ' ').trim();
}

function isPureDate(text) {
  const t = text.trim();
  const ranges = findDateRanges(t);
  return ranges.length === 1 && ranges[0].rawText.length >= t.replace(/[^A-Za-z0-9]/g, '').length;
}

function firstSegment(line) {
  return splitSegment(stripDates(line.text))[0]?.trim() || stripDates(line.text).trim();
}

function cleanBullet(text) {
  return text.replace(/\s*[;,]\s*$/, '').trim();
}
