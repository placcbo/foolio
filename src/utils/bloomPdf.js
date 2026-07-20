import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for BloomTemplate. The banner is a real rounded
// rectangle in the accent color; skill chips are individually measured and
// drawn as rounded pills filled with a tint mixed from the accent.

function lighten([r, g, bl], amount) {
  return [
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(bl + (255 - bl) * amount),
  ];
}

export function exportBloomTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 46;
  const CW = W - M * 2;
  const BOTTOM = H - 50;

  const accent = hexToRgb(resume?.accentColor || '#c85a54');
  const chipBg = lighten(accent, 0.86);
  const ink = [26, 26, 28];
  const body = [42, 44, 48];
  const dim = [116, 118, 124];

  let y = 46;

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      y = 56;
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

  function drawChips(tags) {
    const chipH = 17;
    const padX = 9;
    const gap = 6;
    let x = M;
    setF(8.5, 'bold', accent);
    tags.forEach((tag) => {
      const tw = pdf.getTextWidth(tag);
      const cw = tw + padX * 2;
      if (x + cw > M + CW) {
        x = M;
        y += chipH + gap;
      }
      ensure(chipH + 4);
      pdf.setFillColor(chipBg[0], chipBg[1], chipBg[2]);
      pdf.roundedRect(x, y - 12, cw, chipH, 8, 8, 'F');
      setF(8.5, 'bold', accent);
      pdf.text(tag, x + padX, y);
      x += cw + gap;
    });
    y += chipH + 4;
  }

  const b = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden && sectionHasContent(s));
  const dateFormat = resume?.settings?.dateFormat;

  // ----- banner -----
  const contact = contactLine(b).replace(/ {2}\| {2}/g, '  \u2022  ');
  setF(9, 'normal', [255, 255, 255]);
  const contactLines = contact ? pdf.splitTextToSize(contact, CW - 56) : [];
  const heroH = 30 + 24 + (b.title ? 18 : 0) + contactLines.length * 13 + 22;

  pdf.setFillColor(accent[0], accent[1], accent[2]);
  pdf.roundedRect(M - 8, y - 10, CW + 16, heroH, 12, 12, 'F');

  let hy = y + 24;
  setF(23, 'bold', [255, 255, 255]);
  pdf.text(b.name || 'Your name', M + 20, hy);
  hy += 20;
  if (b.title) {
    setF(11, 'normal', lighten(accent, 0.75));
    pdf.text(b.title, M + 20, hy);
    hy += 18;
  }
  setF(9, 'normal', lighten(accent, 0.82));
  contactLines.forEach((line) => {
    pdf.text(line, M + 20, hy);
    hy += 13;
  });
  y = y - 10 + heroH + 26;

  // ----- sections -----
  sections.forEach((section) => {
    ensure(30);
    setF(11.5, 'bold', accent);
    pdf.text(section.title || '', M, y);
    y += 6;
    pdf.setFillColor(accent[0], accent[1], accent[2]);
    pdf.rect(M, y - 1, 30, 2.6, 'F');
    y += 14;

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        para(p, 10, 'normal', body, { lh: 1.5 });
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

      groups.forEach((g) => {
        if (hasLabels && g.label && g.label.trim()) {
          ensure(16);
          setF(9.5, 'bold', ink);
          pdf.text(g.label.trim(), M, y);
          y += 15;
        }
        drawChips(g.tags);
        y += 6;
      });
      y += 8;
      return;
    }

    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' \u2013 ');

        ensure(28);
        let dateWidth = 0;
        if (dateRange) {
          setF(9, 'normal', dim);
          dateWidth = pdf.getTextWidth(dateRange);
        }
        setF(10.5, 'bold', ink);
        const headingLines = pdf.splitTextToSize(entry.heading || '', CW - (dateWidth ? dateWidth + 12 : 0));
        if (entry.link) {
          const url = /^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`;
          pdf.textWithLink(headingLines[0] || '', M, y, { url });
        } else {
          pdf.text(headingLines[0] || '', M, y);
        }
        if (dateRange) {
          setF(9, 'normal', dim);
          pdf.text(dateRange, W - M, y, { align: 'right' });
        }
        y += 13;
        headingLines.slice(1).forEach((line) => {
          ensure(13);
          setF(10.5, 'bold', ink);
          pdf.text(line, M, y);
          y += 13;
        });

        const sub = [entry.subheading, entry.location].filter(Boolean).join(' \u2013 ');
        if (sub) para(sub, 9.5, 'normal', dim, { lh: 1.4 });
        y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, CW - 13);
          lines.forEach((line, i) => {
            ensure(13);
            setF(9.5, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('\u2022', M, y);
            pdf.text(line, M + (bullets.length ? 13 : 0), y);
            y += 13;
          });
          y += 1.5;
        });

        y += 9;
      });

    y += 4;
  });

  pdf.save(`${filename}.pdf`);
}