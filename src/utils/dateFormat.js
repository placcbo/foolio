const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

export const DATE_FORMATS = [
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { id: 'Mon YYYY', label: 'Mon YYYY (Jan 2020)' },
  { id: 'Month YYYY', label: 'Month YYYY (January 2020)' },
];

function monthIndexFromToken(token) {
  const t = token.toLowerCase().replace('.', '');
  const full = MONTHS.findIndex((m) => m.toLowerCase() === t);
  if (full !== -1) return full;
  return MONTHS_SHORT.findIndex((m) => m.toLowerCase() === t);
}

// Recognizes a handful of common ways people type dates in a free-text
// field (ISO, slash-separated, "Jan 2020", bare year) so we can redisplay
// them in the format the user picked. Anything else (e.g. "Present") is
// left untouched rather than mangled.
export function parseFlexibleDate(input) {
  if (!input) return null;
  const str = input.trim();
  if (!str) return null;

  let m = str.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (m) return { year: +m[1], month: +m[2], day: m[3] ? +m[3] : null };

  m = str.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return { year: +m[2], month: +m[1], day: null };

  m = str.match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (m) {
    const idx = monthIndexFromToken(m[1]);
    if (idx !== -1) return { year: +m[2], month: idx + 1, day: null };
  }

  m = str.match(/^(\d{4})$/);
  if (m) return { year: +m[1], month: null, day: null };

  return null;
}

export function formatFlexibleDate(input, formatId = 'DD/MM/YYYY') {
  const parsed = parseFlexibleDate(input);
  if (!parsed) return input;
  const { year, month, day } = parsed;
  const pad = (n) => String(n).padStart(2, '0');

  switch (formatId) {
    case 'MM/DD/YYYY':
      if (day) return `${pad(month)}/${pad(day)}/${year}`;
      return month ? `${pad(month)}/${year}` : `${year}`;
    case 'YYYY-MM-DD':
      if (day) return `${year}-${pad(month)}-${pad(day)}`;
      return month ? `${year}-${pad(month)}` : `${year}`;
    case 'Month YYYY':
      return month ? `${MONTHS[month - 1]} ${year}` : `${year}`;
    case 'Mon YYYY':
      return month ? `${MONTHS_SHORT[month - 1]} ${year}` : `${year}`;
    case 'DD/MM/YYYY':
    default:
      if (day) return `${pad(day)}/${pad(month)}/${year}`;
      return month ? `${pad(month)}/${year}` : `${year}`;
  }
}

export function formatEntryDateRange(entry, formatId) {
  return {
    start: formatFlexibleDate(entry.start, formatId),
    end: formatFlexibleDate(entry.end, formatId),
  };
}
