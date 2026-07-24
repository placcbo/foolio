import { useEffect, useRef, useState } from 'react';
import { TEMPLATE_COMPONENTS } from './templates';
import { SAMPLE_RESUME } from '../data/sampleResume';
import { TEMPLATE_SAMPLES } from '../data/templateSamples';
import { initialResumeState, TEMPLATE_DEFAULT_LAYOUT } from '../state/resumeReducer';
import { applyPresetToSettings } from '../utils/templatePreset';
import { IconCheck } from './icons';

const PAPER_WIDTH = 794;

// Honest value props only — no fabricated review counts or user numbers.
const PROOF = ['No watermarks', 'No hidden fees', 'ATS-friendly', 'PDF & DOCX export'];
const BULLETS = [
  'Add your experience in minutes',
  'Recolor and switch layout anytime',
  'Download unlimited PDF & DOCX files',
];

// Full-page template detail (reached by clicking a template). Shows a large live
// preview beside a panel to start with this design or browse the rest — a beat
// between "that looks nice" and committing to the editor.
export default function TemplateDetail({ template, initialColor, onUse, onShowAll, onHome }) {
  const [color, setColor] = useState(initialColor || template.swatches[0]);
  const columnRef = useRef(null);
  const [scale, setScale] = useState(0.6);

  const Template = TEMPLATE_COMPONENTS[template.layout];
  const sample = TEMPLATE_SAMPLES[template.id] || SAMPLE_RESUME;
  const baseLayout = TEMPLATE_DEFAULT_LAYOUT[template.layout];
  const settings = applyPresetToSettings(initialResumeState.settings, template.preset, baseLayout);
  const previewResume = { ...sample, templateId: template.layout, accentColor: color, settings };

  useEffect(() => {
    const el = columnRef.current;
    if (!el) return undefined;
    const update = () => {
      const available = el.clientWidth - 32;
      setScale(Math.min(1, Math.max(0.3, available / PAPER_WIDTH)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="tdetail-page">
      <div className="tdetail" style={{ '--tdetail-accent': color }}>
        <div className="tdetail-preview-col" ref={columnRef}>
          <div className="tdetail-paper" style={{ zoom: scale }}>
            <Template resume={previewResume} accentColor={color} />
          </div>
        </div>

        <div className="tdetail-info">
        <nav className="tdetail-crumbs" aria-label="Breadcrumb">
          <button type="button" onClick={onHome}>Home</button>
          <span aria-hidden="true">›</span>
          <button type="button" onClick={onShowAll}>Resume templates</button>
          <span aria-hidden="true">›</span>
          <span className="tdetail-crumb-current">{template.name}</span>
        </nav>

        <h1 className="tdetail-title">
          <span className="tdetail-title-name">{template.name}</span> resume template
        </h1>

        <p className="tdetail-lead">
          Build a polished, ATS-friendly resume with our free online builder. Start with this design,
          or browse the rest — you can switch or recolor at any time.
        </p>

        <ul className="tdetail-bullets">
          {BULLETS.map((b) => (
            <li key={b}>
              <span className="tdetail-bullet-icon" aria-hidden="true"><IconCheck size={12} /></span>
              {b}
            </li>
          ))}
        </ul>

        {template.swatches.length > 1 && (
          <div className="tdetail-swatches" role="group" aria-label="Accent color">
            {template.swatches.map((sw) => (
              <button
                key={sw}
                type="button"
                className={`tdetail-swatch${sw === color ? ' active' : ''}`}
                style={{ background: sw }}
                onClick={() => setColor(sw)}
                aria-label={`Accent ${sw}`}
                aria-pressed={sw === color}
              />
            ))}
          </div>
        )}

        <div className="tdetail-actions">
          <button
            type="button"
            className="tdetail-use"
            onClick={() => onUse(template.layout, color, template.preset)}
          >
            Use this template
          </button>
          <button type="button" className="tdetail-showall" onClick={onShowAll}>
            Show all templates
          </button>
        </div>

        <ul className="tdetail-proof">
          {PROOF.map((p) => (
            <li key={p}>
              <IconCheck size={13} />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
