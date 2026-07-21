import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';
import { parseLanguageLevel } from '../components/templates/PortraitTemplate';

// Per-template exporter for LensTemplate: the headshot is drawn through a
// circular clip path (save graphics state → trace a circle with no paint →
// clip → discard the path → draw the image → restore), section titles sit
// on a real full-bleed filled bar, and languages draw as a 5-dot rating
// instead of a bar. Like portraitPdf.js, the photo only embeds when it's a
// data:image/* URI — the same shape real user uploads take via FileReader.

const BAR_BG = [238, 240, 242];

export function exportLensTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 44;
  const CW = W - M * 2;
  const BOTTOM = H - 40;

  const accent = hexToRgb(resume?.accentColor || '#2b4a6f');
  const ink = [20, 20, 26];
  const body = [38, 38, 38];
  const gray = [74, 74, 74];
  const dim = [107, 107, 107];

  let y = 40;

  function ensure(needed) {
    if (y + needed > BOTTOM) {
      pdf.addPage();
      y = 40;
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

  function heading(title) {
    ensure(30);
    pdf.setFillColor(BAR_BG[0], BAR_BG[1], BAR_BG[2]);
    pdf.rect(0, y - 12, W, 24, 'F');
    setF(10.5, 'bold', ink);
    pdf.text(title || '', W / 2, y + 3, { align: 'center' });
    y += 30;
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

  // ----- header: circular photo + name/title/contact -----
  const photoD = 52;
  const photoCX = M + photoD / 2;
  const photoCY = 44 + photoD / 2;
  const hasPhoto = b.photo && /^data:image\/(jpe?g|png)/i.test(b.photo);
  if (hasPhoto) {
    try {
      pdf.saveGraphicsState();
      pdf.circle(photoCX, photoCY, photoD / 2);
      pdf.clip();
      pdf.discardPath();
      pdf.addImage(b.photo, b.photo.includes('png') ? 'PNG' : 'JPEG', M, 44, photoD, photoD);
      pdf.restoreGraphicsState();
    } catch {
      // unreadable image data — skip the photo rather than fail the export
    }
  }
  pdf.setDrawColor(accent[0], accent[1], accent[2]);
  pdf.setLineWidth(1.5);
  pdf.circle(photoCX, photoCY, photoD / 2, 'S');

  const textX = M + photoD + 16;
  const textW = CW - photoD - 16;
  let hy = 60;
  setF(15, 'bold', ink);
  pdf.text(b.name || 'Your name', textX, hy, { maxWidth: textW });
  hy += 16;
  if (b.title) {
    setF(10.5, 'bold', accent);
    pdf.text(b.title, textX, hy);
    hy += 14;
  }
  const contact = contactLine(b).replace(/ {2}\| {2}/g, '     ');
  if (contact) {
    setF(8.5, 'normal', gray);
    const lines = pdf.splitTextToSize(contact, textW);
    lines.slice(0, 2).forEach((line) => {
      pdf.text(line, textX, hy);
      hy += 11;
    });
  }

  y = Math.max(44 + photoD + 10, hy + 8);

  // ----- sections -----
  sections.forEach((section) => {
    heading(section.title);

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
      const flat = groups.flatMap((g) => g.tags);
      const hasLabels = groups.some((g) => g.label && g.label.trim());

      if (section.type === 'languages') {
        const langs = flat.map(parseLanguageLevel);
        langs.forEach((l) => {
          ensure(16);
          setF(10, 'normal', body);
          pdf.text(l.name, M, y);
          const filled = Math.round(l.level * 5);
          const dotsX = M + 130;
          for (let i = 0; i < 5; i++) {
            pdf.setFillColor(...(i < filled ? accent : [218, 220, 223]));
            pdf.circle(dotsX + i * 11, y - 3, 3.2, 'F');
          }
          y += 16;
        });
        y += 6;
        return;
      }

      if (!hasLabels) {
        const colW = CW / 3;
        const rows = Math.ceil(flat.length / 3);
        for (let row = 0; row < rows; row++) {
          ensure(14);
          for (let col = 0; col < 3; col++) {
            const tag = flat[row * 3 + col];
            if (tag == null) continue;
            const tx = M + col * colW;
            pdf.setFillColor(accent[0], accent[1], accent[2]);
            pdf.circle(tx + 2, y - 3, 1.8, 'F');
            setF(10, 'normal', body);
            const lines = pdf.splitTextToSize(tag, colW - 14);
            pdf.text(lines[0] || '', tx + 9, y);
          }
          y += 14;
        }
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
      }
      y += 6;
      return;
    }

    // entries
    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' – ');

        ensure(30);
        const gutterW = 95;
        const mainX = M + gutterW + 18;
        const mainW = CW - gutterW - 18;

        // The date/location gutter is drawn once, aligned to the entry's
        // starting line — if a very long entry later triggers a page break
        // (via ensure() below), the gutter isn't repeated on the
        // continuation page. A bounded, deliberate simplification.
        setF(8.5, 'bold', dim);
        if (dateRange) pdf.text(dateRange, M, y);
        if (entry.location) {
          const locLines = pdf.splitTextToSize(entry.location, gutterW);
          let ly = y + (dateRange ? 11 : 0);
          setF(8.5, 'normal', dim);
          locLines.forEach((line) => {
            pdf.text(line, M, ly);
            ly += 10;
          });
        }

        setF(11, 'bold', ink);
        const headingLines = pdf.splitTextToSize(entry.heading || '', mainW);
        if (entry.link) {
          const url = /^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`;
          pdf.textWithLink(headingLines[0] || '', mainX, y, { url });
        } else {
          pdf.text(headingLines[0] || '', mainX, y);
        }
        y += 13;
        headingLines.slice(1).forEach((line) => {
          ensure(13);
          setF(11, 'bold', ink);
          pdf.text(line, mainX, y);
          y += 13;
        });

        if (entry.subheading) {
          const subLines = pdf.splitTextToSize(entry.subheading, mainW);
          subLines.forEach((line) => {
            ensure(12.5);
            setF(10, 'normal', gray);
            pdf.text(line, mainX, y);
            y += 12.5;
          });
        }
        y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, mainW - 14);
          lines.forEach((line, i) => {
            ensure(13);
            setF(10, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('•', mainX, y);
            pdf.text(line, mainX + (bullets.length ? 14 : 0), y);
            y += 13;
          });
          y += 1.5;
        });

        y += 10;
      });

    y += 4;
  });

  pdf.save(`${filename}.pdf`);
}
