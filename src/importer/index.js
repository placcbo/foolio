/**
 * Public entry point for the resume importer.
 *
 * The importer is one pure function chain: input a `File`, output
 * `{ resume, meta, rawText, rawLines }`. It must NEVER throw into the UI — on
 * any failure it returns an empty resume with `_meta.warnings` explaining what
 * broke, so the user can still copy-paste from `rawText`.
 *
 * PHASE 1: PDF extraction + layout reconstruction are wired in. Parsing
 * (normalizedText -> Resume) does not exist yet, so the resume stays empty and
 * only `rawText` / `rawLines` / `_meta` are populated. DOCX is Phase 2.
 */

import { createEmptyResume } from './schema/resume.js';
import { extractItems } from './extract/pdf.js';
import { assembleLines } from './layout/lines.js';
import { assignColumns } from './layout/columns.js';
import { removeArtifacts } from './layout/artifacts.js';
import { extractDocx } from './extract/docx.js';
import { normalizeLines } from './normalize/index.js';
import { detectSections } from './detect/sections.js';
import { assembleResume } from './parse/assemble.js';

/**
 * @typedef {import('./layout/lines.js').Line} Line
 */

/**
 * @typedef {Object} ImportResult
 * @property {import('./schema/resume.js').Resume} resume
 * @property {import('./schema/resume.js').ResumeMeta} meta
 * @property {string} rawText
 * @property {Line[]} rawLines
 */

/**
 * A minimal structural type for what the importer needs from its input, so the
 * Node test harness can pass a shim without a real browser `File`.
 * @typedef {Object} FileLike
 * @property {string} name
 * @property {() => Promise<ArrayBuffer>} arrayBuffer
 */

/**
 * Import a resume file into the canonical `Resume` shape.
 * @param {File | FileLike} file
 * @param {{ pdfjs?: any }} [opts]  inject a pdf.js module (the Node test harness
 *   passes the legacy build; the browser omits this and the worker build loads)
 * @returns {Promise<ImportResult>}
 */
export async function importResume(file, opts = {}) {
  const resume = createEmptyResume();

  try {
    const format = detectFormat(file);
    resume._meta.sourceFormat = format;

    /** @type {Line[]} */
    let extracted;
    if (format === 'pdf') {
      const pdfjs = opts.pdfjs || (await loadPdfjs());
      const buffer = await file.arrayBuffer();
      const { lines, pageCount, multiColumn, warnings } = await runPdfPipeline(buffer, pdfjs);
      resume._meta.pageCount = pageCount;
      resume._meta.multiColumn = multiColumn;
      for (const w of warnings) resume._meta.warnings.push(w);
      extracted = lines;
    } else {
      const buffer = await file.arrayBuffer();
      const { lines, pageCount, warnings } = await extractDocx(buffer, { mammoth: opts.mammoth });
      resume._meta.pageCount = pageCount;
      resume._meta.multiColumn = false;
      for (const w of warnings) resume._meta.warnings.push(w);
      extracted = lines;
    }

    // Normalize (unicode/whitespace/dashes, bullets, wrapped-line merge), detect
    // sections, then assemble the canonical Resume. `rawLines` are the normalized
    // parse copies; `rawText` keeps the original display text for the drawer.
    const rawLines = normalizeLines(extracted);
    const rawText = rawLines.map((l) => l.displayText ?? l.text).join('\n');

    const detected = detectSections(rawLines);
    const { resume: parsed } = assembleResume(detected);

    // Carry the extraction-level meta over the assembled resume's meta.
    parsed._meta.sourceFormat = resume._meta.sourceFormat;
    parsed._meta.pageCount = resume._meta.pageCount;
    parsed._meta.multiColumn = resume._meta.multiColumn;
    parsed._meta.warnings = resume._meta.warnings.concat(parsed._meta.warnings);

    return { resume: parsed, meta: parsed._meta, rawText, rawLines };
  } catch (err) {
    resume._meta.warnings.push(
      `import failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return { resume, meta: resume._meta, rawText: '', rawLines: [] };
  }
}

/**
 * Run the pure PDF layout pipeline: extract items -> lines -> reading order ->
 * artifact removal. Exposed (with an injectable pdfjs) so the debug view and
 * Node tests can reuse the exact same chain the importer uses.
 * @param {ArrayBuffer|Uint8Array} buffer
 * @param {any} pdfjs
 * @returns {Promise<{
 *   items: import('./extract/pdf.js').PositionedItem[],
 *   pages: import('./extract/pdf.js').PageMeta[],
 *   lines: Line[],
 *   gutters: import('./layout/columns.js').Gutter[],
 *   rawText: string,
 *   pageCount: number,
 *   multiColumn: boolean,
 *   warnings: string[],
 * }>}
 */
export async function runPdfPipeline(buffer, pdfjs) {
  const { items, pages, pageCount } = await extractItems(buffer, pdfjs);
  const { multiColumn, gutters } = assignColumns(items, pages);
  const assembled = assembleLines(items, pages);
  const { lines, dropped } = removeArtifacts(assembled, pages, pageCount);
  const rawText = lines.map((l) => l.text).join('\n');
  return { items, pages, lines, gutters, rawText, pageCount, multiColumn, warnings: dropped };
}

/**
 * Browser-side analysis entry for the `/import-debug` view: runs the real PDF
 * pipeline and returns everything needed to inspect extraction — items, lines,
 * gutters, page sizes. Not used by the app proper.
 * @param {File | FileLike} file
 * @returns {Promise<{
 *   lines: Line[],
 *   gutters: import('./layout/columns.js').Gutter[],
 *   pages: import('./extract/pdf.js').PageMeta[],
 *   items: import('./extract/pdf.js').PositionedItem[],
 *   rawText: string,
 *   pageCount: number,
 *   multiColumn: boolean,
 * }>}
 */
export async function analyzePdf(file) {
  const pdfjs = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  return runPdfPipeline(buffer, pdfjs);
}

/**
 * Load pdf.js with the Vite-resolved worker (browser). Dynamically imported so
 * the ~1.5MB library never lands in the main bundle. In Node, callers use
 * `runPdfPipeline` with the legacy build directly instead of `importResume`.
 * @returns {Promise<any>}
 */
async function loadPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

/**
 * Detect source format by extension, then magic bytes when a buffer is handy.
 * @param {File | FileLike} file
 * @returns {"pdf"|"docx"}
 */
function detectFormat(file) {
  const name = (file?.name || '').toLowerCase();
  if (name.endsWith('.docx')) return 'docx';
  return 'pdf';
}
