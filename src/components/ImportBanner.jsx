import { useState } from 'react';
import { IconCheck, IconInfo, IconX } from './icons';

// Post-import banner. Honest about the parse ("N fields need a quick check"),
// lists the low-confidence fields to review, and offers an "Original text"
// drawer so nothing feels lost — the user can copy anything the parser missed.
// Rendered only while resume._import is set; dismissing clears it.
export default function ImportBanner({ meta, dispatch }) {
  const [showFields, setShowFields] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  if (!meta) return null;

  const pct = Math.round((meta.overallConfidence || 0) * 100);
  const n = meta.flagCount || 0;

  return (
    <div className="import-banner" role="status">
      <div className="import-banner-head">
        <IconCheck size={16} />
        <div className="import-banner-title">
          <strong>Imported.</strong>{' '}
          {n > 0
            ? `${n} field${n === 1 ? '' : 's'} need a quick check.`
            : 'Everything looks good — give it a once-over.'}
          <span className="import-banner-conf"> · {pct}% confidence</span>
        </div>
        <button
          type="button"
          className="import-banner-dismiss"
          aria-label="Dismiss import notice"
          onClick={() => dispatch({ type: 'DISMISS_IMPORT' })}
        >
          <IconX size={16} />
        </button>
      </div>

      <div className="import-banner-actions">
        {n > 0 && (
          <button type="button" className="import-banner-link" onClick={() => setShowFields((v) => !v)}>
            {showFields ? 'Hide' : 'Review'} flagged fields
          </button>
        )}
        {meta.rawText && (
          <button type="button" className="import-banner-link" onClick={() => setShowRaw((v) => !v)}>
            {showRaw ? 'Hide' : 'Show'} original text
          </button>
        )}
      </div>

      {showFields && n > 0 && (
        <ul className="import-banner-fields">
          {meta.flags.map((f) => (
            <li key={f.path}>
              <IconInfo size={13} />
              <span>{f.label}</span>
              <span className="import-banner-conf-chip">{Math.round(f.confidence * 100)}%</span>
            </li>
          ))}
        </ul>
      )}

      {showRaw && meta.rawText && (
        <pre className="import-banner-raw">{meta.rawText}</pre>
      )}
    </div>
  );
}
