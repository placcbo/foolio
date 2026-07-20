import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// ClassicTemplate — self-contained, like SimpleTemplate.
//
// A timeless serif design: centered header, Times/Georgia throughout,
// small-caps section headings in the accent color, italic subheadings.
// Owns its entire look; reads only content + accentColor, never
// resume.settings. Its CSS lives in the .classic-* namespace.
// ---------------------------------------------------------------------------

function normalizeUrl(link) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

function TagsBlock({ section }) {
  const groups = (section.groups?.length
    ? section.groups
    : [{ id: 'flat', label: '', tags: section.tags || [] }]
  ).filter((g) => (g.tags || []).length > 0);
  const flat = groups.flatMap((g) => g.tags);

  if (!flat.length) {
    return <p className="classic-placeholder">Add your {section.title.toLowerCase()}\u2026</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <p className="classic-tags">
        {flat.map((tag, i) => (
          <span key={`${tag}-${i}`}>
            {i > 0 && <span className="classic-dot" aria-hidden="true">{'\u2022'}</span>}
            {tag}
          </span>
        ))}
      </p>
    );
  }

  return (
    <div className="classic-skill-groups">
      {groups.map((g) => (
        <div className="classic-skill-row" key={g.id}>
          <span className="classic-skill-label">{g.label && g.label.trim() ? `${g.label.trim()}:` : ''}</span>
          <span className="classic-skill-values">{g.tags.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

export default function ClassicTemplate({ resume, accentColor = '#1f3a5f' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper classic-template" style={{ '--classic-accent': accentColor }}>
      <header className="classic-header">
        <h1 className="classic-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="classic-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <p className="classic-contact-row">
            {contactItems.map((item, i) => (
              <span key={item.key}>
                {i > 0 && <span className="classic-dot" aria-hidden="true">{'\u2022'}</span>}
                {item.href ? (
                  <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                    {item.text}
                  </a>
                ) : (
                  item.text
                )}
              </span>
            ))}
          </p>
        )}
      </header>

      {sections.map((section) => (
        <section className="classic-section" key={section.id}>
          <h2 className="classic-heading">{section.title}</h2>

          {section.kind === 'text' && (
            isHtmlEmpty(section.content) ? (
              <p className="classic-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
            ) : (
              <div className="classic-text" dangerouslySetInnerHTML={{ __html: section.content }} />
            )
          )}

          {section.kind === 'tags' && <TagsBlock section={section} />}

          {section.kind === 'entries' && (
            section.entries.filter(
              (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
            ).length === 0 ? (
              <p className="classic-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
            ) : (
              section.entries
                .filter((e) => !e.hidden)
                .map((entry) => {
                  const { start, end } = formatEntryDateRange(entry, dateFormat);
                  const dateRange = [start, end].filter(Boolean).join(' \u2013 ');
                  return (
                    <div className="classic-entry" key={entry.id}>
                      <div className="classic-entry-row">
                        <span className="classic-entry-heading">
                          {entry.link ? (
                            <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                              {entry.heading}
                            </a>
                          ) : (
                            entry.heading
                          )}
                        </span>
                        {dateRange && <span className="classic-entry-date">{dateRange}</span>}
                      </div>
                      {(entry.subheading || entry.location) && (
                        <div className="classic-entry-sub">
                          {[entry.subheading, entry.location].filter(Boolean).join(' \u2013 ')}
                        </div>
                      )}
                      {!isHtmlEmpty(entry.description) && (
                        <div className="classic-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
                      )}
                    </div>
                  );
                })
            )
          )}
        </section>
      ))}

      {sections.length === 0 && (
        <p className="preview-empty">
          Click <strong>Add Content</strong> on the left to start building your resume.
        </p>
      )}
    </div>
  );
}