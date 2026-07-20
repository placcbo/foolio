import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for MeridianTemplate: the vertical timeline is a
// real hairline painted on every page, gutter dates right-align against it,
// and each entry gets an accent dot drawn on the line.

export function exportMeridianTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 52;
  const GUTTER_R = M + 112; // right edge of the gutter (dates right-align here)
  const LINE_X = GUTTER_R + 14; // the timeline
  const CX = LINE_X + 16; // content left edge
  const CW = W - M - CX;
  const BOTTOM = H - 52;
  const TOP_CONT = 58;

  const accent = hexToRgb(resume?.accentColor || '#d43d2a');
  const ink = [22, 22, 24];
  const body = [44, 46, 50];
  const dim = [116, 118, 124];
  const hair = [214, 214, 216];

  let y = 74;
  let lineFromY = null; // where the timeline starts on page 1 (below masthead)

  function paintLine(fromY) {
    pdf.setDrawColor(hair[0], hair[1], hair[2]);
    pdf.setLineWidth(1);
    pdf.line(LINE_X, fromY, LINE_X, BOTTOM);
  }

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      y = TOP_CONT;
      paintLine(TOP_CONT - 14);
    }
  }

  function setF(size, style, color) {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
  }

  function para(text, size, style, color, { x = CX, width = CW, lh = 1.5 } = {}) {
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

  // ----- masthead -----
  setF(27, 'bold', ink);
  pdf.text(b.name || 'Your name', M, y);
  y += 10;
  pdf.setDrawColor(ink[0], ink[1], ink[2]);
  pdf.setLineWidth(1.2);
  pdf.line(M, y, W - M, y);
  y += 16;

  setF(10, 'bold', accent);
  if (b.title) pdf.text(b.title, M, y);
  const contact = contactLine(b).replace(/ {2}\| {2}/g, '   |   ');
  if (contact) {
    setF(8.5, 'normal', dim);
    const cw = pdf.getTextWidth(contact);
    if (cw <= (b.title ? CW : W - M * 2)) {
      pdf.text(contact, W - M, y, { align: 'right' });
      y += 16;
    } else {
      y += b.title ? 14 : 0;
      para(contact, 8.5, 'normal', dim, { x: M, width: W - M * 2, lh: 1.4 });
      y += 2;
    }
  } else {
    y += 16;
  }
  y += 14;

  lineFromY = y - 6;
  paintLine(lineFromY);

  // ----- sections -----
  sections.forEach((section) => {
    ensure(24);
    setF(9, 'bold', accent);
    pdf.setCharSpace(0.8);
    pdf.text((section.title || '').toUpperCase(), GUTTER_R, y, { align: 'right' });
    pdf.setCharSpace(0);
    y += 16;

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        para(p, 9.5, 'normal', body, { lh: 1.55 });
        y += 3;
      });
      y += 12;
      return;
    }

    if (section.kind === 'tags') {
      const groups = (section.groups && section.groups.length
        ? section.groups
        : [{ label: '', tags: section.tags || [] }]
      ).filter((g) => (g.tags || []).length);
      const hasLabels = groups.some((g) => g.label && g.label.trim());
      if (!hasLabels) {
        para(groups.flatMap((g) => g.tags).join('   |   '), 9.5, 'normal', body, { lh: 1.55 });
      } else {
        groups.forEach((g) => {
          const label = g.label && g.label.trim() ? g.label.trim() + ': ' : '';
          setF(9.5, 'bold', ink);
          const labelW = label ? pdf.getTextWidth(label) : 0;
          const first = pdf.splitTextToSize((g.tags || []).join(', '), CW - labelW);
          ensure(14);
          if (label) pdf.text(label, CX, y);
          setF(9.5, 'normal', body);
          pdf.text(first[0] || '', CX + labelW, y);
          y += 13.5;
          first.slice(1).forEach((line) => {
            ensure(13.5);
            setF(9.5, 'normal', body);
            pdf.text(line, CX, y);
            y += 13.5;
          });
          y += 2;
        });
      }
      y += 12;
      return;
    }

    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' \u2013 ');

        ensure(28);

        // dot on the timeline
        pdf.setFillColor(255, 255, 255);
        pdf.circle(LINE_X, y - 3.2, 4.4, 'F');
        pdf.setFillColor(accent[0], accent[1], accent[2]);
        pdf.circle(LINE_X, y - 3.2, 3, 'F');

        if (dateRange) {
          setF(8.5, 'normal', dim);
          pdf.text(dateRange, GUTTER_R, y, { align: 'right' });
        }

        setF(10.5, 'bold', ink);
        const headingLines = pdf.splitTextToSize(entry.heading || '', CW);
        if (entry.link) {
          const url = /^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`;
          pdf.textWithLink(headingLines[0] || '', CX, y, { url });
        } else {
          pdf.text(headingLines[0] || '', CX, y);
        }
        y += 13;
        headingLines.slice(1).forEach((line) => {
          ensure(13);
          setF(10.5, 'bold', ink);
          pdf.text(line, CX, y);
          y += 13;
        });

        const sub = [entry.subheading, entry.location].filter(Boolean).join(' \u2013 ');
        if (sub) para(sub, 9.5, 'normal', dim, { lh: 1.4 });
        y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, CW - 12);
          lines.forEach((line, i) => {
            ensure(13);
            setF(9.5, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('\u2022', CX, y);
            pdf.text(line, CX + (bullets.length ? 12 : 0), y);
            y += 13;
          });
          y += 1;
        });

        y += 10;
      });

    y += 4;
  });

  pdf.save(`${filename}.pdf`);
}