import { IconMail, IconPhone, IconPin } from './icons';

function PreviewText({ section }) {
  return (
    <section className="preview-section">
      <h3>{section.title}</h3>
      <p className={section.content ? '' : 'placeholder'}>
        {section.content || `Add your ${section.title.toLowerCase()}...`}
      </p>
    </section>
  );
}

function PreviewTags({ section }) {
  return (
    <section className="preview-section">
      <h3>{section.title}</h3>
      {section.tags.length > 0 ? (
        <p className="preview-tags">{section.tags.join('  •  ')}</p>
      ) : (
        <p className="placeholder">Add your {section.title.toLowerCase()}...</p>
      )}
    </section>
  );
}

function PreviewEntries({ section }) {
  const entries = section.entries.filter(
    (e) => e.heading || e.subheading || e.description || e.location || e.start || e.end
  );

  return (
    <section className="preview-section">
      <h3>{section.title}</h3>
      {entries.length === 0 && (
        <p className="placeholder">Add your {section.title.toLowerCase()}...</p>
      )}
      {entries.map((entry) => (
        <div className="preview-entry" key={entry.id}>
          <div className="preview-entry-top">
            <span className="preview-entry-heading">{entry.heading}</span>
            <span className="preview-entry-date">
              {[entry.start, entry.end].filter(Boolean).join(' – ')}
            </span>
          </div>
          <div className="preview-entry-sub">
            {[entry.subheading, entry.location].filter(Boolean).join(' · ')}
          </div>
          {entry.description && (
            <ul className="preview-entry-bullets">
              {entry.description
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

export default function ResumePreview({ resume }) {
  const { basics, sections } = resume;
  const hasContact = basics.email || basics.phone || basics.address;

  return (
    <div className="preview-panel">
      <div className="paper">
        <header className="preview-header">
          {basics.photo && (
            <img className="preview-photo" src={basics.photo} alt={basics.name || 'Profile'} />
          )}
          <h1>{basics.name || 'Your name'}</h1>
          {hasContact && (
            <div className="preview-contact">
              {basics.email && (
                <span>
                  <IconMail size={13} /> {basics.email}
                </span>
              )}
              {basics.phone && (
                <span>
                  <IconPhone size={13} /> {basics.phone}
                </span>
              )}
              {basics.address && (
                <span>
                  <IconPin size={13} /> {basics.address}
                </span>
              )}
            </div>
          )}
        </header>

        {sections.map((section) => {
          if (section.kind === 'text') return <PreviewText key={section.id} section={section} />;
          if (section.kind === 'tags') return <PreviewTags key={section.id} section={section} />;
          if (section.kind === 'entries')
            return <PreviewEntries key={section.id} section={section} />;
          return null;
        })}

        {sections.length === 0 && (
          <p className="preview-empty">
            Click <strong>Add Content</strong> on the left to start building your resume.
          </p>
        )}
      </div>
    </div>
  );
}
