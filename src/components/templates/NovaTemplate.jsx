import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// NovaTemplate — self-contained, like SimpleTemplate/ClassicTemplate.
//
// A minimal editorial look: a slim accent spine runs down the left edge of
// the page, the job title reads as a small pill badge instead of plain
// colored text, and each section is numbered (01, 02, 03…) the way a
// magazine contents page would number its stories. Still a single flowing
// column with no sidebar — this is a "simple" template with one distinct
// hook, not a different layout family. Owns its entire look; reads only
// content + accentColor, never resume.settings. CSS lives in .nova-*.
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
    return <p className="nova-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <div className="nova-chips">
        {flat.map((tag, i) => (
          <span className="nova-chip" key={`${tag}-${i}`}>{tag}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="nova-skill-groups">
      {groups.map((g) => (
        <div className="nova-skill-row" key={g.id}>
          <span className="nova-skill-label">{g.label && g.label.trim() ? `${g.label.trim()}:` : ''}</span>
          <span className="nova-skill-values">{g.tags.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ index, title }) {
  return (
    <div className="nova-heading-row">
      <span className="nova-heading-index">{String(index + 1).padStart(2, '0')}</span>
      <h2 className="nova-heading">{title}</h2>
    </div>
  );
}

export default function NovaTemplate({ resume, accentColor = '#e0263f' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper nova-template" style={{ '--nova-accent': accentColor }}>
      <div className="nova-spine" aria-hidden="true" />
      <div className="nova-body">
        <header className="nova-header">
          <h1 className="nova-name">{basics.name || 'Your name'}</h1>
          {basics.title && <span className="nova-title-badge">{basics.title}</span>}
          {contactItems.length > 0 && (
            <div className="nova-contact-row">
              {contactItems.map((item, i) => (
                <span className="nova-contact-item" key={item.key}>
                  {i > 0 && <span className="nova-contact-sep" aria-hidden="true" />}
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
                </span>
              ))}
            </div>
          )}
        </header>

        {sections.map((section, index) => (
          <section className="nova-section" key={section.id}>
            <SectionHeading index={index} title={section.title} />

            {section.kind === 'text' && (
              isHtmlEmpty(section.content) ? (
                <p className="nova-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                <div className="nova-text" dangerouslySetInnerHTML={{ __html: section.content }} />
              )
            )}

            {section.kind === 'tags' && <TagsBlock section={section} />}

            {section.kind === 'entries' && (
              section.entries.filter(
                (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
              ).length === 0 ? (
                <p className="nova-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                section.entries
                  .filter((e) => !e.hidden)
                  .map((entry) => {
                    const { start, end } = formatEntryDateRange(entry, dateFormat);
                    const dateRange = [start, end].filter(Boolean).join(' – ');
                    return (
                      <div className="nova-entry" key={entry.id}>
                        <div className="nova-entry-row">
                          <span className="nova-entry-heading">
                            <span className="nova-entry-marker" aria-hidden="true" />
                            {entry.link ? (
                              <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                                {entry.heading}
                              </a>
                            ) : (
                              entry.heading
                            )}
                          </span>
                          {dateRange && <span className="nova-entry-date">{dateRange}</span>}
                        </div>
                        {(entry.subheading || entry.location) && (
                          <div className="nova-entry-sub">
                            {[entry.subheading, entry.location].filter(Boolean).join(' – ')}
                          </div>
                        )}
                        {!isHtmlEmpty(entry.description) && (
                          <div className="nova-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
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
    </div>
  );
}
