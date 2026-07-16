import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { formatEntryDateRange } from './dateFormat';
import { DEFAULT_FONT_SIZE } from '../state/resumeReducer';

const DOCX_PAGE_SIZES = {
  A4: { width: 11906, height: 16838 },
  'US Letter': { width: 12240, height: 15840 },
};

// PDF: renders the actual .paper DOM node to a canvas, then drops that
// image into a PDF and saves it immediately — no print dialog, no extra
// click. Handles multi-page overflow if the resume runs long.
export async function downloadResumeAsPdf(paperEl, filename = 'resume', pageFormat = 'A4') {
  if (!paperEl) throw new Error('Could not find the resume to export.');

  const canvas = await html2canvas(paperEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ unit: 'pt', format: pageFormat === 'US Letter' ? 'letter' : 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}

function buildContactLine(basics) {
  const parts = [basics.email, basics.phone, basics.address];
  (basics.visibleExtra || []).forEach((key) => {
    if (basics[key]) parts.push(basics[key]);
  });
  return parts.filter(Boolean).join('   |   ');
}

function entryParagraphs(entry, dateFormat, sizes) {
  const paras = [];
  const { start, end } = formatEntryDateRange(entry, dateFormat);
  const dateRange = [start, end].filter(Boolean).join(' – ');

  paras.push(
    new Paragraph({
      spacing: { before: 160, after: 20 },
      children: [
        new TextRun({ text: entry.heading || '', bold: true, size: sizes.entryHeader }),
        dateRange
          ? new TextRun({ text: `    ${dateRange}`, italics: true, size: sizes.base })
          : new TextRun(''),
      ],
    })
  );

  const subLine = [entry.subheading, entry.location].filter(Boolean).join(' · ');
  if (subLine) {
    paras.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: subLine, italics: true, size: sizes.base })],
      })
    );
  }

  paras.push(...htmlToDocxParagraphs(entry.description, sizes.base));

  return paras;
}

function isHtmlEmpty(html) {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, '').trim().length === 0;
}

// Summary/text sections are edited as rich text (contentEditable) and stored
// as HTML. docx has no HTML importer, so walk the parsed DOM ourselves:
// block elements (p/div/li) each become a Paragraph, inline b/i/u become
// TextRun formatting, and <li> gets a bullet prefix.
function inlineRuns(node, size, style, runs) {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent) runs.push(new TextRun({ text: child.textContent, size, ...style }));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const tag = child.tagName.toLowerCase();
    if (tag === 'br') {
      runs.push(new TextRun({ text: '', break: 1, size }));
      return;
    }
    const nextStyle = { ...style };
    if (tag === 'b' || tag === 'strong') nextStyle.bold = true;
    if (tag === 'i' || tag === 'em') nextStyle.italics = true;
    if (tag === 'u') nextStyle.underline = {};
    inlineRuns(child, size, nextStyle, runs);
  });
}

function htmlToDocxParagraphs(html, size) {
  if (isHtmlEmpty(html)) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks = doc.body.querySelectorAll('p, div, li');
  const paragraphs = [];
  const nodes = blocks.length ? Array.from(blocks) : [doc.body];

  nodes.forEach((node) => {
    // Skip container divs/ps that only wrap other block elements, so text
    // doesn't get duplicated once for the wrapper and once for its children.
    if (node !== doc.body && node.querySelector('p, div, li')) return;
    const runs = [];
    inlineRuns(node, size, {}, runs);
    if (!runs.length) return;
    const bullet = node.tagName?.toLowerCase() === 'li';
    if (bullet) runs.unshift(new TextRun({ text: '•  ', size }));
    paragraphs.push(new Paragraph({ spacing: { after: 40 }, children: runs }));
  });

  return paragraphs;
}

function sectionParagraphs(section, dateFormat, sizes) {
  const paras = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 100 },
      children: [
        new TextRun({ text: (section.title || '').toUpperCase(), bold: true, size: sizes.heading }),
      ],
    }),
  ];

  if (section.kind === 'text') {
    paras.push(...htmlToDocxParagraphs(section.content, sizes.base));
  } else if (section.kind === 'tags') {
    if (section.tags?.length) {
      paras.push(
        new Paragraph({ children: [new TextRun({ text: section.tags.join('   •   '), size: sizes.base })] })
      );
    }
  } else if (section.kind === 'entries') {
    (section.entries || [])
      .filter(
        (e) =>
          !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
      )
      .forEach((entry) => paras.push(...entryParagraphs(entry, dateFormat, sizes)));
  }

  return paras;
}

export async function exportResumeAsDocx(resume) {
  const { basics, sections, settings } = resume;
  const dateFormat = settings?.dateFormat;
  const pageSize = DOCX_PAGE_SIZES[settings?.pageFormat] || DOCX_PAGE_SIZES.A4;
  const fontSize = settings?.fontSize ?? DEFAULT_FONT_SIZE;
  const toHalfPt = (pt) => Math.round(pt * 2);
  const sizes = {
    base: toHalfPt(fontSize.base),
    name: toHalfPt(fontSize.base + fontSize.fullName),
    heading: toHalfPt(fontSize.base + fontSize.sectionHeadings),
    entryHeader: toHalfPt(fontSize.base + fontSize.entryHeader),
  };

  const children = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 40 },
      children: [new TextRun({ text: basics.name || 'Your name', bold: true, size: sizes.name })],
    }),
  ];

  if (basics.title) {
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: basics.title, italics: true, size: sizes.base })],
      })
    );
  }

  const contactLine = buildContactLine(basics);
  if (contactLine) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: contactLine, size: sizes.base, color: '555555' })],
      })
    );
  }

  sections
    .filter((section) => !section.hidden)
    .forEach((section) => children.push(...sectionParagraphs(section, dateFormat, sizes)));

  const doc = new Document({
    sections: [{ properties: { page: { size: pageSize } }, children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(basics.name || 'resume').trim().replace(/\s+/g, '_')}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}