import jsPDF from 'jspdf';
import { formatEntryDateRange } from './dateFormat';
import { htmlListItems, htmlParagraphs, hexToRgb, contactLine } from './simplePdf';

// Per-template exporter for WillowTemplate. The accent panel is a real
// filled rectangle painted on every page (same convention as slatePdf.js's
// dark sidebar); sidebar and main flow as two independent columns, each
// with its own y-cursor and page tracking. Sidebar gets summary/skills/
// languages/education (short reference info); main gets every other
// entries-kind section (the career story) — mirrors the on-screen split.

export function exportWillowTemplatePdf(resume, filename = 'resume') {
  const pageFormat = resume?.settings?.pageFormat === 'US Letter' ? 'letter' : 'a4';
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat });

  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const SIDE_W = Math.round(W * 0.42);

  const accent = hexToRgb(resume?.accentColor || '#b7c4b4');
  const ink = [28, 31, 26];
  const sideDim = [60, 65, 55];
  const body = [42, 42, 46];
  const dim = [107, 107, 107];

  let pageCount = 1;
  function paintSidebar() {
    pdf.setFillColor(accent[0], accent[1], accent[2]);
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

  const side = { x: 32, w: SIDE_W - 64, y: 60, page: 1, top: 56, bottom: H - 50 };
  const main = { x: SIDE_W + 40, w: W - SIDE_W - 40 - 46, y: 64, page: 1, top: 60, bottom: H - 50 };

  function ensure(col, needed) {
    if (col.y + needed > col.bottom) {
      col.page += 1;
      col.y = col.top;
    }
    needPage(col.page);
  }

  function setF(size, style, color) {
    pdf.setFont('times', style);
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

  // Reserves room for the heading plus at least one line of what follows it
  // — otherwise a heading landing near the bottom of a column can pass its
  // own (smaller) space check, print, and then have ensure() push its
  // actual content to the next page/column, leaving an orphaned heading
  // with nothing under it.
  function heading(col, title) {
    ensure(col, 26 + 26);
    setF(11.5, 'bold', ink);
    pdf.text(title || '', col.x, col.y);
    col.y += 6;
    pdf.setDrawColor(ink[0], ink[1], ink[2]);
    pdf.setLineWidth(1.1);
    pdf.line(col.x, col.y, col.x + 24, col.y);
    col.y += 14;
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
  const asideSections = all.filter((s) => s.kind !== 'entries' || s.type === 'education');
  const mainSections = all.filter((s) => s.kind === 'entries' && s.type !== 'education');
  const dateFormat = resume?.settings?.dateFormat;

  // ----- sidebar: name, title, contact, quick-reference sections -----
  needPage(1);
  para(side, b.name || 'Your name', 18, 'bold', ink, 1.15);
  side.y += 2;
  if (b.title) para(side, b.title, 9.5, 'italic', sideDim, 1.35);
  side.y += 8;

  const contactParts = contactLine(b).split('  |  ').filter(Boolean);
  contactParts.forEach((part) => {
    para(side, part, 8.5, 'normal', sideDim, 1.4);
    side.y += 2;
  });
  side.y += 14;

  asideSections.forEach((section) => {
    heading(side, section.title);

    if (section.kind === 'text') {
      htmlParagraphs(section.content).forEach((p) => {
        para(side, p, 9, 'normal', ink, 1.5);
        side.y += 3;
      });
      side.y += 8;
      return;
    }

    if (section.kind === 'tags') {
      const groups = (section.groups && section.groups.length
        ? section.groups
        : [{ label: '', tags: section.tags || [] }]
      ).filter((g) => (g.tags || []).length);
      groups.forEach((g) => {
        if (g.label && g.label.trim()) {
          para(side, g.label.trim(), 8.5, 'bold', ink, 1.4);
          side.y += 1;
        }
        g.tags.forEach((t) => {
          para(side, t, 8.5, 'normal', sideDim, 1.4);
          side.y += 1.5;
        });
        side.y += 5;
      });
      side.y += 4;
      return;
    }

    // education-type entries
    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' – ');
        ensure(side, 24);
        para(side, entry.heading || '', 9.5, 'bold', ink, 1.3);
        const sub = [entry.subheading, dateRange].filter(Boolean).join(' · ');
        if (sub) para(side, sub, 8, 'normal', sideDim, 1.35);
        if (!htmlListItems(entry.description).length && htmlParagraphs(entry.description).length) {
          htmlParagraphs(entry.description).forEach((p) => para(side, p, 8, 'normal', sideDim, 1.4));
        }
        side.y += 9;
      });
    side.y += 4;
  });

  // ----- main: career-story entries -----
  mainSections.forEach((section) => {
    heading(main, section.title);

    (section.entries || [])
      .filter((e) => !e.hidden)
      .forEach((entry) => {
        const { start, end } = formatEntryDateRange(entry, dateFormat);
        const dateRange = [start, end].filter(Boolean).join(' – ');

        ensure(main, 28);
        let dateWidth = 0;
        if (dateRange) {
          setF(9.5, 'italic', dim);
          dateWidth = pdf.getTextWidth(dateRange);
        }
        setF(11, 'bold', [23, 23, 26]);
        const headingLines = pdf.splitTextToSize(entry.heading || '', main.w - (dateWidth ? dateWidth + 12 : 0));
        if (entry.link) {
          const url = /^https?:\/\//i.test(entry.link) ? entry.link : `https://${entry.link}`;
          pdf.textWithLink(headingLines[0] || '', main.x, main.y, { url });
        } else {
          pdf.text(headingLines[0] || '', main.x, main.y);
        }
        if (dateRange) {
          setF(9.5, 'italic', dim);
          pdf.text(dateRange, main.x + main.w, main.y, { align: 'right' });
        }
        main.y += 13.5;
        headingLines.slice(1).forEach((line) => {
          ensure(main, 13.5);
          setF(11, 'bold', [23, 23, 26]);
          pdf.text(line, main.x, main.y);
          main.y += 13.5;
        });

        const sub = [entry.subheading, entry.location].filter(Boolean).join(' – ');
        if (sub) para(main, sub, 10, 'italic', dim, 1.4);
        main.y += 2;

        const bullets = htmlListItems(entry.description);
        const bulletTexts = bullets.length ? bullets : htmlParagraphs(entry.description);
        bulletTexts.forEach((t) => {
          const lines = pdf.splitTextToSize(t, main.w - 14);
          lines.forEach((line, i) => {
            ensure(main, 13.5);
            setF(9.5, 'normal', body);
            if (i === 0 && bullets.length) pdf.text('•', main.x, main.y);
            pdf.text(line, main.x + (bullets.length ? 14 : 0), main.y);
            main.y += 13.5;
          });
          main.y += 1.5;
        });

        main.y += 9;
      });

    main.y += 4;
  });

  pdf.save(`${filename}.pdf`);
}
