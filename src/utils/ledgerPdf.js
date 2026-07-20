import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for LedgerTemplate: the double frame is two real
// stroked rects repainted on every page, the header splits name (with an
// accent mark) against right-aligned title/contact, and flat skill tags
// lay out as a two-column dotted grid instead of a single wrapped line.

export function exportLedgerTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const OUTER = 20;
  const INNER = OUTER + 7;
  const M = INNER + 32; // content left/right edge
  const CW = W - M * 2;
  const TOP = INNER + 30;
  const BOTTOM = H - INNER - 28;

  const accent = hexToRgb(resume?.accentColor || '#1f3a5f');
  const ink = [20, 20, 26];
  const body = [38, 38, 38];
  const gray = [90, 90, 96];
  const dim = [122, 122, 128];
  const hair = [226, 226, 230];

  let y = TOP;

  function paintFrame() {
    pdf.setDrawColor(ink[0], ink[1], ink[2]);
    pdf.setLineWidth(1);
    pdf.rect(OUTER, OUTER, W - OUTER * 2, H - OUTER * 2, 'S');
    pdf.setDrawColor(accent[0], accent[1], accent[2]);
    pdf.setLineWidth(1);
    pdf.rect(INNER, INNER, W - INNER * 2, H - INNER * 2, 'S');
  }
  paintFrame();

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      paintFrame();
      y = TOP;
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

  // Two-column dotted grid, matching the on-screen CSS grid: a left and a
  // right item share one row, each row height driven by whichever of the
  // two wraps to more lines.
  function drawTagGrid(tags) {
    const colW = (CW - 20) / 2;
    const rowH = 14;
    for (let i = 0; i < tags.length; i += 2) {
      const left = tags[i];
      const right = tags[i + 1];
      setF(10, 'normal', body);
      const leftLines = pdf.splitTextToSize(left, colW - 12);
      const rightLines = right != null ? pdf.splitTextToSize(right, colW - 12) : [];
      const rows = Math.max(leftLines.length, rightLines.length, 1);
      ensure(rows * rowH);

      pdf.setFillColor(accent[0], accent[1], accent[2]);
      pdf.circle(M + 2, y - 3, 2, 'F');
      setF(10, 'normal', body);
      leftLines.forEach((line, li) => pdf.text(line, M + 10, y + li * rowH));

      if (right != null) {
        const rx = M + colW + 20;
        pdf.setFillColor(accent[0], accent[1], accent[2]);
        pdf.circle(rx + 2, y - 3, 2, 'F');
        setF(10, 'normal', body);
        rightLines.forEach((line, li) => pdf.text(line, rx + 10, y + li * rowH));
      }

      y += rows * rowH;
    }
    y += 6;
  }

  const b = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden && sectionHasContent(s));
  const dateFormat = resume?.settings?.dateFormat;

  // ----- header: name+mark on the left, title/contact right-aligned -----
  const startY = y;
  const MARK_W = 4;
  const MARK_GAP = 11;

  setF(22, 'bold', ink);
  const nameX = M + MARK_W + MARK_GAP;
  const rightColW = 230;
  const nameLines = pdf.splitTextToSize(b.name || 'Your name', CW - MARK_W - MARK_GAP - rightColW);
  const NAME_STEP = 24;
  nameLines.forEach((line, i) => {
    setF(22, 'bold', ink);
    pdf.text(line, nameX, startY + i * NAME_STEP);
  });
  const nameBottomY = startY + (nameLines.length - 1) * NAME_STEP + 6;
  pdf.setFillColor(accent[0], accent[1], accent[2]);
  pdf.rect(M, startY - 16, MARK_W, nameBottomY - (startY - 16) - 4, 'F');

  let ry = startY;
  if (b.title) {
    setF(9.5, 'bold', accent);
    pdf.setCharSpace(0.7);
    pdf.text((b.title || '').toUpperCase(), W - M, ry, { align: 'right' });
    pdf.setCharSpace(0);
    ry += 14;
  }
  const contact = contactLine(b).replace(/ {2}\| {2}/g, '   |   ');
  if (contact) {
    setF(8.5, 'normal', gray);
    const lines = pdf.splitTextToSize(contact, rightColW);
    lines.forEach((line) => {
      pdf.text(line, W - M, ry, { align: 'right' });
      ry += 12;
    });
  }

  y = Math.max(nameBottomY, ry) + 12;
  pdf.setDrawColor(ink[0], ink[1], ink[2]);
  pdf.setLineWidth(0.9);
  pdf.line(M, y, W - M, y);
  y += 22;

  // ----- sections -----
  sections.forEach((section) => {
    ensure(26);
    pdf.setFillColor(accent[0], accent[1], accent[2]);
    pdf.rect(M, y - 8, 11, 3, 'F');
    setF(9.5, 'bold', ink);
    pdf.setCharSpace(1.1);
    pdf.text((section.title || '').toUpperCase(), M + 17, y);
    pdf.setCharSpace(0);
    y += 8;
    pdf.setDrawColor(hair[0], hair[1], hair[2]);
    pdf.setLineWidth(0.75);
    pdf.line(M, y, W - M, y);
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
        drawTagGrid(groups.flatMap((g) => g.tags));
      } else {
        const LABEL_W = 150;
        groups.forEach((g) => {
          const label = g.label && g.label.trim() ? g.label.trim().toUpperCase() : '';
          const values = (g.tags || []).join(', ');
          setF(9, 'bold', ink);
          const labelLines = label ? pdf.splitTextToSize(label, LABEL_W - 10) : [];
          setF(10, 'normal', body);
          const valueLines = pdf.splitTextToSize(values, CW - LABEL_W);
          const rows = Math.max(labelLines.length, valueLines.length, 1);
          ensure(rows * 13.5 + 3);
          const rowStartY = y;
          setF(9, 'bold', ink);
          labelLines.forEach((ln, i) => pdf.text(ln, M, rowStartY + i * 13.5));
          setF(10, 'normal', body);
          valueLines.forEach((ln, i) => pdf.text(ln, M + LABEL_W, rowStartY + i * 13.5));
          y = rowStartY + rows * 13.5 + 3;
        });
      }
      y += 9;
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
        y += 13.5;
        headingLines.slice(1).forEach((line) => {
          ensure(13.5);
          setF(11, 'bold', ink);
          pdf.text(line, M, y);
          y += 13.5;
        });

        const sub = [entry.subheading, entry.location].filter(Boolean).join(' – ');
        if (sub) para(sub, 10, 'italic', gray, { lh: 1.35 });
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
