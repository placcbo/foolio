import { getContactItems } from './shared';

function CleanHeading({ children }) {
  return <h4 className="clean-heading">{children}</h4>;
}

function CleanText({ section }) {
  return (
    <section className="clean-section">
      <CleanHeading>{section.title}</CleanHeading>
      <p className={section.content ? 'clean-text' : 'clean-text placeholder'}>
        {section.content || `Add your ${section.title.toLowerCase()}...`}
      </p>
    </section>
  );
}

function CleanTagsGrid({ section }) {
  return (
    <section className="clean-section">
      <CleanHeading>{section.title}</CleanHeading>
      {section.tags.length > 0 ? (
        <ul className="clean-tags-grid">
          {section.tags.map((tag, i) => (
            <li key={i}>{tag}</li>
          ))}
        </ul>
      ) : (
        <p className="clean-text placeholder">Add your {section.title.toLowerCase()}...</p>
      )}
    </section>
  );
}

function CleanEntries({ section }) {
  const entries = section.entries.filter(
    (e) => e.heading || e.subheading || e.description || e.location || e.start || e.end
  );

  return (
    <section className="clean-section">
      <CleanHeading>{section.title}</CleanHeading>
      {entries.length === 0 && (
        <p className="clean-text placeholder">Add your {section.title.toLowerCase()}...</p>
      )}
      {entries.map((entry) => (
        <div className="clean-entry" key={entry.id}>
          <div className="clean-entry-top">
            <span className="clean-entry-heading">{entry.heading}</span>
            <span className="clean-entry-date">
              {[entry.start, entry.end].filter(Boolean).join(' – ')}
            </span>
          </div>
          <div className="clean-entry-sub">
            <span>{entry.subheading}</span>
            <span>{entry.location}</span>
          </div>
          {entry.description && (
            <ul className="clean-entry-bullets">
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

export default function CleanTemplate({ resume }) {
  const { basics, sections } = resume;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper clean-paper">
      <header className="clean-header">
        <h1 className="clean-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="clean-role">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="clean-contact">
            {contactItems.map(({ key, Icon, text }) => (
              <span key={key}>
                <Icon size={13} /> {text}
              </span>
            ))}
          </div>
        )}
      </header>

      {sections.map((section) => {
        if (section.kind === 'text') return <CleanText key={section.id} section={section} />;
        if (section.kind === 'tags') return <CleanTagsGrid key={section.id} section={section} />;
        if (section.kind === 'entries') return <CleanEntries key={section.id} section={section} />;
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