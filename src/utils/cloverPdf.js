import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for CloverTemplate. Plain single column, drawn
// straight from resume data like simplePdf.js. The on-screen contact row
// uses real icon components; PDF core fonts have no icon glyphs to draw
// (the same category of limitation noted in amberPdf.js), so the contact
// row falls back to a two-column text grid — same layout, no icon.

export function exportCloverTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 54;
  const CW = W - M * 2;
  const BOTTOM = H - 50;

  const accent = hexToRgb(resume?.accentColor || '#15803d');
  const ink = [23, 23, 26];
  const body = [38, 38, 38];
  const gray = [85, 85, 91];
  const dim = [107, 107, 107];

  let y = 50;

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      y = 58;
    }
  }

  function setF(size, style, color) {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
  }

  function para(text, size, style, color, { lh = 1.5, x = M, width = CW } = {}) {
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

  function sectionHasContent(section) {
    if (section.kind === 'text') return htmlParagraphs(section.content).length > 0;
    if (section.kind === 'tags') {
      const groups = section.groups && section.groups.length ? section.groups : [{ tags: section.tags || [] }];
      return groups.some((g) => (g.tags || []).length > 0);
    }
    return (section.entries || []).some(
      (e) =>
        !e.hidden &&
        (e.heading || e.subheading || htmlListItems(e.description).length > 0 || htmlParagraphs(e.description).length > 0)
    );
  }

  const b = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden && sectionHasContent(s));
  const dateFormat = resume?.settings?.dateFormat;

  // ----- header -----
  setF(23, 'bold', accent);
  pdf.text(b.name || 'Your name', M, y);
  y += 20;

  if (b.title) {
    setF(11, 'normal', gray);
    pdf.text(b.title, M, y);
    y += 17;
  }

  const contactParts = contactLine(b).split('  |  ').filter(Boolean);
  if (contactParts.length) {
    const colW = CW / 2;
    setF(9.5, 'normal', [58, 58, 62]);
    contactParts.forEach((part, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      pdf.text(part, M + col * colW, y + row * 14);
    });
    y += Math.ceil(contactParts.length / 2) * 14 + 6;
  }
  y += 10;

  // ----- sections -----
  sections.forEach((section) => {
    ensure(26);
    setF(11.5, 'bold', accent);
    pdf.text(section.title || '', M, y);
    y += 7;
    pdf.setFillColor(accent[0], accent[1], accent[2]);
    pdf.rect(M, y - 1, 26, 2.6, 'F');
    y += 15;

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        para(p, 10.5, 'normal', body, { lh: 1.5 });
        y += 3;
      });
      y += 9;
      return;
    }

    if (section.kind === 'tags') {
      const groups = (section.groups && section.groups.length
        ? section.groups
        : [{ label: '', tags: section.tags || [] }]
      ).filter((g) => (g.tags || []).length);
      const hasLabels = groups.some((g) => g.label && g.label.trim());

      if (!hasLabels) {
        const joined = groups.flatMap((g) => g.tags).join(', ');
        if (joined) para(joined, 10, 'normal', body, { lh: 1.45 });
      } else {
        const LABEL_W = 150;
        groups.forEach((g) => {
          const label = g.label && g.label.trim() ? g.label.trim() + ':' : '';
          const values = (g.tags || []).join(', ');
          setF(10, 'bold', ink);
          const labelLines = label ? pdf.splitTextToSize(label, LABEL_W - 10) : [];
          setF(10, 'normal', body);
          const valueLines = pdf.splitTextToSize(values, CW - LABEL_W);
          const rows = Math.max(labelLines.length, valueLines.length, 1);
          ensure(rows * 13.5 + 3);
          const startY = y;
          setF(10, 'bold', ink);
          labelLines.forEach((ln, i) => pdf.text(ln, M, startY + i * 13.5));
          setF(10, 'normal', body);
          valueLines.forEach((ln, i) => pdf.text(ln, M + LABEL_W, startY + i * 13.5));
          y = startY + rows * 13.5 + 3;
        });
      }
      y += 10;
      return;
    }

    // entries
    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' – ');

        ensure(28);

        let dateWidth = 0;
        if (dateRange) {
          setF(9.5, 'normal', dim);
          dateWidth = pdf.getTextWidth(dateRange);
        }

        setF(11, 'bold', ink);
        const headingLines = pdf.splitTextToSize(entry.heading || '', CW - (dateWidth ? dateWidth + 14 : 0));
        if (entry.link) {
          const url = /^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`;
          pdf.textWithLink(headingLines[0] || '', M, y, { url });
        } else {
          pdf.text(headingLines[0] || '', M, y);
        }
        if (dateRange) {
          setF(9.5, 'normal', dim);
          pdf.text(dateRange, W - M, y, { align: 'right' });
        }
        y += 13.5;
        headingLines.slice(1).forEach((line) => {
          ensure(13.5);
          setF(11, 'bold', ink);
          pdf.text(line, M, y);
          y += 13.5;
        });

        const sub = [entry.subheading, entry.location].filter(Boolean).join(' – ');
        if (sub) para(sub, 10, 'normal', gray, { lh: 1.35 });
        y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, CW - 14);
          lines.forEach((line, i) => {
            ensure(13.5);
            setF(10, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('•', M, y);
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
