/**
 * Month name -> month number (1..12), across English + the languages most
 * common in real resumes (Spanish, French, German, Portuguese), with the usual
 * abbreviations. Data only.
 */

/** @type {Record<string, number>} */
const RAW = {
  // English
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4,
  may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8,
  september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11,
  december: 12, dec: 12,
  // Spanish
  enero: 1, ene: 1, febrero: 2, marzo: 3, abril: 4, abr: 4, mayo: 5,
  junio: 6, julio: 7, agosto: 8, ago: 8, septiembre: 9, setiembre: 9, set: 9,
  octubre: 10, noviembre: 11, diciembre: 12, dic: 12,
  // French
  janvier: 1, fevrier: 2, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, aout: 8, août: 8, septembre: 9, octobre: 10, novembre: 11,
  decembre: 12, décembre: 12,
  // German
  januar: 1, februar: 2, marz: 3, märz: 3, dezember: 12, oktober: 10,
  // (april/mai/juni/juli/august/september/november already covered)
  juni: 6, juli: 7,
  // Portuguese
  janeiro: 1, fevereiro: 2, março: 3, marco: 3, maio: 5, junho: 6, julho: 7,
  setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

/** Lowercased-key lookup map. */
export const MONTHS = new Map(Object.entries(RAW));

/**
 * @param {string} token
 * @returns {number|null} 1..12 or null
 */
export function monthNumber(token) {
  if (!token) return null;
  const key = token.toLowerCase().replace(/\.$/, '');
  return MONTHS.has(key) ? MONTHS.get(key) : null;
}

/**
 * Regex-source alternation of all month names, longest first so "september"
 * wins over "sep". Callers wrap it in a group.
 */
export const MONTH_ALT = [...MONTHS.keys()]
  .sort((a, b) => b.length - a.length)
  .map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');
