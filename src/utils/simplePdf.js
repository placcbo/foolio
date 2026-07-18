import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';

// ---------------------------------------------------------------------------
// Dedicated PDF exporter for the Simple template.
//
// This is the per-template export model: SimpleTemplate.jsx owns the
// on-screen look, and this file draws the *same fixed design* directly into
// a PDF with jsPDF's text API. Nothing is screenshotted (the html2canvas
// spacing corruption cannot happen — there's no rasterization step) and no
// print dialog is involved (the blank-print-preview problem cannot happen
// either). Helvetica is one of the PDF format's built-in core fonts, so
// there's no webfont to load, embed, or mismeasure — the exact failure
// chain from before is structurally gone, and the download is instant with
// real selectable text.
// ---------------------------------------------------------------------------

const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&#39;': "'",
  '&rsquo;': '\u2019',
  '&lsquo;': '\u2018',
  '&ndash;': '\u2013',
  '&mdash;': '\u2014',
};

function decodeEntities(s) {
  return s.replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

function stripTags(s) {
  return decodeEntities(String(s || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function htmlListItems(html) {
  const items = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = re.exec(html || ''))) {
    const t = stripTags(m[1]);
    if (t) items.push(t);
  }
  return items;
}

function htmlParagraphs(html) {
  return String(html || '')
    .split(/<\/p>|<br\s*\/?>/i)
    .map(stripTags)
    .filter(Boolean);
}

function hexToRgb(hex) {
  const h = String(hex || '#e4570f').replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(f.slice(0, 2), 16) || 0, parseInt(f.slice(2, 4), 16) || 0, parseInt(f.slice(4, 6), 16) || 0];
}

function contactLine(basics) {
  const parts = [];
  if (basics.email) parts.push(basics.email);
  if (basics.phone) parts.push(basics.phone);
  if (basics.address) parts.push(basics.address);
  (basics.visibleExtra || []).forEach((key) => {
    if (basics[key]) parts.push(basics[key]);
  });
  return parts.join('  |  ');
}

export function exportSimpleTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 50; // page margin
  const CW = W - M * 2; // content width
  const BOTTOM = H - 50;

  const accent = hexToRgb(resume?.accentColor);
  const ink = [17, 17, 17];
  const body = [38, 38, 38];
  const gray = [74, 74, 74];
  const dim = [107, 107, 107];
  const rule = [214, 214, 214];

  // Convention: `y` is always the baseline the next piece of text draws at.
  let y = 72;

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      y = 60;
    }
  }

  function setF(size, style = 'normal', color = ink) {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
  }

  // Draws wrapped text and advances y; returns nothing. lh is a line-height
  // multiple of the font size.
  function para(text, size, style, color, { x = M, width = CW, lh = 1.4 } = {}) {
    setF(size, style, color);
    const lines = pdf.splitTextToSize(text, width);
    const step = size * lh;
    lines.forEach((line) => {
      ensure(step);
      setF(size, style, color);
      pdf.text(line, x, y);
      y += step;
    });
  }

  const b = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;

  // ----- header -----
  setF(24, 'bold', ink);
  pdf.text(b.name || 'Your name', M, y);
  y += 21;

  if (b.title) {
    setF(13, 'normal', accent);
    pdf.text(b.title, M, y);
    y += 18;
  }

  const contact = contactLine(b);
  if (contact) {
    para(contact, 10, 'normal', gray, { lh: 1.3 });
    y += 2;
  }

  // thick accent rule under the header
  pdf.setDrawColor(accent[0], accent[1], accent[2]);
  pdf.setLineWidth(2.5);
  pdf.line(M, y, W - M, y);
  y += 26;

  // ----- sections -----
  sections.forEach((section, idx) => {
    // thin divider between sections (not before the first — the accent rule
    // already separates the header from the first section)
    if (idx > 0) {
      ensure(30);
      pdf.setDrawColor(rule[0], rule[1], rule[2]);
      pdf.setLineWidth(0.75);
      pdf.line(M, y - 8, W - M, y - 8);
      y += 12;
    }

    ensure(20);
    setF(11, 'bold', accent);
    pdf.text((section.title || '').toUpperCase(), M, y);
    y += 16;

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        para(p, 10, 'normal', body, { lh: 1.45 });
        y += 3;
      });
      y += 8;
      return;
    }

    if (section.kind === 'tags') {
      const joined = (section.tags || []).join(', ');
      if (joined) para(joined, 10, 'normal', body, { lh: 1.45 });
      y += 11;
      return;
    }

    // entries
    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' \u2013 ');

        ensure(28);

        // date width first, so the heading wraps around it
        let dateWidth = 0;
        if (dateRange) {
          setF(9.5, 'normal', dim);
          dateWidth = pdf.getTextWidth(dateRange);
        }

        setF(10.5, 'bold', ink);
        const headingLines = pdf.splitTextToSize(entry.heading || '', CW - (dateWidth ? dateWidth + 14 : 0));
        pdf.text(headingLines[0] || '', M, y);
        if (dateRange) {
          setF(9.5, 'normal', dim);
          pdf.text(dateRange, W - M, y, { align: 'right' });
        }
        y += 13.5;
        // rare: a very long role title wraps — print the remainder full-width
        headingLines.slice(1).forEach((line) => {
          ensure(13.5);
          setF(10.5, 'bold', ink);
          pdf.text(line, M, y);
          y += 13.5;
        });

        const sub = [entry.subheading, entry.location].filter(Boolean).join(' \u2013 ');
        if (sub) {
          para(sub, 10, 'normal', gray, { lh: 1.35 });
        }
        y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, CW - 14);
          lines.forEach((line, i) => {
            ensure(13.5);
            setF(10, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('\u2022', M, y);
            pdf.text(line, M + (bullets.length ? 14 : 0), y);
            y += 13.5;
          });
          y += 1.5;
        });

        y += 8;
      });

    y += 4;
  });

  pdf.save(`${filename}.pdf`);
}
