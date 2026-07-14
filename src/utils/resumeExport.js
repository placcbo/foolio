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

  (entry.description || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      paras.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({ text: `•  ${line}`, size: sizes.base })],
        })
      );
    });

  return paras;
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
    if (section.content) {
      paras.push(new Paragraph({ children: [new TextRun({ text: section.content, size: sizes.base })] }));
    }
  } else if (section.kind === 'tags') {
    if (section.tags?.length) {
      paras.push(
        new Paragraph({ children: [new TextRun({ text: section.tags.join('   •   '), size: sizes.base })] })
      );
    }
  } else if (section.kind === 'entries') {
    (section.entries || [])
      .filter((e) => e.heading || e.subheading || e.description || e.location || e.start || e.end)
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

  sections.forEach((section) => children.push(...sectionParagraphs(section, dateFormat, sizes)));

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