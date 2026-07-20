import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for SlateTemplate. The dark sidebar is a real
// filled rectangle painted on every page; sidebar and main content flow as
// two independent columns, each with its own y-cursor and page tracking, so
// either side can spill to page 2 without disturbing the other.

const SIDE_BG = [35, 43, 51];
const SIDE_TEXT = [232, 234, 236];
const SIDE_DIM = [176, 182, 188];

export function exportSlateTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const SIDE_W = 190;

  const accent = hexToRgb(resume?.accentColor || '#3aa7a3');
  const ink = [24, 26, 28];
  const body = [40, 42, 46];
  const dim = [110, 114, 120];

  let pageCount = 1;
  function paintSidebar() {
    pdf.setFillColor(SIDE_BG[0], SIDE_BG[1], SIDE_BG[2]);
    pdf.rect(0, 0, SIDE_W, H, 'F');
  }
  paintSidebar();

  function needPage(n) {
    while (pageCount < n) {
      pdf.addPage();
      pageCount++;
      paintSidebar();
    }
    pdf.setPage(n);
  }

  // Independent flowing columns
  const side = { x: 24, w: SIDE_W - 48, y: 64, page: 1, top: 56, bottom: H - 50 };
  const main = { x: SIDE_W + 30, w: W - SIDE_W - 30 - 46, y: 68, page: 1, top: 60, bottom: H - 50 };

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

  function para(col, text, size, style, color, lh = 1.45, x = col.x, width = col.w) {
    setF(size, style, color);
    const lines = pdf.splitTextToSize(text, width);
    const step = size * lh;
    lines.forEach((line) => {
      ensure(col, step);
      setF(size, style, color);
      pdf.text(line, x, col.y);
      col.y += step;
    });
  }

  function sideHeading(title) {
    ensure(side, 26);
    setF(9, 'bold', accent);
    pdf.setCharSpace(1);
    pdf.text((title || '').toUpperCase(), side.x, side.y);
    pdf.setCharSpace(0);
    side.y += 14;
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
  const sideSections = all.filter((s) => s.kind === 'tags');
  const mainSections = all.filter((s) => s.kind !== 'tags');
  const dateFormat = resume?.settings?.dateFormat;

  // ----- sidebar: name, title, contact, tags sections -----
  needPage(1);
  para(side, b.name || 'Your name', 19, 'bold', [255, 255, 255], 1.15);
  side.y += 2;
  if (b.title) {
    para(side, b.title, 10, 'normal', accent, 1.35);
  }
  side.y += 14;

  const contactParts = contactLine(b).split('  |  ').filter(Boolean);
  if (contactParts.length) {
    sideHeading('Contact');
    contactParts.forEach((part) => {
      para(side, part, 8.5, 'normal', SIDE_TEXT, 1.4);
      side.y += 2;
    });
    side.y += 12;
  }

  sideSections.forEach((section) => {
    sideHeading(section.title);
    const groups = (section.groups && section.groups.length
      ? section.groups
      : [{ label: '', tags: section.tags || [] }]
    ).filter((g) => (g.tags || []).length);
    groups.forEach((g) => {
      if (g.label && g.label.trim()) {
        para(side, g.label.trim(), 8.5, 'bold', SIDE_DIM, 1.4);
        side.y += 1;
      }
      g.tags.forEach((t) => {
        para(side, t, 8.5, 'normal', SIDE_TEXT, 1.4);
        side.y += 1.5;
      });
      side.y += 5;
    });
    side.y += 8;
  });

  // ----- main column -----
  mainSections.forEach((section) => {
    ensure(main, 24);
    setF(11, 'bold', accent);
    pdf.setCharSpace(0.6);
    pdf.text((section.title || '').toUpperCase(), main.x, main.y);
    pdf.setCharSpace(0);
    main.y += 7;
    pdf.setDrawColor(224, 226, 228);
    pdf.setLineWidth(0.75);
    pdf.line(main.x, main.y, main.x + main.w, main.y);
    main.y += 15;

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        para(main, p, 10, 'normal', body, 1.5);
        main.y += 3;
      });
      main.y += 10;
      return;
    }

    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' \u2013 ');

        ensure(main, 28);
        let dateWidth = 0;
        if (dateRange) {
          setF(9, 'normal', dim);
          dateWidth = pdf.getTextWidth(dateRange);
        }
        setF(10.5, 'bold', ink);
        const headingLines = pdf.splitTextToSize(entry.heading || '', main.w - (dateWidth ? dateWidth + 12 : 0));
        if (entry.link) {
          const url = /^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`;
          pdf.textWithLink(headingLines[0] || '', main.x, main.y, { url });
        } else {
          pdf.text(headingLines[0] || '', main.x, main.y);
        }
        if (dateRange) {
          setF(9, 'normal', dim);
          pdf.text(dateRange, main.x + main.w, main.y, { align: 'right' });
        }
        main.y += 13;
        headingLines.slice(1).forEach((line) => {
          ensure(main, 13);
          setF(10.5, 'bold', ink);
          pdf.text(line, main.x, main.y);
          main.y += 13;
        });

        const sub = [entry.subheading, entry.location].filter(Boolean).join(' \u2013 ');
        if (sub) para(main, sub, 9.5, 'normal', dim, 1.4);
        main.y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, main.w - 13);
          lines.forEach((line, i) => {
            ensure(main, 13);
            setF(9.5, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('\u2022', main.x, main.y);
            pdf.text(line, main.x + (bullets.length ? 13 : 0), main.y);
            main.y += 13;
          });
          main.y += 1.5;
        });

        main.y += 9;
      });

    main.y += 4;
  });

  pdf.save(`${filename}.pdf`);
}