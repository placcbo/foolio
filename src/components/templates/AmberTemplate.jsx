import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';
import { getSectionMeta } from '../../data/sectionTypes';

// ---------------------------------------------------------------------------
// AmberTemplate — self-contained, like SimpleTemplate/NovaTemplate/etc.
//
// A full-width dark charcoal banner carries the name (in the accent color)
// and an icon-led contact row; below it, every section heading gets a small
// dark badge holding that section's icon plus a short accent underline —
// the one visual hook none of the other templates use. Modeled on a
// reference resume the user shared. Owns its entire look; reads only
// content + accentColor, never resume.settings. CSS lives in .amber-*.
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
    return <p className="amber-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <div className="amber-chips">
        {flat.map((tag, i) => (
          <span className="amber-chip" key={`${tag}-${i}`}>{tag}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="amber-skill-groups">
      {groups.map((g) => (
        <div className="amber-skill-row" key={g.id}>
          <span className="amber-skill-label">{g.label && g.label.trim() ? g.label.trim() : ''}</span>
          <span className="amber-skill-values">{g.tags.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ type, title }) {
  const meta = getSectionMeta(type);
  return (
    <div className="amber-heading-row">
      <span className="amber-heading-badge" aria-hidden="true">{meta ? meta.icon : '\u{1F4C4}'}</span>
      <div className="amber-heading-col">
        <h2 className="amber-heading">{title}</h2>
        <span className="amber-heading-bar" />
      </div>
    </div>
  );
}

export default function AmberTemplate({ resume, accentColor = '#eab308' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper amber-template" style={{ '--amber-accent': accentColor }}>
      <header className="amber-header">
        <h1 className="amber-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="amber-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="amber-contact-row">
            {contactItems.map(({ key, Icon, text, href }) => (
              <span className="amber-contact-item" key={key}>
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

      <div className="amber-body">
        {sections.map((section) => (
          <section className="amber-section" key={section.id}>
            <SectionHeading type={section.type} title={section.title} />

            {section.kind === 'text' && (
              isHtmlEmpty(section.content) ? (
                <p className="amber-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                <div className="amber-text" dangerouslySetInnerHTML={{ __html: section.content }} />
              )
            )}

            {section.kind === 'tags' && <TagsBlock section={section} />}

            {section.kind === 'entries' && (
              section.entries.filter(
                (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
              ).length === 0 ? (
                <p className="amber-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                section.entries
                  .filter((e) => !e.hidden)
                  .map((entry) => {
                    const { start, end } = formatEntryDateRange(entry, dateFormat);
                    const dateRange = [start, end].filter(Boolean).join(' – ');
                    return (
                      <div className="amber-entry" key={entry.id}>
                        <div className="amber-entry-row">
                          <span className="amber-entry-heading">
                            {entry.link ? (
                              <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                                {entry.heading}
                              </a>
                            ) : (
                              entry.heading
                            )}
                          </span>
                          {dateRange && <span className="amber-entry-date">{dateRange}</span>}
                        </div>
                        {(entry.subheading || entry.location) && (
                          <div className="amber-entry-sub">
                            {[entry.subheading, entry.location].filter(Boolean).join(' – ')}
                          </div>
                        )}
                        {!isHtmlEmpty(entry.description) && (
                          <div className="amber-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
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
