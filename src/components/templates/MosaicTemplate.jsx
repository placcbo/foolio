import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// MosaicTemplate — self-contained, like SimpleTemplate/NovaTemplate/etc.
//
// A card-grid "dashboard" look: every section renders as its own bordered
// card with a thin accent stripe across the top, laid out in a two-column
// CSS grid. Text and entries sections span the full width; tags sections
// (skills, languages, interests…) stay half-width, so a resume with both
// Skills and Languages gets them sitting side by side as two tiles instead
// of one long stacked column — the one visual hook none of the other
// templates use. Owns its entire look; reads only content + accentColor,
// never resume.settings. CSS lives in .mosaic-*.
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
    return <p className="mosaic-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <div className="mosaic-chips">
        {flat.map((tag, i) => (
          <span className="mosaic-chip" key={`${tag}-${i}`}>{tag}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="mosaic-skill-groups">
      {groups.map((g) => (
        <div className="mosaic-skill-group" key={g.id}>
          {g.label && g.label.trim() && <span className="mosaic-skill-group-label">{g.label.trim()}</span>}
          <div className="mosaic-chips">
            {g.tags.map((tag, i) => (
              <span className="mosaic-chip" key={`${tag}-${i}`}>{tag}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MosaicTemplate({ resume, accentColor = '#5b4bb5' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper mosaic-template" style={{ '--mosaic-accent': accentColor }}>
      <header className="mosaic-header">
        <h1 className="mosaic-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="mosaic-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="mosaic-contact-row">
            {contactItems.map(({ key, Icon, text, href }) => (
              <span className="mosaic-contact-item" key={key}>
                <Icon size={12} />
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

      <div className="mosaic-grid">
        {sections.map((section) => (
          <section
            className={`mosaic-card${section.kind !== 'tags' ? ' mosaic-card-full' : ''}`}
            key={section.id}
          >
            <h2 className="mosaic-card-heading">{section.title}</h2>

            {section.kind === 'text' && (
              isHtmlEmpty(section.content) ? (
                <p className="mosaic-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                <div className="mosaic-text" dangerouslySetInnerHTML={{ __html: section.content }} />
              )
            )}

            {section.kind === 'tags' && <TagsBlock section={section} />}

            {section.kind === 'entries' && (
              section.entries.filter(
                (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
              ).length === 0 ? (
                <p className="mosaic-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                section.entries
                  .filter((e) => !e.hidden)
                  .map((entry) => {
                    const { start, end } = formatEntryDateRange(entry, dateFormat);
                    const dateRange = [start, end].filter(Boolean).join(' – ');
                    return (
                      <div className="mosaic-entry" key={entry.id}>
                        <div className="mosaic-entry-row">
                          <span className="mosaic-entry-heading">
                            {entry.link ? (
                              <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                                {entry.heading}
                              </a>
                            ) : (
                              entry.heading
                            )}
                          </span>
                          {dateRange && <span className="mosaic-entry-date">{dateRange}</span>}
                        </div>
                        {(entry.subheading || entry.location) && (
                          <div className="mosaic-entry-sub">
                            {[entry.subheading, entry.location].filter(Boolean).join(' – ')}
                          </div>
                        )}
                        {!isHtmlEmpty(entry.description) && (
                          <div className="mosaic-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
                        )}
                      </div>
                    );
                  })
              )
            )}
          </section>
        ))}
      </div>

      {sections.length === 0 && (
        <p className="preview-empty">
          Click <strong>Add Content</strong> on the left to start building your resume.
        </p>
      )}
    </div>
  );
}
