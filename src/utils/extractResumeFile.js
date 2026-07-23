// ---------------------------------------------------------------------------
// Turn an uploaded resume FILE (PDF or DOCX) into plain text, entirely in the
// browser — nothing is uploaded anywhere. The text then flows into the same
// paste-import parser (resumeParser.js), so a file and a paste are handled
// identically from that point on.
//
// pdf.js and mammoth are ~1.5MB combined, so both are dynamically imported —
// they only download the first time someone actually picks a file, and never
// weigh on the initial app load.
//
// Deliberately NOT doing here:
//  - OCR. A scanned/photographed PDF has no text layer at all; we detect that
//    and tell the user to paste or upload a DOCX instead, rather than pulling
//    in a multi-megabyte OCR engine for v1.
//  - Column reconstruction. PDFs store positioned glyphs, not reading order.
//    A two-column resume extracts with its sidebar interleaved into the body;
//    the import modal's editable preview is the safety net for that.
// ---------------------------------------------------------------------------

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Both extractors can emit runs of blank lines (mammoth writes one paragraph
// break per paragraph, so empty paragraphs stack up). The parser reads blank
// lines as section boundaries, so collapse any run of 3+ newlines to a single
// blank line and trim trailing spaces — cleaner text in the preview and fewer
// spurious splits.
function normalize(text) {
  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// If a PDF yields less than this many characters across all pages, it almost
// certainly has no real text layer (a scan or exported image) — extraction
// "succeeded" but there's nothing usable, so treat it as scanned.
const SCANNED_TEXT_THRESHOLD = 24;

// Reconstruct lines from pdf.js text items. Items carry an x/y position and a
// string; there is no notion of a line, so we group by vertical position and
// order left-to-right within each row. Good enough for single-column resumes;
// multi-column ones interleave, which the preview lets the user correct.
function pageItemsToText(items) {
  const glyphs = items.filter((it) => typeof it.str === 'string' && it.str.length > 0);
  if (!glyphs.length) return '';

  const lines = [];
  for (const it of glyphs) {
    const x = it.transform[4];
    const y = it.transform[5];
    const h = it.height || 10;
    // Group into an existing row if the baseline is within ~40% of the glyph
    // height — tolerant enough for sub/superscript jitter, tight enough not
    // to merge separate lines.
    let line = lines.find((l) => Math.abs(l.y - y) <= Math.max(2, h * 0.4));
    if (!line) {
      line = { y, items: [] };
      lines.push(line);
    }
    line.items.push({ x, w: it.width || 0, str: it.str });
  }

  // PDF y-origin is the bottom of the page, so higher y = higher up = earlier.
  lines.sort((a, b) => b.y - a.y);

  return lines
    .map((line) => {
      line.items.sort((a, b) => a.x - b.x);
      let s = '';
      let prevEnd = null;
      for (const g of line.items) {
        if (prevEnd !== null && g.x - prevEnd > 1 && !s.endsWith(' ') && !g.str.startsWith(' ')) {
          s += ' ';
        }
        s += g.str;
        prevEnd = g.x + g.w;
      }
      return s.replace(/\s+$/, '');
    })
    .filter((l) => l.length > 0)
    .join('\n');
}

async function extractPdf(file) {
  const pdfjs = await import('pdfjs-dist');
  // Vite resolves this to a hashed URL for the worker bundle.
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(pageItemsToText(content.items));
  }
  const text = normalize(pages.join('\n\n'));

  if (text.replace(/\s/g, '').length < SCANNED_TEXT_THRESHOLD) {
    return { scanned: true };
  }
  return { text };
}

async function extractDocx(file) {
  const mammoth = (await import('mammoth')).default || (await import('mammoth'));
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = normalize(result.value || '');
  if (!text) return { error: 'empty' };
  return { text };
}

// Returns one of:
//   { text }          — extracted plain text, ready for the parser
//   { scanned: true } — a PDF with no selectable text layer (needs paste/DOCX)
//   { error: 'unsupported' | 'empty' | 'failed' }
export async function extractTextFromFile(file) {
  const name = (file.name || '').toLowerCase();
  const isPdf = file.type === PDF_MIME || name.endsWith('.pdf');
  const isDocx = file.type === DOCX_MIME || name.endsWith('.docx');

  if (!isPdf && !isDocx) return { error: 'unsupported' };

  try {
    return isPdf ? await extractPdf(file) : await extractDocx(file);
  } catch (e) {
    console.warn('Resume file extraction failed.', e);
    return { error: 'failed' };
  }
}
