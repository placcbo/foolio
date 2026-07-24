import { useState, useRef, useEffect } from 'react';
import { TEMPLATE_COMPONENTS } from './templates';
import { SAMPLE_RESUME } from '../data/sampleResume';
import { TEMPLATE_SAMPLES } from '../data/templateSamples';
import { initialResumeState, TEMPLATE_DEFAULT_LAYOUT } from '../state/resumeReducer';
import { applyPresetToSettings } from '../utils/templatePreset';
import PreviewModal from './PreviewModal';

// Width-fit for the 300px card (300 / 794). The card's CSS aspect ratio is
// shorter than a full A4, so the page's bottom crops — thumbnails read as a
// design preview, not an endless miniature document.
const SCALE = 0.378;

export default function TemplateCard({ template, onSelect, onOpen }) {
  const [color, setColor] = useState(template.swatches[0]);
  const [previewOpen, setPreviewOpen] = useState(false);
  // Clicking the card opens the full-page detail view when available; the modal
  // remains as a fallback so the card still works if no handler is wired.
  const open = () => (onOpen ? onOpen(template, color) : setPreviewOpen(true));
  const Template = TEMPLATE_COMPONENTS[template.layout];
  const sample = TEMPLATE_SAMPLES[template.id] || SAMPLE_RESUME;
  const baseLayout = TEMPLATE_DEFAULT_LAYOUT[template.layout];
  const settings = applyPresetToSettings(initialResumeState.settings, template.preset, baseLayout);
  const previewResume = { ...sample, templateId: template.layout, accentColor: color, settings };

  // How far the preview must travel to reveal the rest of the CV on hover.
  // Measured per card (templates vary in length) so the scroll ends exactly at
  // the page bottom rather than guessing a percentage.
  const previewRef = useRef(null);
  const scaleRef = useRef(null);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const preview = previewRef.current;
    const scale = scaleRef.current;
    if (!preview || !scale) return undefined;
    const measure = () => {
      const overflow = scale.getBoundingClientRect().height - preview.getBoundingClientRect().height;
      setScroll(overflow > 12 ? Math.round(overflow) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scale);
    ro.observe(preview);
    return () => ro.disconnect();
  }, []);

  // Constant reveal speed (~55px/s), clamped so it never crawls or races.
  const dur = scroll ? Math.min(9, Math.max(2.5, scroll / 55)) : 0;

  return (
    <div className="template-card">
      <div
        ref={previewRef}
        className="template-card-preview"
        role="button"
        tabIndex={0}
        style={{ '--card-scroll': `${scroll}px`, '--card-scroll-dur': `${dur}s` }}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
          }
        }}
      >
        <div ref={scaleRef} className="template-card-scale" style={{ zoom: SCALE }}>
          <Template resume={previewResume} accentColor={color} />
        </div>
        <div className="template-card-overlay">
          <span>Preview template</span>
        </div>
      </div>

      <div className="template-card-footer">
        <span className="template-card-name">{template.name}</span>
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
            // `resume.templateId` drives which layout component renders the
            // resume (see TEMPLATE_COMPONENTS), so it must be the layout id,
            // not this card's own unique id — several template cards can
            // legitimately share one layout with different presets.
            onSelect(template.layout, color, template.preset);
          }}
        />
      )}
    </div>
  );
}