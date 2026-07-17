import { getSectionMeta } from '../data/sectionTypes';

// There's no backend/LLM in this app to parse a resume "properly" — this is
// a pattern-matching best guess (section headers, date ranges, bullets).
// It won't be perfect on every resume format, but it turns a blank page
// into a rough draft the person can clean up, which is the actual goal:
// removing the blank-page problem, not achieving perfect extraction.

const MONTH = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const DATE_TOKEN = `(?:${MONTH}\\.?\\s+\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4})`;
const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:-|–|—|to)\\s*(present|current|now|${DATE_TOKEN})`,
  'i'
);
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z.]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const BULLET_RE = /^[•\-*\u2022\u25CF\u25AA\u2023◦o]\s+/;

// Section headers we can recognize, mapped to keywords that would appear on
// their own line in a real resume (case-insensitive, order matters — check
// longer/more specific keywords before generic ones).
const SECTION_KEYWORDS = [
  { type: 'summary', keywords: ['summary', 'profile', 'objective', 'about me'] },
  { type: 'experience', keywords: ['professional experience', 'work experience', 'employment history', 'experience'] },
  { type: 'education', keywords: ['education', 'academic background'] },
  { type: 'skills', keywords: ['technical skills', 'core competencies', 'skills'] },
  { type: 'languages', keywords: ['languages'] },
  { type: 'certificates', keywords: ['certifications', 'certificates', 'licenses'] },
  { type: 'projects', keywords: ['projects'] },
  { type: 'courses', keywords: ['courses', 'training'] },
  { type: 'awards', keywords: ['awards', 'honors', 'achievements'] },
  { type: 'organisations', keywords: ['volunteering', 'volunteer experience', 'organisations', 'organizations'] },
  { type: 'publications', keywords: ['publications'] },
  { type: 'interests', keywords: ['interests', 'hobbies'] },
  { type: 'references', keywords: ['references'] },
];

function detectHeader(line) {
  const clean = line.trim().replace(/[:：]$/, '');
  if (!clean || clean.length > 40) return null;
  if (EMAIL_RE.test(clean) || PHONE_RE.test(clean)) return null;
  const lower = clean.toLowerCase();
  for (const { type, keywords } of SECTION_KEYWORDS) {
    if (keywords.some((kw) => lower === kw || lower === kw + 's')) return type;
  }
  return null;
}

function splitBlocks(lines) {
  // Group lines into blocks separated by one-or-more blank lines — each
  // block is treated as one entry (one job, one degree, etc).
  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (line.trim() === '') {
      if (current.length) blocks.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current);
  return blocks;
}

function parseEntryBlock(block) {
  const lines = [...block];
  let start = '';
  let end = '';
  let location = '';

  // Pull the date range out of whichever line has it, wherever it sits.
  const dateLineIndex = lines.findIndex((l) => DATE_RANGE_RE.test(l));
  if (dateLineIndex !== -1) {
    const m = lines[dateLineIndex].match(DATE_RANGE_RE);
    start = m[1];
    end = /present|current|now/i.test(m[2]) ? 'Present' : m[2];
    const remainder = lines[dateLineIndex].replace(DATE_RANGE_RE, '').replace(/[,|·•]+/g, ' ').trim();
    if (remainder && remainder.length < 40) location = remainder;
    lines.splice(dateLineIndex, 1);
  }

  const heading = (lines.shift() || '').replace(BULLET_RE, '').trim();
  let subheading = '';
  // Next line is the subheading (company/school) only if it doesn't already
  // look like a bullet point of the description.
  if (lines.length && !BULLET_RE.test(lines[0]) && lines[0].length < 80) {
    subheading = lines.shift().trim();
  }
  if (!location && lines.length && lines[0].length < 40 && lines[0].includes(',') && !BULLET_RE.test(lines[0])) {
    location = lines.shift().trim();
  }

  const descriptionLines = lines.map((l) => l.replace(BULLET_RE, '').trim()).filter(Boolean);
  const description = descriptionLines.length
    ? `<ul>${descriptionLines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`
    : '';

  return { id: makeId('entry'), heading, subheading, link: '', location, start, end, description, hidden: false };
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function makeId(prefix) {
  return `${prefix}-import-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function parseResumeText(rawText) {
  const lines = rawText.replace(/\r/g, '').split('\n');

  // 1. Find where the first real section header shows up — everything
  // before that is the "header block" (name, title, contact info).
  let firstHeaderIdx = lines.length;
  let firstHeaderType = null;
  for (let i = 0; i < lines.length; i++) {
    const type = detectHeader(lines[i]);
    if (type) {
      firstHeaderIdx = i;
      firstHeaderType = type;
      break;
    }
  }

  const headerLines = lines.slice(0, firstHeaderIdx).map((l) => l.trim()).filter(Boolean);
  const basics = { name: '', title: '', email: '', phone: '', address: '' };
  const leftover = [];
  headerLines.forEach((line, i) => {
    const emailMatch = line.match(EMAIL_RE);
    const phoneMatch = line.match(PHONE_RE);
    if (emailMatch) {
      basics.email = emailMatch[0];
      const rest = line.replace(emailMatch[0], '').replace(/[,|·•]+/g, ' ').trim();
      if (rest) leftover.push(rest);
      return;
    }
    if (phoneMatch) {
      basics.phone = phoneMatch[0].trim();
      const rest = line.replace(phoneMatch[0], '').replace(/[,|·•]+/g, ' ').trim();
      if (rest) leftover.push(rest);
      return;
    }
    if (i === 0 && !basics.name) {
      basics.name = line;
      return;
    }
    leftover.push(line);
  });
  if (leftover.length) {
    basics.title = leftover[0];
    if (leftover[1]) basics.address = leftover.slice(1).join(', ');
  }

  // 2. Walk the remaining lines, splitting into sections at each header.
  const sections = [];
  let cursor = firstHeaderIdx;
  let pendingType = firstHeaderType;
  while (cursor < lines.length && pendingType) {
    let next = cursor + 1;
    let nextType = null;
    while (next < lines.length) {
      const t = detectHeader(lines[next]);
      if (t) {
        nextType = t;
        break;
      }
      next++;
    }
    const body = lines.slice(cursor + 1, next);
    sections.push(buildSection(pendingType, body));
    cursor = next;
    pendingType = nextType;
  }

  return { basics, sections: sections.filter(Boolean) };
}

function buildSection(type, bodyLines) {
  const meta = getSectionMeta(type);
  if (!meta) return null;
  const trimmed = bodyLines.map((l) => l.trimEnd());
  const nonEmpty = trimmed.filter((l) => l.trim());
  if (!nonEmpty.length) return null;

  const base = { id: makeId(type), type, title: meta.label, kind: meta.kind, hidden: false };

  if (meta.kind === 'text') {
    const paragraphs = trimmed.join('\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const content = paragraphs.map((p) => `<p>${escapeHtml(p.replace(/\n/g, ' '))}</p>`).join('');
    return { ...base, content };
  }

  if (meta.kind === 'tags') {
    const joined = nonEmpty.join(', ');
    const tags = joined
      .split(/[,|•\u2022\n]/)
      .map((t) => t.replace(BULLET_RE, '').trim())
      .filter(Boolean);
    return { ...base, tags };
  }

  // entries
  const blocks = splitBlocks(trimmed);
  const entries = blocks.map(parseEntryBlock).filter((e) => e.heading);
  if (!entries.length) return null;
  return { ...base, entries };
}