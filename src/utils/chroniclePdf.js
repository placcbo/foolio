import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for ChronicleTemplate: centered serif header (Times
// is a built-in PDF core font, same reasoning as classicPdf.js), each
// section heading sits on top of a real full-width rule instead of the
// short accent bar other templates use.

export function exportChronicleTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 56;
  const CW = W - M * 2;
  const BOTTOM = H - 54;

  const accent = hexToRgb(resume?.accentColor || '#1a1a1c');
  const ink = [26, 26, 28];
  const body = [42, 42, 46];
  const gray = [90, 90, 96];
  const dim = [122, 122, 128];

  let y = 76;

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      y = 62;
    }
  }

  function setF(size, style = 'normal', color = ink) {
    pdf.setFont('times', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
  }

  function para(text, size, style, color, { x = M, width = CW, lh = 1.5, align } = {}) {
    setF(size, style, color);
    const lines = pdf.splitTextToSize(text, width);
    const step = size * lh;
    lines.forEach((line) => {
      ensure(step);
      setF(size, style, color);
      if (align === 'center') pdf.text(line, W / 2, y, { align: 'center' });
      else pdf.text(line, x, y);
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

  // ----- centered header -----
  setF(25, 'bold', ink);
  pdf.text(b.name || 'Your name', W / 2, y, { align: 'center' });
  y += 19;

  if (b.title) {
    setF(11.5, 'italic', gray);
    pdf.text(b.title, W / 2, y, { align: 'center' });
    y += 16;
  }

  const contact = contactLine(b).replace(/ {2}\| {2}/g, '   |   ');
  if (contact) {
    para(contact, 9.5, 'normal', gray, { lh: 1.35, align: 'center' });
    y += 8;
  } else {
    y += 4;
  }

  // ----- sections -----
  sections.forEach((section) => {
    ensure(30);
    setF(11.5, 'bold', ink);
    pdf.setCharSpace(0.9);
    pdf.text((section.title || '').toUpperCase(), M, y);
    pdf.setCharSpace(0);
    y += 8;
    pdf.setDrawColor(accent[0], accent[1], accent[2]);
    pdf.setLineWidth(2);
    pdf.line(M, y, W - M, y);
    y += 18;

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        para(p, 10.5, 'normal', body, { lh: 1.5 });
        y += 3;
      });
      y += 10;
      return;
    }

    if (section.kind === 'tags') {
      const groups = (section.groups && section.groups.length
        ? section.groups
        : [{ label: '', tags: section.tags || [] }]
      ).filter((g) => (g.tags || []).length);
      const hasLabels = groups.some((g) => g.label && g.label.trim());

      if (!hasLabels) {
        const joined = groups.flatMap((g) => g.tags).join('  •  ');
        if (joined) para(joined, 10.5, 'normal', body, { lh: 1.5 });
      } else {
        const LABEL_W = 150;
        groups.forEach((g) => {
          const label = g.label && g.label.trim() ? g.label.trim() + ':' : '';
          const values = (g.tags || []).join(', ');
          setF(10.5, 'bold', ink);
          const labelLines = label ? pdf.splitTextToSize(label, LABEL_W - 10) : [];
          setF(10.5, 'normal', body);
          const valueLines = pdf.splitTextToSize(values, CW - LABEL_W);
          const rows = Math.max(labelLines.length, valueLines.length, 1);
          ensure(rows * 14 + 3);
          const startY = y;
          setF(10.5, 'bold', ink);
          labelLines.forEach((ln, i) => pdf.text(ln, M, startY + i * 14));
          setF(10.5, 'normal', body);
          valueLines.forEach((ln, i) => pdf.text(ln, M + LABEL_W, startY + i * 14));
          y = startY + rows * 14 + 3;
        });
      }
      y += 12;
      return;
    }

    // entries
    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' – ');

        ensure(30);

        let dateWidth = 0;
        if (dateRange) {
          setF(9.5, 'italic', dim);
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
          setF(9.5, 'italic', dim);
          pdf.text(dateRange, W - M, y, { align: 'right' });
        }
        y += 14;
        headingLines.slice(1).forEach((line) => {
          ensure(14);
          setF(11, 'bold', ink);
          pdf.text(line, M, y);
          y += 14;
        });

        const sub = [entry.subheading, entry.location].filter(Boolean).join(' – ');
        if (sub) {
          para(sub, 10, 'italic', gray, { lh: 1.4 });
        }
        y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, CW - 14);
          lines.forEach((line, i) => {
            ensure(14);
            setF(10.5, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('•', M, y);
            pdf.text(line, M + (bullets.length ? 14 : 0), y);
            y += 14;
          });
          y += 1.5;
        });

        y += 9;
      });

    y += 4;
  });

  pdf.save(`${filename}.pdf`);
}
