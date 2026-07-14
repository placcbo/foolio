import { useState, useRef, useEffect } from 'react';
import { IconDownload, IconFileText } from './icons';
import { downloadResumeAsPdf, exportResumeAsDocx } from '../utils/resumeExport';

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

  async function handlePdf() {
    setOpen(false);
    setExporting(true);
    try {
      const container = paperRef?.current;
      const paperEl = container?.classList?.contains('paper')
        ? container
        : container?.querySelector?.('.paper');
      await downloadResumeAsPdf(paperEl, fileBaseName(), resume.settings?.pageFormat);
    } catch (e) {
      console.error(e);
      alert("Couldn't generate the PDF. Please try again.");
    } finally {
      setExporting(false);
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
              <span className="download-menu-item-sub">Downloads immediately</span>
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