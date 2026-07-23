/**
 * PDF text extraction — pdf.js text items -> PositionedItem[].
 *
 * This module is PURE and environment-agnostic: it receives an already-loaded
 * pdf.js module (`pdfjs`) rather than importing one, so the browser can pass
 * the worker-configured build and Node tests can pass the legacy build. No
 * side effects, no DOM, no global config here.
 *
 * pdf.js gives text *items* with position matrices, not lines. We normalize
 * each item's geometry and font signals; line/column reconstruction happens in
 * `layout/`.
 */

/**
 * @typedef {Object} PositionedItem
 * @property {string} str
 * @property {number} x        // transform[4]
 * @property {number} y        // flipped so y increases DOWNWARD
 * @property {number} width    // item.width
 * @property {number} height   // item.height
 * @property {number} fontSize // Math.hypot(transform[2], transform[3])
 * @property {string} fontFamily
 * @property {boolean} bold
 * @property {boolean} italic
 * @property {number} page     // 1-based
 */

/**
 * @typedef {Object} PageMeta
 * @property {number} width
 * @property {number} height
 * @property {number} medianFontSize
 * @property {number} page
 */

const BOLD_RE = /bold|black|heavy|semibold|[-,]bd\b/i;
const ITALIC_RE = /italic|oblique|[-,]it\b/i;
// pdf.js emits opaque subset names like "g_d0_f1" when it can't recover a real
// family — boldness can't be read from these, so we don't try (geometry-based
// heading detection compensates downstream).
const OPAQUE_FONT_RE = /^g_d\d+_f\d+$/i;

/**
 * Extract positioned items from every page of a PDF.
 * @param {ArrayBuffer|Uint8Array} source
 * @param {any} pdfjs  a loaded pdf.js module exposing getDocument
 * @returns {Promise<{ items: PositionedItem[], pages: PageMeta[], pageCount: number }>}
 */
export async function extractItems(source, pdfjs) {
  const data = source instanceof Uint8Array ? source : new Uint8Array(source);
  const doc = await pdfjs.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  /** @type {PositionedItem[]} */
  const items = [];
  /** @type {PageMeta[]} */
  const pages = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent({ disableNormalization: false });
    const styles = content.styles || {};

    /** @type {number[]} */
    const fontSizes = [];
    /** @type {PositionedItem[]} */
    const pageItems = [];

    for (const it of content.items) {
      // Some entries are marked-content refs, not text — skip anything without
      // a string. Keep whitespace-only strings: their width is gap evidence for
      // line assembly.
      if (typeof it.str !== 'string' || it.str.length === 0) continue;

      const t = it.transform || [1, 0, 0, 1, 0, 0];
      const fontSize = Math.hypot(t[2], t[3]) || it.height || 0;
      const style = styles[it.fontName] || {};
      const fontFamily = String(style.fontFamily || it.fontName || '');
      const opaque = OPAQUE_FONT_RE.test(fontFamily);

      pageItems.push({
        str: it.str,
        x: t[4],
        y: viewport.height - t[5], // flip: larger y = lower on the page
        width: it.width || 0,
        height: it.height || fontSize,
        fontSize,
        fontFamily,
        bold: opaque ? false : BOLD_RE.test(fontFamily),
        italic: opaque ? false : ITALIC_RE.test(fontFamily),
        page: pageNum,
      });

      if (it.str.trim() !== '') fontSizes.push(fontSize);
    }

    pages.push({
      width: viewport.width,
      height: viewport.height,
      medianFontSize: median(fontSizes) || 10,
      page: pageNum,
    });
    for (const pi of pageItems) items.push(pi);
  }

  return { items, pages, pageCount: doc.numPages };
}

/**
 * @param {number[]} nums
 * @returns {number}
 */
function median(nums) {
  if (!nums.length) return 0;
  const s = nums.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
