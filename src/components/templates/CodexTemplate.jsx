import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// CodexTemplate — self-contained, like SimpleTemplate/NovaTemplate.
//
// An editorial/technical look: a rotated monogram "stamp" sits opposite the
// name instead of a photo, the job title reads as a terminal prompt line
// ("> Title"), section headings are monospace "// LABEL" tags with a
// dotted leader rule trailing off, dates render as small monospace code
// badges, and skills read as "#hashtag" text. Still one flowing column —
// the hook is the typography pairing (sans body + monospace accents), not
// a different layout family. Owns its entire look; reads only content +
// accentColor, never resume.settings. CSS lives in .codex-*.
// ---------------------------------------------------------------------------

function normalizeUrl(link) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function TagsBlock({ section }) {
  const groups = (section.groups?.length
    ? section.groups
    : [{ id: 'flat', label: '', tags: section.tags || [] }]
  ).filter((g) => (g.tags || []).length > 0);
  const flat = groups.flatMap((g) => g.tags);

  if (!flat.length) {
    return <p className="codex-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <div className="codex-tags">
        {flat.map((tag, i) => (
          <span className="codex-tag" key={`${tag}-${i}`}>{`#${tag.replace(/\s+/g, '')}`}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="codex-skill-groups">
      {groups.map((g) => (
        <div className="codex-skill-row" key={g.id}>
          <span className="codex-skill-label">{g.label && g.label.trim() ? g.label.trim() : ''}</span>
          <span className="codex-skill-values">{g.tags.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="codex-heading-row">
      <h2 className="codex-heading">{`// ${title.toUpperCase()}`}</h2>
      <span className="codex-heading-rule" aria-hidden="true" />
    </div>
  );
}

export default function CodexTemplate({ resume, accentColor = '#5b4bb5' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper codex-template" style={{ '--codex-accent': accentColor }}>
      <header className="codex-header">
        <div className="codex-header-text">
          <h1 className="codex-name">{basics.name || 'Your name'}</h1>
          {basics.title && <p className="codex-title">{`> ${basics.title}`}</p>}
          {contactItems.length > 0 && (
            <div className="codex-contact-row">
              {contactItems.map((item, i) => (
                <span className="codex-contact-item" key={item.key}>
                  {i > 0 && <span className="codex-contact-sep" aria-hidden="true" />}
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
        </div>
        <div className="codex-stamp" aria-hidden="true">
          {initialsOf(basics.name) || '?'}
        </div>
      </header>

      {sections.map((section) => (
        <section className="codex-section" key={section.id}>
          <SectionHeading title={section.title} />

          {section.kind === 'text' && (
            isHtmlEmpty(section.content) ? (
              <p className="codex-placeholder">Add your {section.title.toLowerCase()}…</p>
            ) : (
              <div className="codex-text" dangerouslySetInnerHTML={{ __html: section.content }} />
            )
          )}

          {section.kind === 'tags' && <TagsBlock section={section} />}

          {section.kind === 'entries' && (
            section.entries.filter(
              (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
            ).length === 0 ? (
              <p className="codex-placeholder">Add your {section.title.toLowerCase()}…</p>
            ) : (
              section.entries
                .filter((e) => !e.hidden)
                .map((entry) => {
                  const { start, end } = formatEntryDateRange(entry, dateFormat);
                  const dateRange = [start, end].filter(Boolean).join(' → ');
                  return (
                    <div className="codex-entry" key={entry.id}>
                      <div className="codex-entry-row">
                        <span className="codex-entry-heading">
                          {entry.link ? (
                            <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                              {entry.heading}
                            </a>
                          ) : (
                            entry.heading
                          )}
                        </span>
                        {dateRange && <span className="codex-entry-date">{dateRange}</span>}
                      </div>
                      {(entry.subheading || entry.location) && (
                        <div className="codex-entry-sub">
                          {[entry.subheading, entry.location].filter(Boolean).join(' – ')}
                        </div>
                      )}
                      {!isHtmlEmpty(entry.description) && (
                        <div className="codex-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
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
