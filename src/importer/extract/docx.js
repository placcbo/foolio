/**
 * DOCX extraction — jszip + raw OOXML walk -> Line[].
 *
 * The whole point of walking the XML ourselves (rather than just using mammoth)
 * is to survive two traps that lose real resumes:
 *   1. Table layouts — a 2-column table (dates | content) that mammoth flattens,
 *      destroying the pairing. We emit table rows so `Line.cells` preserves it,
 *      exactly like a PDF right-aligned date.
 *   2. Silent drops — mammoth ignores header/footer parts, which is where some
 *      templates put the name/email/phone. We read `word/header*.xml` and
 *      append them as candidate `basics` lines flagged `source: "docx-header"`.
 *
 * `w:pStyle` (Heading1/Heading2/Title) is the gold-standard section signal and
 * is carried on `Line.styleName`. Output is the SAME `Line[]` shape as PDF, so
 * everything downstream is format-agnostic.
 *
 * mammoth is kept as a FALLBACK only: if the XML walk throws or yields < 5
 * lines, we fall back to `mammoth.extractRawText` and record a warning.
 *
 * Pure-ish: input bytes, output lines. jszip is imported directly (no worker);
 * mammoth is injected or dynamically imported only on the fallback path.
 */

import JSZip from 'jszip';
import {
  parseXml,
  childrenNamed,
  firstDescendant,
  descendantsNamed,
  isElement,
} from './xml.js';

/**
 * @typedef {import('../layout/lines.js').Line} Line
 */

const FALLBACK_MIN_LINES = 5;
const DEFAULT_FONT = 11;

/**
 * Extract lines from a DOCX file.
 * @param {ArrayBuffer|Uint8Array} source
 * @param {{ mammoth?: any }} [opts]
 * @returns {Promise<{ lines: Line[], pageCount: number, warnings: string[] }>}
 */
export async function extractDocx(source, opts = {}) {
  const data = source instanceof Uint8Array ? source : new Uint8Array(source);
  /** @type {string[]} */
  const warnings = [];

  try {
    const zip = await JSZip.loadAsync(data);
    const docFile = zip.file('word/document.xml');
    if (!docFile) throw new Error('word/document.xml missing');
    const docXml = await docFile.async('string');
    const root = parseXml(docXml);
    const body = firstDescendant(root, 'w:body');
    if (!body) throw new Error('w:body missing');

    /** @type {RawLine[]} */
    const raw = [];

    // Header parts first (they render at the top of the page and usually carry
    // the name/contact block some templates hide there).
    for (const [name, kind] of await zonePartNames(zip)) {
      const xml = await zip.file(name).async('string');
      const partRoot = parseXml(xml);
      for (const p of descendantsNamed(partRoot, 'w:p')) {
        const info = readParagraph(p);
        if (info.text.trim()) raw.push({ ...info, source: `docx-${kind}`, cells: [] });
      }
    }

    // Body in document order: paragraphs and tables.
    for (const child of body.children) {
      if (!isElement(child)) continue;
      if (child.tag === 'w:p') {
        const info = readParagraph(child);
        if (info.text.trim()) raw.push({ ...info, source: '', cells: [] });
      } else if (child.tag === 'w:tbl') {
        for (const rl of readTable(child)) raw.push(rl);
      }
    }

    if (raw.length < FALLBACK_MIN_LINES) {
      throw new Error(`only ${raw.length} lines from XML walk`);
    }

    return { lines: finalize(raw), pageCount: 1, warnings };
  } catch (err) {
    warnings.push(
      `docx: fell back to raw text extraction (${err instanceof Error ? err.message : String(err)})`,
    );
    const lines = await mammothFallback(data, opts.mammoth);
    return { lines, pageCount: 1, warnings };
  }
}

/**
 * @typedef {Object} RawLine
 * @property {string} text
 * @property {string[]} cells
 * @property {boolean} bold
 * @property {boolean} isBullet
 * @property {number} fontSize
 * @property {string} styleName
 * @property {string} source
 */

/**
 * Turn RawLine[] into the shared Line[] shape, synthesizing geometry (DOCX has
 * none): monotonic y for stable order, x=0, bodyRatio vs. median font size.
 * @param {RawLine[]} raw
 * @returns {Line[]}
 */
function finalize(raw) {
  const sizes = raw.map((r) => r.fontSize).filter((s) => s > 0);
  const median = medianOf(sizes) || DEFAULT_FONT;

  let y = 0;
  return raw.map((r) => {
    const fontSize = r.fontSize > 0 ? r.fontSize : median;
    const lineHeight = fontSize * 1.2;
    const isHeading = /heading|title/i.test(r.styleName);
    y += lineHeight * (isHeading ? 1.8 : 1);
    const letters = r.text.replace(/[^a-z]/gi, '');
    const allCaps = letters.length >= 2 && r.text === r.text.toUpperCase() && /[A-Z]/.test(r.text);
    return {
      text: r.text,
      cells: r.cells,
      x: 0,
      xEnd: Math.max(1, r.text.length * fontSize * 0.5),
      y,
      fontSize,
      bodyRatio: fontSize / median,
      bold: r.bold,
      allCaps,
      isBullet: r.isBullet,
      spaceAbove: isHeading ? 1.8 : 1.2,
      page: 1,
      column: 0,
      styleName: r.styleName,
      source: r.source,
    };
  });
}

