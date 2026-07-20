import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for CodexTemplate: monospace accents use the PDF
// format's built-in Courier core font (no webfont, same reasoning as
// simplePdf.js), the monogram stamp is a real filled rounded rect (drawn
// axis-aligned — jsPDF has no clean primitive for a rotated fill, so the
// on-screen tilt is the one detail this exporter doesn't reproduce), and
// "// LABEL" headings trail into a real dashed rule.

function lighten([r, g, bl], amount) {
  return [
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(bl + (255 - bl) * amount),
  ];
}

function initialsOf(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export function exportCodexTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 50;
  const CW = W - M * 2;
  const BOTTOM = H - 50;

  const accent = hexToRgb(resume?.accentColor || '#5b4bb5');
  const badgeBg = lighten(accent, 0.9);
  const badgeBorder = lighten(accent, 0.68);
  const ink = [20, 20, 26];
  const body = [35, 35, 38];
  const gray = [85, 85, 91];
  const dim = [130, 130, 135];

  let y = 50;

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      y = 58;
    }
  }

  function setF(size, style, color, font = 'helvetica') {
    pdf.setFont(font, style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
  }

  function para(text, size, style, color, { lh = 1.5, x = M, width = CW, font = 'helvetica' } = {}) {
    setF(size, style, color, font);
    const lines = pdf.splitTextToSize(text, width);
    const step = size * lh;
    lines.forEach((line) => {
      ensure(step);
      setF(size, style, color, font);
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

  // Hashtags wrap word-by-word like the on-screen flex row, rather than
  // being measured as one block, so a long tag list breaks cleanly.
  function drawHashtags(tags) {
    const gap = 10;
    let x = M;
    setF(9, 'bold', accent, 'courier');
    tags.forEach((tag) => {
      const text = `#${String(tag).replace(/\s+/g, '')}`;
      const tw = pdf.getTextWidth(text);
      if (x + tw > M + CW) {
        x = M;
        y += 14;
        ensure(14);
      }
      ensure(14);
      setF(9, 'bold', accent, 'courier');
      pdf.text(text, x, y);
      x += tw + gap;
    });
    y += 14;
  }

  const b = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden && sectionHasContent(s));
  const dateFormat = resume?.settings?.dateFormat;

  // ----- header -----
  const stampSize = 40;
  const stampX = W - M - stampSize;
  const stampY = y - 6;
  const initials = initialsOf(b.name) || '?';

  setF(24, 'bold', ink);
  const headTextWidth = CW - stampSize - 16;
  pdf.text(b.name || 'Your name', M, y);
  y += 22;

  if (b.title) {
    setF(10, 'bold', accent, 'courier');
    const titleLines = pdf.splitTextToSize(`> ${b.title}`, headTextWidth);
    titleLines.forEach((line) => {
      pdf.text(line, M, y);
      y += 13;
    });
    y += 3;
  }

  const contact = contactLine(b).replace(/ {2}\| {2}/g, '  |  ');
  if (contact) {
    setF(8.5, 'normal', gray, 'courier');
    const lines = pdf.splitTextToSize(contact, headTextWidth);
    lines.forEach((line) => {
      pdf.text(line, M, y);
      y += 12;
    });
  }

  pdf.setFillColor(accent[0], accent[1], accent[2]);
  pdf.roundedRect(stampX, stampY - 30, stampSize, stampSize, 9, 9, 'F');
  setF(15, 'bold', [255, 255, 255], 'courier');
  pdf.text(initials, stampX + stampSize / 2, stampY - 30 + stampSize / 2 + 5, { align: 'center' });

  y = Math.max(y, stampY - 30 + stampSize + 8) + 12;
  pdf.setDrawColor(ink[0], ink[1], ink[2]);
  pdf.setLineWidth(1.6);
  pdf.line(M, y, W - M, y);
  y += 22;

  // ----- sections -----
  sections.forEach((section) => {
    ensure(24);
    setF(9.5, 'bold', accent, 'courier');
    const label = `// ${(section.title || '').toUpperCase()}`;
    pdf.text(label, M, y);
    const labelW = pdf.getTextWidth(label);
    const ruleX = M + labelW + 10;
    if (ruleX < W - M) {
      pdf.setDrawColor(dim[0], dim[1], dim[2]);
      pdf.setLineWidth(0.75);
      pdf.setLineDashPattern([1.5, 1.5], 0);
      pdf.line(ruleX, y - 3, W - M, y - 3);
      pdf.setLineDashPattern([], 0);
    }
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
        drawHashtags(groups.flatMap((g) => g.tags));
      } else {
        const LABEL_W = 150;
        groups.forEach((g) => {
          const label2 = g.label && g.label.trim() ? g.label.trim().toUpperCase() : '';
          const values = (g.tags || []).join(', ');
          setF(8.5, 'bold', ink, 'courier');
          const labelLines = label2 ? pdf.splitTextToSize(label2, LABEL_W - 10) : [];
          setF(10, 'normal', body, 'helvetica');
          const valueLines = pdf.splitTextToSize(values, CW - LABEL_W);
          const rows = Math.max(labelLines.length, valueLines.length, 1);
          ensure(rows * 13.5 + 3);
          const startY = y;
          setF(8.5, 'bold', ink, 'courier');
          labelLines.forEach((ln, i) => pdf.text(ln, M, startY + i * 13.5));
          setF(10, 'normal', body, 'helvetica');
          valueLines.forEach((ln, i) => pdf.text(ln, M + LABEL_W, startY + i * 13.5));
          y = startY + rows * 13.5 + 3;
        });
      }
      y += 8;
      return;
    }

    // entries
    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        // "→" isn't in Courier's WinAnsi encoding table (unlike the "–" and
        // "•" other exporters use, which are) — it renders as garbage and
        // throws off the measured badge width, truncating the date next to
        // it. ASCII "->" keeps the terminal feel and is always renderable.
        const dateRange = [start, end].filter(Boolean).join(' -> ');

        ensure(28);

        let badgeW = 0;
        if (dateRange) {
          setF(8, 'bold', accent, 'courier');
          badgeW = pdf.getTextWidth(dateRange) + 14;
        }

        setF(11, 'bold', ink, 'helvetica');
        const headingLines = pdf.splitTextToSize(entry.heading || '', CW - (badgeW ? badgeW + 10 : 0));
        if (entry.link) {
          const url = /^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`;
          pdf.textWithLink(headingLines[0] || '', M, y, { url });
        } else {
          pdf.text(headingLines[0] || '', M, y);
        }
        if (dateRange) {
          pdf.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
          pdf.setDrawColor(badgeBorder[0], badgeBorder[1], badgeBorder[2]);
          pdf.setLineWidth(0.75);
          pdf.roundedRect(W - M - badgeW, y - 10.5, badgeW, 14, 4, 4, 'FD');
          setF(8, 'bold', accent, 'courier');
          pdf.text(dateRange, W - M - badgeW / 2, y - 0.5, { align: 'center' });
        }
        y += 13.5;
        headingLines.slice(1).forEach((line) => {
          ensure(13.5);
          setF(11, 'bold', ink, 'helvetica');
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
            setF(10, 'normal', body, 'helvetica');
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
