import { useState, useRef, useEffect } from 'react';
import { IconDownload, IconFileText } from './icons';
import { printResumeAsPdf, exportResumeAsDocx } from '../utils/resumeExport';
import { exportSimpleTemplatePdf } from '../utils/simplePdf';
import { exportClassicTemplatePdf } from '../utils/classicPdf';
import { exportSlateTemplatePdf } from '../utils/slatePdf';
import { exportBloomTemplatePdf } from '../utils/bloomPdf';
import { exportPortraitTemplatePdf } from '../utils/portraitPdf';
import { exportMeridianTemplatePdf } from '../utils/meridianPdf';
import { exportNovaTemplatePdf } from '../utils/novaPdf';
import { exportCodexTemplatePdf } from '../utils/codexPdf';
import { exportLedgerTemplatePdf } from '../utils/ledgerPdf';

export default function DownloadMenu({ resume, paperRef, className = 'btn-download' }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function fileBaseName() {
    return (resume.basics?.name || 'resume').trim().replace(/\s+/g, '_') || 'resume';
  }

  function handlePdf() {
    setOpen(false);
    try {
      // Templates with a dedicated exporter (currently Simple) draw their
      // exact fixed design straight into the PDF from resume data —
      // instant download, real selectable text, nothing rendered from the
      // DOM at all. Everything else falls back to the native print path.
      const exporters = {
        simple: exportSimpleTemplatePdf,
        classic: exportClassicTemplatePdf,
        slate: exportSlateTemplatePdf,
        bloom: exportBloomTemplatePdf,
        portrait: exportPortraitTemplatePdf,
        meridian: exportMeridianTemplatePdf,
        nova: exportNovaTemplatePdf,
        codex: exportCodexTemplatePdf,
        ledger: exportLedgerTemplatePdf,
      };
      const dedicated = exporters[resume.templateId];
      if (dedicated) {
        dedicated(resume, fileBaseName());
        return;
      }
      const container = paperRef?.current;
      const paperEl = container?.classList?.contains('paper')
        ? container
        : container?.querySelector?.('.paper');
      printResumeAsPdf(paperEl, resume.settings?.pageFormat);
    } catch (e) {
      console.error(e);
      alert("Couldn't export the PDF. Please try again.");
    }
  }

  async function handleDocx() {
    setOpen(false);
    setExporting(true);
    try {
      await exportResumeAsDocx(resume);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="download-menu" ref={ref}>
      <button type="button" className={className} onClick={() => setOpen((v) => !v)}>
        {exporting ? 'Preparing…' : 'Download'}
        {!exporting && <IconDownload size={16} />}
      </button>

      {open && (
        <div className="download-menu-dropdown">
          <button type="button" className="download-menu-item" onClick={handlePdf}>
            <IconFileText size={16} />
            <div>
              <span className="download-menu-item-title">Download as PDF</span>
              <span className="download-menu-item-sub">Selectable text, ready to send</span>
            </div>
          </button>
          <button type="button" className="download-menu-item" onClick={handleDocx}>
            <IconFileText size={16} />
            <div>
              <span className="download-menu-item-title">Download as DOCX</span>
              <span className="download-menu-item-sub">Editable Word document</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}