/**
 * Read one `w:p` into a RawLine (minus source/cells).
 * @param {import('./xml.js').XmlElement} p
 * @returns {{ text:string, bold:boolean, isBullet:boolean, fontSize:number, styleName:string }}
 */
function readParagraph(p) {
  const pPr = childrenNamed(p, 'w:pPr')[0] || null;
  const styleName = pPr ? attr(firstDescendant(pPr, 'w:pStyle'), 'w:val') : '';
  const isBullet = pPr ? !!firstDescendant(pPr, 'w:numPr') : false;

  const runs = descendantsNamed(p, 'w:r');
  let boldRuns = 0;
  let textRuns = 0;
  let maxSize = 0;
  for (const r of runs) {
    const rPr = childrenNamed(r, 'w:rPr')[0] || null;
    const hasText = descendantsNamed(r, 'w:t').length > 0;
    if (!hasText) continue;
    textRuns += 1;
    if (rPr && isOn(firstDescendant(rPr, 'w:b'))) boldRuns += 1;
    const sz = rPr ? Number(attr(firstDescendant(rPr, 'w:sz'), 'w:val')) : 0;
    if (sz) maxSize = Math.max(maxSize, sz / 2); // halfpoints -> points
  }

  return {
    text: gatherText(p).replace(/\s+/g, ' ').trim(),
    bold: textRuns > 0 && boldRuns * 2 >= textRuns,
    isBullet,
    fontSize: maxSize,
    styleName,
  };
}

/**
 * Read a `w:tbl` into RawLines. Each row emits its cell paragraphs as lines in
 * reading order (left cell first), preserving bullets; the row's FIRST line
 * carries `cells` = each cell's full text so the dates|content pairing survives.
 * @param {import('./xml.js').XmlElement} tbl
 * @returns {RawLine[]}
 */
function readTable(tbl) {
  /** @type {RawLine[]} */
  const out = [];
  for (const tr of childrenNamed(tbl, 'w:tr')) {
    const cells = childrenNamed(tr, 'w:tc');
    const cellTexts = cells.map((tc) =>
      childrenNamed(tc, 'w:p')
        .map((p) => gatherText(p).replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join(' '),
    );

    let firstOfRow = true;
    for (const tc of cells) {
      for (const p of childrenNamed(tc, 'w:p')) {
        const info = readParagraph(p);
        if (!info.text.trim()) continue;
        out.push({
          ...info,
          source: 'docx-table',
          // The pairing lives on the first line of the row; other lines keep
          // their own single cell so nothing is duplicated confusingly.
          cells: firstOfRow ? cellTexts.filter(Boolean) : [],
        });
        firstOfRow = false;
      }
    }
  }
  return out;
}

/**
 * Concatenate all text in an element in document order, turning tabs and breaks
 * into spaces.
 * @param {import('./xml.js').XmlElement} node
 * @returns {string}
 */
function gatherText(node) {
  let out = '';
  for (const c of node.children) {
    if (!isElement(c)) {
      continue; // raw text nodes only appear inside w:t, handled below
    }
    if (c.tag === 'w:t') {
      out += textContent(c);
    } else if (c.tag === 'w:tab' || c.tag === 'w:br' || c.tag === 'w:cr') {
      out += ' ';
    } else {
      out += gatherText(c);
    }
  }
  return out;
}

/**
 * @param {import('./xml.js').XmlElement} node
 * @returns {string}
 */
function textContent(node) {
  let out = '';
  for (const c of node.children) {
    if (isElement(c)) out += textContent(c);
    else out += c.text;
  }
  return out;
}

/**
 * Header/footer part names present in the zip, tagged 'header' | 'footer'.
 * @param {JSZip} zip
 * @returns {Promise<[string, 'header'|'footer'][]>}
 */
async function zonePartNames(zip) {
  /** @type {[string,'header'|'footer'][]} */
  const parts = [];
  zip.forEach((path) => {
    if (/^word\/header\d*\.xml$/i.test(path)) parts.push([path, 'header']);
    else if (/^word\/footer\d*\.xml$/i.test(path)) parts.push([path, 'footer']);
  });
  // Deterministic: header1 before header2, headers before footers.
  parts.sort((a, b) => (a[1] === b[1] ? a[0].localeCompare(b[0]) : a[1] === 'header' ? -1 : 1));
  return parts;
}

/**
 * mammoth fallback — raw text, one Line per non-empty line.
 * @param {Uint8Array} data
 * @param {any} [injected]
 * @returns {Promise<Line[]>}
 */
async function mammothFallback(data, injected) {
  const mammoth = injected || (await import('mammoth')).default || (await import('mammoth'));
  const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const raw = String(result.value || '')
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text) => ({
      text,
      bold: false,
      isBullet: false,
      fontSize: 0,
      styleName: '',
      source: 'docx-mammoth',
      cells: [],
    }));
  return finalize(raw);
}

/* ------------------------------------------------------------------ helpers */

function attr(el, name) {
  return el && el.attrs ? el.attrs[name] || '' : '';
}

/**
 * A boolean OOXML toggle element (`w:b`, …) is "on" when present unless it
 * explicitly carries val="0"/"false".
 * @param {import('./xml.js').XmlElement|null} el
 * @returns {boolean}
 */
function isOn(el) {
  if (!el) return false;
  const v = el.attrs['w:val'];
  if (v === undefined) return true;
  return v !== '0' && v.toLowerCase() !== 'false' && v.toLowerCase() !== 'off';
}

function medianOf(nums) {
  if (!nums.length) return 0;
  const s = nums.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
