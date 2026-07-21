import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// CloverTemplate — self-contained, like SimpleTemplate/NovaTemplate/etc.
//
// Plain and minimal — no banner, no sidebar, no frame — but with two things
// none of the other plain single-column templates have: a real icon next
// to each contact item, laid out as a two-column grid rather than an
// inline row, and the name/headings carried in the accent color instead of
// staying neutral ink. Modeled on a reference resume the user shared. Owns
// its entire look; reads only content + accentColor, never resume.settings.
// CSS lives in .clover-*.
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
    return <p className="clover-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return <p className="clover-tags">{flat.join(', ')}</p>;
  }

  return (
    <div className="clover-skill-groups">
      {groups.map((g) => (
        <div className="clover-skill-row" key={g.id}>
          <span className="clover-skill-label">{g.label && g.label.trim() ? g.label.trim() : ''}</span>
          <span className="clover-skill-values">{g.tags.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="clover-heading-wrap">
      <h2 className="clover-heading">{title}</h2>
      <span className="clover-heading-bar" aria-hidden="true" />
    </div>
  );
}

export default function CloverTemplate({ resume, accentColor = '#15803d' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper clover-template" style={{ '--clover-accent': accentColor }}>
      <header className="clover-header">
        <h1 className="clover-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="clover-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="clover-contact-grid">
            {contactItems.map(({ key, Icon, text, href }) => (
              <span className="clover-contact-item" key={key}>
                <Icon size={13} />
                {href ? (
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                    {text}
                  </a>
                ) : (
                  <span>{text}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="clover-body">
        {sections.map((section) => (
          <section className="clover-section" key={section.id}>
            <SectionHeading title={section.title} />

            {section.kind === 'text' && (
              isHtmlEmpty(section.content) ? (
                <p className="clover-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                <div className="clover-text" dangerouslySetInnerHTML={{ __html: section.content }} />
              )
            )}

            {section.kind === 'tags' && <TagsBlock section={section} />}

            {section.kind === 'entries' && (
              section.entries.filter(
                (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
              ).length === 0 ? (
                <p className="clover-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                section.entries
                  .filter((e) => !e.hidden)
                  .map((entry) => {
                    const { start, end } = formatEntryDateRange(entry, dateFormat);
                    const dateRange = [start, end].filter(Boolean).join(' – ');
                    return (
                      <div className="clover-entry" key={entry.id}>
                        <div className="clover-entry-row">
                          <span className="clover-entry-heading">
                            {entry.link ? (
                              <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                                {entry.heading}
                              </a>
                            ) : (
                              entry.heading
                            )}
                          </span>
                          {dateRange && <span className="clover-entry-date">{dateRange}</span>}
                        </div>
                        {(entry.subheading || entry.location) && (
                          <div className="clover-entry-sub">
                            {[entry.subheading, entry.location].filter(Boolean).join(' – ')}
                          </div>
                        )}
                        {!isHtmlEmpty(entry.description) && (
                          <div className="clover-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
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
