import { useState } from 'react';
import { TEMPLATE_COMPONENTS } from './templates';
import { SAMPLE_RESUME } from '../data/sampleResume';
import PreviewModal from './PreviewModal';

const SCALE = 0.34;

export default function TemplateCard({ template, onSelect }) {
  const [color, setColor] = useState(template.swatches[0]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const Template = TEMPLATE_COMPONENTS[template.layout];
  const previewResume = { ...SAMPLE_RESUME, templateId: template.layout, accentColor: color };

  return (
    <div className="template-card">
      <div
        className="template-card-preview"
        role="button"
        tabIndex={0}
        onClick={() => setPreviewOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setPreviewOpen(true);
        }}
      >
        <div className="template-card-scale" style={{ transform: `scale(${SCALE})` }}>
          <Template resume={previewResume} accentColor={color} />
        </div>
        <div className="template-card-overlay">
          <span>Preview template</span>
        </div>
      </div>

      <div className="template-card-footer">
        <div className="swatch-row">
          {template.swatches.map((sw) => (
            <button
              key={sw}
              type="button"
              className={`swatch${sw === color ? ' active' : ''}`}
              style={{ background: sw }}
              onClick={() => setColor(sw)}
              aria-label={`Color ${sw}`}
            />
          ))}
        </div>
        <div className="format-badges">
          <span className="format-badge">PDF</span>
          <span className="format-badge">DOCX</span>
        </div>
      </div>

      {previewOpen && (
        <PreviewModal
          mode="template"
          Template={Template}
          resume={previewResume}
          name={template.name}
          onClose={() => setPreviewOpen(false)}
          onUseTemplate={() => {
            setPreviewOpen(false);
            onSelect(template.id, color);
          }}
        />
      )}
    </div>
  );
}