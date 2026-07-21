import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// ChronicleTemplate — self-contained, like SimpleTemplate/NovaTemplate/etc.
//
// A formal, letterpress-editorial look: a centered serif header carries the
// name and an icon-led contact row, and every section heading is left-
// aligned, bold, and sits on top of a thick full-width rule — like a
// newspaper section divider. Modeled on a reference resume the user shared.
// Owns its entire look; reads only content + accentColor, never
// resume.settings. CSS lives in .chronicle-*.
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
    return <p className="chronicle-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return <p className="chronicle-tags">{flat.join('  •  ')}</p>;
  }

  return (
    <div className="chronicle-skill-groups">
      {groups.map((g) => (
        <div className="chronicle-skill-row" key={g.id}>
          <span className="chronicle-skill-label">{g.label && g.label.trim() ? g.label.trim() : ''}</span>
          <span className="chronicle-skill-values">{g.tags.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="chronicle-heading-wrap">
      <h2 className="chronicle-heading">{title}</h2>
    </div>
  );
}

export default function ChronicleTemplate({ resume, accentColor = '#1a1a1c' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper chronicle-template" style={{ '--chronicle-accent': accentColor }}>
      <header className="chronicle-header">
        <h1 className="chronicle-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="chronicle-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="chronicle-contact-row">
            {contactItems.map(({ key, Icon, text, href }) => (
              <span className="chronicle-contact-item" key={key}>
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

      {sections.map((section) => (
        <section className="chronicle-section" key={section.id}>
          <SectionHeading title={section.title} />

          {section.kind === 'text' && (
            isHtmlEmpty(section.content) ? (
              <p className="chronicle-placeholder">Add your {section.title.toLowerCase()}…</p>
            ) : (
              <div className="chronicle-text" dangerouslySetInnerHTML={{ __html: section.content }} />
            )
          )}

          {section.kind === 'tags' && <TagsBlock section={section} />}

          {section.kind === 'entries' && (
            section.entries.filter(
              (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
            ).length === 0 ? (
              <p className="chronicle-placeholder">Add your {section.title.toLowerCase()}…</p>
            ) : (
              section.entries
                .filter((e) => !e.hidden)
                .map((entry) => {
                  const { start, end } = formatEntryDateRange(entry, dateFormat);
                  const dateRange = [start, end].filter(Boolean).join(' – ');
                  return (
                    <div className="chronicle-entry" key={entry.id}>
                      <div className="chronicle-entry-row">
                        <span className="chronicle-entry-heading">
                          {entry.link ? (
                            <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                              {entry.heading}
                            </a>
                          ) : (
                            entry.heading
                          )}
                        </span>
                        {dateRange && <span className="chronicle-entry-date">{dateRange}</span>}
                      </div>
                      {(entry.subheading || entry.location) && (
                        <div className="chronicle-entry-sub">
                          {[entry.subheading, entry.location].filter(Boolean).join(' – ')}
                        </div>
                      )}
                      {!isHtmlEmpty(entry.description) && (
                        <div className="chronicle-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
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
