import { useState } from 'react';
import { TEMPLATE_COMPONENTS } from './templates';
import PreviewModal from './PreviewModal';

export default function ResumePreview({ resume, paperRef }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const Template = TEMPLATE_COMPONENTS[resume.templateId] || TEMPLATE_COMPONENTS.onecolumn;

  return (
    <div className="preview-panel">
      <button
        type="button"
        className="preview-panel-trigger"
        ref={paperRef}
        onClick={() => setPreviewOpen(true)}
        aria-label="Preview full resume"
      >
        <Template resume={resume} accentColor={resume.accentColor} />
      </button>

      {previewOpen && (
        <PreviewModal
          mode="live"
          Template={Template}
          resume={resume}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}