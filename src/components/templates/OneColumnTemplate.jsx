import { getContactItems } from './shared';

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

export default function OneColumnTemplate({ resume }) {
  const { basics, sections } = resume;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper onecolumn-paper">
      <header className="preview-header">
        {basics.photo && (
          <img className="preview-photo" src={basics.photo} alt={basics.name || 'Profile'} />
        )}
        <h1>{basics.name || 'Your name'}</h1>
        {basics.title && <p className="preview-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="preview-contact">
            {contactItems.map(({ key, Icon, text }) => (
              <span key={key}>
                <Icon size={13} /> {text}
              </span>
            ))}
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
  );
}