/**
 * Interests parser — split like skills into a flat string list, de-duplicated.
 *
 * Pure: section lines in, { items } out.
 */

/**
 * @param {import('../layout/lines.js').Line[]} lines
 * @returns {{ items: string[] }}
 */
export function parseInterests(lines) {
  const seen = new Set();
  /** @type {string[]} */
  const items = [];
  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;
    for (const raw of text.split(/\s*[,;|•·]\s*|\s{2,}/)) {
      const it = raw.trim();
      if (!it || it.length > 40) continue;
      const key = it.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(it);
    }
  }
  return { items };
}
