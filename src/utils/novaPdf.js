import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for NovaTemplate: the accent spine is a filled
// rect painted down the left edge of every page, the title renders inside
// a real rounded-rect pill, and section headings carry the same "01, 02…"
// numbering as the on-screen design.

function lighten([r, g, bl], amount) {
  return [
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(bl + (255 - bl) * amount),
  ];
}

export function exportNovaTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const SPINE_W = 8;
  const M = SPINE_W + 40; // left content edge, past the spine
  const MR = 48;
  const CW = W - M - MR;
  const BOTTOM = H - 48;

  const accent = hexToRgb(resume?.accentColor || '#e0263f');
  const badgeBg = lighten(accent, 0.88);
  const ink = [20, 20, 26];
  const body = [38, 38, 38];
  const gray = [85, 85, 91];
  const dim = [107, 107, 107];
  const rule = [28, 28, 32];

  let y = 48;

  function paintSpine() {
    pdf.setFillColor(accent[0], accent[1], accent[2]);
    pdf.rect(0, 0, SPINE_W, H, 'F');
  }
  paintSpine();

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      paintSpine();
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

  const b = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden && sectionHasContent(s));
  const dateFormat = resume?.settings?.dateFormat;

  // ----- header -----
  setF(24, 'bold', ink);
  pdf.text(b.name || 'Your name', M, y);
  y += 22;

  if (b.title) {
    setF(9.5, 'bold', accent);
    const tw = pdf.getTextWidth(b.title);
    const padX = 11;
    pdf.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
    pdf.roundedRect(M, y - 11, tw + padX * 2, 16.5, 8.25, 8.25, 'F');
    pdf.text(b.title, M + padX, y);
    y += 22;
  }

  const contact = contactLine(b).replace(/ {2}\| {2}/g, '   |   ');
  if (contact) {
    para(contact, 9.5, 'normal', gray, { lh: 1.3 });
  }
  y += 12;

  // ----- sections -----
  sections.forEach((section, idx) => {
    ensure(26);
    const label = String(idx + 1).padStart(2, '0');
    setF(9, 'bold', accent);
    pdf.text(label, M, y);
    const labelW = pdf.getTextWidth(label);
    setF(11, 'bold', ink);
    pdf.setCharSpace(0.6);
    pdf.text((section.title || '').toUpperCase(), M + labelW + 10, y);
    pdf.setCharSpace(0);
    y += 8;
    pdf.setDrawColor(rule[0], rule[1], rule[2]);
    pdf.setLineWidth(1.1);
    pdf.line(M, y, W - MR, y);
    y += 16;

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        para(p, 10.5, 'normal', body, { lh: 1.5 });
        y += 3;
      });
      y += 8;
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
          const label2 = g.label && g.label.trim() ? g.label.trim() + ':' : '';
          const values = (g.tags || []).join(', ');
          setF(10, 'bold', ink);
          const labelLines = label2 ? pdf.splitTextToSize(label2, LABEL_W - 10) : [];
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

        const MARKER = 5;
        const MARKER_GAP = 7;
        pdf.setFillColor(accent[0], accent[1], accent[2]);
        pdf.rect(M, y - MARKER, MARKER, MARKER, 'F');

        let dateWidth = 0;
        if (dateRange) {
          setF(9.5, 'normal', dim);
          dateWidth = pdf.getTextWidth(dateRange);
        }

        setF(11, 'bold', ink);
        const headX = M + MARKER + MARKER_GAP;
        const headingLines = pdf.splitTextToSize(entry.heading || '', CW - MARKER - MARKER_GAP - (dateWidth ? dateWidth + 14 : 0));
        if (entry.link) {
          const url = /^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`;
          pdf.textWithLink(headingLines[0] || '', headX, y, { url });
        } else {
          pdf.text(headingLines[0] || '', headX, y);
        }
        if (dateRange) {
          setF(9.5, 'normal', dim);
          pdf.text(dateRange, W - MR, y, { align: 'right' });
        }
        y += 13.5;
        headingLines.slice(1).forEach((line) => {
          ensure(13.5);
          setF(11, 'bold', ink);
          pdf.text(line, headX, y);
          y += 13.5;
        });

        const indent = M + 15;
        const sub = [entry.subheading, entry.location].filter(Boolean).join(' – ');
        if (sub) para(sub, 10, 'normal', gray, { x: indent, width: W - MR - indent, lh: 1.35 });
        y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, W - MR - indent - 14);
          lines.forEach((line, i) => {
            ensure(13.5);
            setF(10, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('•', indent, y);
            pdf.text(line, indent + (bullets.length ? 14 : 0), y);
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
