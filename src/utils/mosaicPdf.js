import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for MosaicTemplate. Unlike every other exporter in
// this set (which just flow top-to-bottom), a card-grid needs each card's
// height known *before* it's placed, so a section is first turned into a
// "plan" — a list of relative draw instructions plus a total height — via
// buildCardPlan(), and only then stamped onto the page at a real (x, y).
// That plan is reused for two purposes: computing where the card fits, and
// actually drawing it, so measurement and rendering can never drift apart.
//
// Pagination is deliberately simple: if a card doesn't fit in its column's
// remaining space, the whole grid (both columns) moves to a new page. A
// single card taller than one page isn't split — a bounded simplification,
// same category as willowPdf.js's sidebar entries not repeating their
// gutter on a continuation page.

const CARD_BG_BORDER = [228, 228, 232];

export function exportMosaicTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 40;
  const GAP = 14;
  const CW = W - M * 2;
  const COL_W = (CW - GAP) / 2;
  const TOP = 40;
  const BOTTOM = H - 40;

  const accent = hexToRgb(resume?.accentColor || '#5b4bb5');
  const chipBg = [
    Math.round(accent[0] + (255 - accent[0]) * 0.88),
    Math.round(accent[1] + (255 - accent[1]) * 0.88),
    Math.round(accent[2] + (255 - accent[2]) * 0.88),
  ];
  const ink = [20, 20, 26];
  const body = [38, 38, 38];
  const gray = [85, 85, 91];
  const dim = [107, 107, 107];

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

  // ---- plan builder: returns { height, ops } where ops is a list of
  // { text, x, y, size, style, color, align, bullet, url } relative to the
  // card's own (0, 0) top-left content origin (i.e. already inside padding).
  function buildCardPlan(section, width, dateFormat) {
    const PAD = 14;
    const innerW = width - PAD * 2;
    const ops = [];
    let y = 0;

    setF(9.5, 'bold', accent);
    ops.push({ text: (section.title || '').toUpperCase(), x: PAD, y: PAD + 8, size: 9.5, style: 'bold', color: accent, charSpace: 0.4 });
    y = PAD + 8 + 14;

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        setF(10, 'normal', body);
        const lines = pdf.splitTextToSize(p, innerW);
        lines.forEach((line) => {
          y += 10 * 1.5;
          ops.push({ text: line, x: PAD, y, size: 10, style: 'normal', color: body });
        });
        y += 3;
      });
    } else if (section.kind === 'tags') {
      const groups = (section.groups && section.groups.length
        ? section.groups
        : [{ label: '', tags: section.tags || [] }]
      ).filter((g) => (g.tags || []).length);
      const hasLabels = groups.some((g) => g.label && g.label.trim());

      groups.forEach((g, gi) => {
        if (hasLabels && g.label && g.label.trim()) {
          y += 8.5 * 1.3 + (gi > 0 ? 4 : 0);
          ops.push({ text: g.label.trim(), x: PAD, y, size: 8.5, style: 'bold', color: ink });
          y += 3;
        } else if (gi > 0) {
          y += 4;
        }
        // wrap chips left-to-right within innerW
        setF(8.5, 'bold', accent);
        let cx = PAD;
        let rowStarted = false;
        y += 10;
        g.tags.forEach((tag) => {
          const tw = pdf.getTextWidth(tag) + 20;
          if (rowStarted && cx + tw > PAD + innerW) {
            cx = PAD;
            y += 16;
          }
          ops.push({ chip: true, text: tag, x: cx, y, width: tw - 8, height: 15, color: accent, bg: chipBg });
          cx += tw + 6;
          rowStarted = true;
        });
        y += 8;
      });
    } else if (section.kind === 'entries') {
      const entries = (section.entries || []).filter(
        (e) => !e.hidden && (e.heading || e.subheading || htmlListItems(e.description).length > 0 || htmlParagraphs(e.description).length > 0)
      );
      entries.forEach((entry, ei) => {
        if (ei > 0) y += 10;
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' – ');

        setF(9, 'bold', dim);
        const dateW = dateRange ? pdf.getTextWidth(dateRange) : 0;
        setF(10.5, 'bold', ink);
        const headingLines = pdf.splitTextToSize(entry.heading || '', innerW - (dateW ? dateW + 10 : 0));
        y += 10.5 * 1.2;
        const url = entry.link ? (/^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`) : null;
        ops.push({ text: headingLines[0] || '', x: PAD, y, size: 10.5, style: 'bold', color: ink, url });
        if (dateRange) ops.push({ text: dateRange, x: PAD + innerW, y, size: 9, style: 'bold', color: dim, align: 'right' });
        headingLines.slice(1).forEach((line) => {
          y += 10.5 * 1.2;
          ops.push({ text: line, x: PAD, y, size: 10.5, style: 'bold', color: ink });
        });

        const sub = [entry.subheading, entry.location].filter(Boolean).join(' – ');
        if (sub) {
          setF(9.5, 'normal', gray);
          const subLines = pdf.splitTextToSize(sub, innerW);
          subLines.forEach((line) => {
            y += 9.5 * 1.35;
            ops.push({ text: line, x: PAD, y, size: 9.5, style: 'normal', color: gray });
          });
        }

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          setF(9.5, 'normal', body);
          const lines = pdf.splitTextToSize(t, innerW - (bullets.length ? 12 : 0));
          lines.forEach((line, i) => {
            y += 9.5 * 1.4;
            ops.push({
              text: line,
              x: PAD + (bullets.length ? 12 : 0),
              y,
              size: 9.5,
              style: 'normal',
              color: body,
              bulletBefore: i === 0 && bullets.length ? PAD : null,
            });
          });
        });
      });
    }

    return { height: y + PAD, ops };
  }

  function drawCard(plan, x, y, width) {
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(CARD_BG_BORDER[0], CARD_BG_BORDER[1], CARD_BG_BORDER[2]);
    pdf.setLineWidth(0.75);
    pdf.roundedRect(x, y, width, plan.height, 6, 6, 'FD');
    pdf.setDrawColor(accent[0], accent[1], accent[2]);
    pdf.setLineWidth(2.5);
    pdf.line(x + 6, y + 1.25, x + width - 6, y + 1.25);

    plan.ops.forEach((op) => {
      if (op.chip) {
        pdf.setFillColor(op.bg[0], op.bg[1], op.bg[2]);
        pdf.roundedRect(x + op.x, y + op.y - 11, op.width, op.height, 7.5, 7.5, 'F');
        setF(8.5, 'bold', op.color);
        pdf.text(op.text, x + op.x + 8, y + op.y);
        return;
      }
      setF(op.size, op.style, op.color);
      if (op.charSpace) pdf.setCharSpace(op.charSpace);
      const px = x + op.x;
      const py = y + op.y;
      if (op.bulletBefore != null) pdf.text('•', x + op.bulletBefore, py);
      if (op.url) {
        pdf.textWithLink(op.text, px, py, { url: op.url });
      } else if (op.align === 'right') {
        pdf.text(op.text, px, py, { align: 'right' });
      } else {
        pdf.text(op.text, px, py);
      }
      if (op.charSpace) pdf.setCharSpace(0);
    });
  }

  const b = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden && sectionHasContent(s));
  const dateFormat = resume?.settings?.dateFormat;

  // ----- header -----
  let y = TOP;
  setF(20, 'bold', ink);
  pdf.text(b.name || 'Your name', M, y);
  y += 18;
  if (b.title) {
    setF(11, 'bold', accent);
    pdf.text(b.title, M, y);
    y += 15;
  }
  const contact = contactLine(b).replace(/ {2}\| {2}/g, '     ');
  if (contact) {
    setF(9, 'normal', gray);
    const lines = pdf.splitTextToSize(contact, CW);
    lines.forEach((line) => {
      pdf.text(line, M, y);
      y += 12;
    });
  }
  y += 12;

  // ----- grid -----
  const colX = [M, M + COL_W + GAP];
  let colY = [y, y];

  function newGridPage() {
    pdf.addPage();
    colY = [TOP, TOP];
  }

  sections.forEach((section) => {
    const isFull = section.kind !== 'tags';
    if (isFull) {
      const rowY = Math.max(colY[0], colY[1]);
      const plan = buildCardPlan(section, CW, dateFormat);
      if (rowY + plan.height > BOTTOM) {
        newGridPage();
        const plan2 = buildCardPlan(section, CW, dateFormat);
        drawCard(plan2, colX[0], colY[0], CW);
        colY = [colY[0] + plan2.height + GAP, colY[0] + plan2.height + GAP];
      } else {
        drawCard(plan, colX[0], rowY, CW);
        colY = [rowY + plan.height + GAP, rowY + plan.height + GAP];
      }
    } else {
      const col = colY[0] <= colY[1] ? 0 : 1;
      const plan = buildCardPlan(section, COL_W, dateFormat);
      if (colY[col] + plan.height > BOTTOM) {
        newGridPage();
        const plan2 = buildCardPlan(section, COL_W, dateFormat);
        drawCard(plan2, colX[0], colY[0], COL_W);
        colY[0] += plan2.height + GAP;
      } else {
        drawCard(plan, colX[col], colY[col], COL_W);
        colY[col] += plan.height + GAP;
      }
    }
  });

  pdf.save(`${filename}.pdf`);
}
