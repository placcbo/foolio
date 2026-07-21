import { getContactItems, isHtmlEmpty, Avatar } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';
import { parseLanguageLevel } from './PortraitTemplate';

// ---------------------------------------------------------------------------
// LensTemplate — self-contained, like SimpleTemplate/NovaTemplate/etc.
//
// A single-column, photo-header design: a circular headshot sits inline
// with the name/title in the header instead of anchoring a sidebar column,
// every section title sits inside a full-width tinted bar (not just an
// underline), skills read as a multi-column bulleted grid, and languages
// render as a 5-dot proficiency rating instead of a text label or a bar.
// Modeled on a reference resume the user shared. Owns its entire look;
// reads only content + accentColor, never resume.settings. CSS: .lens-*.
// ---------------------------------------------------------------------------

function normalizeUrl(link) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

function DotRating({ level }) {
  const filled = Math.round(level * 5);
  return (
    <span className="lens-dots" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`lens-dot${i < filled ? ' lens-dot-filled' : ''}`} />
      ))}
    </span>
  );
}

function TagsBlock({ section }) {
  const groups = (section.groups?.length
    ? section.groups
    : [{ id: 'flat', label: '', tags: section.tags || [] }]
  ).filter((g) => (g.tags || []).length > 0);
  const flat = groups.flatMap((g) => g.tags);

  if (!flat.length) {
    return <p className="lens-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  if (section.type === 'languages') {
    const langs = flat.map(parseLanguageLevel);
    return (
      <div className="lens-lang-list">
        {langs.map((l, i) => (
          <div className="lens-lang-row" key={`${l.name}-${i}`}>
            <span className="lens-lang-name">{l.name}</span>
            <DotRating level={l.level} />
          </div>
        ))}
      </div>
    );
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <div className="lens-tag-grid">
        {flat.map((tag, i) => (
          <div className="lens-tag-item" key={`${tag}-${i}`}>
            <span className="lens-tag-dot" aria-hidden="true" />
            {tag}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="lens-skill-groups">
      {groups.map((g) => (
        <div className="lens-skill-row" key={g.id}>
          <span className="lens-skill-label">{g.label && g.label.trim() ? g.label.trim() : ''}</span>
          <span className="lens-skill-values">{g.tags.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="lens-heading-bar">
      <h2 className="lens-heading">{title}</h2>
    </div>
  );
}

export default function LensTemplate({ resume, accentColor = '#2b4a6f' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper lens-template" style={{ '--lens-accent': accentColor }}>
      <header className="lens-header">
        <Avatar photo={basics.photo} name={basics.name} shape="circle" size={72} className="lens-avatar" />
        <div className="lens-header-text">
          <h1 className="lens-name">{basics.name || 'Your name'}</h1>
          {basics.title && <p className="lens-title">{basics.title}</p>}
          {contactItems.length > 0 && (
            <div className="lens-contact-row">
              {contactItems.map(({ key, Icon, text, href }) => (
                <span className="lens-contact-item" key={key}>
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
        </div>
      </header>

      {sections.map((section) => (
        <section className="lens-section" key={section.id}>
          <SectionHeading title={section.title} />

          <div className="lens-section-body">
            {section.kind === 'text' && (
              isHtmlEmpty(section.content) ? (
                <p className="lens-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                <div className="lens-text" dangerouslySetInnerHTML={{ __html: section.content }} />
              )
            )}

            {section.kind === 'tags' && <TagsBlock section={section} />}

            {section.kind === 'entries' && (
              section.entries.filter(
                (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
              ).length === 0 ? (
                <p className="lens-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                section.entries
                  .filter((e) => !e.hidden)
                  .map((entry) => {
                    const { start, end } = formatEntryDateRange(entry, dateFormat);
                    const dateRange = [start, end].filter(Boolean).join(' – ');
                    return (
                      <div className="lens-entry" key={entry.id}>
                        <div className="lens-entry-gutter">
                          {dateRange && <span className="lens-entry-date">{dateRange}</span>}
                          {entry.location && <span className="lens-entry-location">{entry.location}</span>}
                        </div>
                        <div className="lens-entry-main">
                          <span className="lens-entry-heading">
                            {entry.link ? (
                              <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                                {entry.heading}
                              </a>
                            ) : (
                              entry.heading
                            )}
                          </span>
                          {entry.subheading && <div className="lens-entry-sub">{entry.subheading}</div>}
                          {!isHtmlEmpty(entry.description) && (
                            <div className="lens-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
                          )}
                        </div>
                      </div>
                    );
                  })
              )
            )}
          </div>
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
