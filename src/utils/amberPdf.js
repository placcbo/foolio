import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for AmberTemplate: the dark banner is a real
// full-bleed filled rect at the top of page one only (it doesn't repeat on
// later pages, same convention bloomPdf.js uses for its banner), and each
// section badge is a filled rounded square. The on-screen badge holds an
// emoji glyph, but PDF core fonts can't render emoji (the same category of
// problem as codexPdf.js's arrow glyph) — so the badge falls back to the
// section title's first letter, which keeps the badge-with-content look
// without risking a broken glyph.

function lighten([r, g, bl], amount) {
  return [
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(bl + (255 - bl) * amount),
  ];
}

export function exportAmberTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 52;
  const CW = W - M * 2;
  const BOTTOM = H - 50;

  const accent = hexToRgb(resume?.accentColor || '#eab308');
  const chipBg = lighten(accent, 0.82);
  const ink = [36, 36, 38];
  const body = [38, 38, 38];
  const gray = [85, 85, 91];
  const dim = [107, 107, 107];
  const onDark = [216, 216, 218];

  function setF(size, style, color) {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
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

  // ----- banner (page one only) -----
  // Measure first (font metrics only, nothing drawn yet) so the banner rect
  // can be painted before any text lands on top of it.
  const contact = contactLine(b).replace(/ {2}\| {2}/g, '     ');
  setF(9.5, 'normal', onDark);
  const contactLines = contact ? pdf.splitTextToSize(contact, CW) : [];

  const TOP_PAD = 46;
  const BOTTOM_PAD = 26;
  let headerH = TOP_PAD + 20; // top padding + name line
  if (b.title) headerH += 17;
  headerH += contactLines.length * 14 + BOTTOM_PAD;

  pdf.setFillColor(ink[0], ink[1], ink[2]);
  pdf.rect(0, 0, W, headerH, 'F');

  let ty = TOP_PAD;
  setF(23, 'bold', accent);
  pdf.text(b.name || 'Your name', M, ty);
  ty += 20;
  if (b.title) {
    setF(11, 'normal', onDark);
    pdf.text(b.title, M, ty);
    ty += 17;
  }
  contactLines.forEach((line) => {
    setF(9.5, 'normal', onDark);
    pdf.text(line, M, ty);
    ty += 14;
  });

  let y = headerH + 30;

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      y = 56;
    }
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

  function drawChips(tags) {
    const chipH = 18;
    const padX = 10;
    const gap = 7;
    let x = M;
    setF(9, 'bold', body);
    tags.forEach((tag) => {
      const tw = pdf.getTextWidth(tag);
      const cw = tw + padX * 2;
      if (x + cw > M + CW) {
        x = M;
        y += chipH + gap;
      }
      ensure(chipH + 4);
      pdf.setFillColor(chipBg[0], chipBg[1], chipBg[2]);
      pdf.roundedRect(x, y - 13, cw, chipH, 9, 9, 'F');
      setF(9, 'bold', body);
      pdf.text(tag, x + padX, y);
      x += cw + gap;
    });
    y += chipH + 4;
  }

  sections.forEach((section) => {
    ensure(32);

    const badgeSize = 22;
    pdf.setFillColor(ink[0], ink[1], ink[2]);
    pdf.roundedRect(M, y - 15, badgeSize, badgeSize, 5, 5, 'F');
    setF(10.5, 'bold', [255, 255, 255]);
    pdf.text((section.title || '?').charAt(0).toUpperCase(), M + badgeSize / 2, y - 15 + badgeSize / 2 + 4, { align: 'center' });

    const textX = M + badgeSize + 12;
    setF(10.5, 'bold', ink);
    pdf.setCharSpace(0.4);
    pdf.text((section.title || '').toUpperCase(), textX, y - 7);
    pdf.setCharSpace(0);
    pdf.setFillColor(accent[0], accent[1], accent[2]);
    pdf.rect(textX, y + 1, 22, 2.4, 'F');
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
        drawChips(groups.flatMap((g) => g.tags));
        y += 6;
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
        y += 8;
      }
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
