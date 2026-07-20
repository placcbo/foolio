import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';
import { parseLanguageLevel } from '../components/templates/PortraitTemplate';

// Per-template exporter for PortraitTemplate: light frame around a white
// card, two independently flowing columns, gray badge headings drawn as
// rounded rects, the profile photo embedded when it's a JPEG/PNG data URL,
// and language proficiency drawn as vector bars.

const FRAME_BG = [233, 231, 226];
const BADGE_BG = [231, 229, 225];

export function exportPortraitTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const FR = 12; // frame thickness

  const accent = hexToRgb(resume?.accentColor || '#2b4a6f');
  const ink = [26, 26, 28];
  const body = [46, 48, 52];
  const dim = [112, 114, 120];

  let pageCount = 1;
  function paintFrame() {
    pdf.setFillColor(FRAME_BG[0], FRAME_BG[1], FRAME_BG[2]);
    pdf.rect(0, 0, W, H, 'F');
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(FR, FR, W - FR * 2, H - FR * 2, 8, 8, 'F');
  }
  paintFrame();

  function needPage(n) {
    while (pageCount < n) {
      pdf.addPage();
      pageCount++;
      paintFrame();
    }
    pdf.setPage(n);
  }

  const LX = FR + 26;
  const LW = 180;
  const RX = LX + LW + 26;
  const RW = W - FR - 26 - RX;

  const left = { x: LX, w: LW, y: FR + 44, page: 1, top: FR + 36, bottom: H - FR - 34 };
  const right = { x: RX, w: RW, y: FR + 44, page: 1, top: FR + 36, bottom: H - FR - 34 };

  function ensure(col, needed) {
    if (col.y + needed > col.bottom) {
      col.page += 1;
      col.y = col.top;
    }
    needPage(col.page);
  }

  function setF(size, style, color) {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(color[0], color[1], color[2]);
  }

  function para(col, text, size, style, color, lh = 1.45) {
    setF(size, style, color);
    const lines = pdf.splitTextToSize(text, col.w);
    const step = size * lh;
    lines.forEach((line) => {
      ensure(col, step);
      setF(size, style, color);
      pdf.text(line, col.x, col.y);
      col.y += step;
    });
  }

  function badge(col, title) {
    ensure(col, 26);
    pdf.setFillColor(BADGE_BG[0], BADGE_BG[1], BADGE_BG[2]);
    pdf.roundedRect(col.x, col.y - 11, col.w, 17, 4, 4, 'F');
    setF(8.5, 'bold', ink);
    pdf.setCharSpace(0.5);
    pdf.text((title || '').toUpperCase(), col.x + 8, col.y + 1);
    pdf.setCharSpace(0);
    col.y += 20;
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
  const all = (resume?.sections || []).filter((s) => !s.hidden && sectionHasContent(s));
  const leftSections = all.filter((s) => s.kind === 'tags' || s.kind === 'text');
  const rightSections = all.filter((s) => s.kind === 'entries');
  const dateFormat = resume?.settings?.dateFormat;

  // ----- left column -----
  needPage(1);
  para(left, b.name || 'Your name', 17, 'bold', ink, 1.2);
  left.y += 1;
  if (b.title) {
    para(left, b.title, 10.5, 'normal', body, 1.3);
  }
  left.y += 10;

  if (b.photo && /^data:image\/(jpe?g|png)/i.test(b.photo)) {
    const photoW = 118;
    const photoH = 140;
    ensure(left, photoH + 14);
    try {
      pdf.addImage(b.photo, b.photo.includes('png') ? 'PNG' : 'JPEG', left.x, left.y - 10, photoW, photoH);
      left.y += photoH + 6;
    } catch {
      // unreadable image data — skip the photo rather than fail the export
    }
  }

  const contactParts = contactLine(b).split('  |  ').filter(Boolean);
  if (contactParts.length) {
    left.y += 4;
    contactParts.forEach((part) => {
      para(left, part, 8.5, 'normal', body, 1.4);
      left.y += 2;
    });
  }
  left.y += 12;

  leftSections.forEach((section) => {
    badge(left, section.title);

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        para(left, p, 8.5, 'normal', body, 1.5);
        left.y += 3;
      });
      left.y += 10;
      return;
    }

    const groups = (section.groups && section.groups.length
      ? section.groups
      : [{ label: '', tags: section.tags || [] }]
    ).filter((g) => (g.tags || []).length);

    if (section.type === 'languages') {
      const langs = groups.flatMap((g) => g.tags).map(parseLanguageLevel);
      langs.forEach((l) => {
        ensure(left, 16);
        setF(8.5, 'normal', body);
        pdf.text(l.name, left.x, left.y);
        const barX = left.x + 62;
        const barW = left.w - 62;
        pdf.setFillColor(217, 215, 211);
        pdf.roundedRect(barX, left.y - 5.5, barW, 5, 2.5, 2.5, 'F');
        pdf.setFillColor(accent[0], accent[1], accent[2]);
        pdf.roundedRect(barX, left.y - 5.5, Math.max(barW * l.level, 6), 5, 2.5, 2.5, 'F');
        left.y += 15;
      });
      left.y += 10;
      return;
    }

    const hasLabels = groups.some((g) => g.label && g.label.trim());
    groups.forEach((g) => {
      if (hasLabels && g.label && g.label.trim()) {
        para(left, g.label.trim(), 8.5, 'bold', ink, 1.4);
        left.y += 1;
      }
      g.tags.forEach((t) => {
        const lines = pdf.splitTextToSize(t, left.w - 10);
        lines.forEach((line, i) => {
          ensure(left, 12);
          setF(8.5, 'normal', body);
          if (i === 0) pdf.text('\u2022', left.x, left.y);
          pdf.text(line, left.x + 10, left.y);
          left.y += 12;
        });
      });
      left.y += 6;
    });
    left.y += 8;
  });

  // ----- right column -----
  rightSections.forEach((section) => {
    badge(right, section.title);

    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' \u2013 ');
        const metaLine = [dateRange, entry.location].filter(Boolean).join(' | ');

        ensure(right, 26);
        setF(10, 'bold', ink);
        const headingLines = pdf.splitTextToSize(entry.heading || '', right.w);
        if (entry.link) {
          const url = /^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`;
          pdf.textWithLink(headingLines[0] || '', right.x, right.y, { url });
        } else {
          pdf.text(headingLines[0] || '', right.x, right.y);
        }
        right.y += 12.5;
        headingLines.slice(1).forEach((line) => {
          ensure(right, 12.5);
          setF(10, 'bold', ink);
          pdf.text(line, right.x, right.y);
          right.y += 12.5;
        });

        if (entry.subheading) para(right, entry.subheading, 9.5, 'normal', body, 1.35);
        if (metaLine) para(right, metaLine, 8.5, 'normal', dim, 1.35);
        right.y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, right.w - 12);
          lines.forEach((line, i) => {
            ensure(right, 12.5);
            setF(9, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('\u2022', right.x, right.y);
            pdf.text(line, right.x + (bullets.length ? 12 : 0), right.y);
            right.y += 12.5;
          });
          right.y += 1;
        });

        right.y += 9;
      });

    right.y += 4;
  });

  pdf.save(`${filename}.pdf`);
}