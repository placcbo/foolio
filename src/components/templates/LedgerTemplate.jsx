import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// LedgerTemplate — self-contained, like SimpleTemplate/NovaTemplate/CodexTemplate.
//
// A restrained "letterhead" look built for the professional/executive gap
// none of the other templates cover: a thin double frame runs around the
// whole page, the header splits the name (with a short accent mark) to the
// left against the title/contact right-aligned, section headings carry a
// small accent tick instead of a numbered index or monospace tag, and flat
// skill tags render as a two-column dotted list rather than pills or a
// hashtag row. Deliberately plain otherwise — no color blocks, no photo, no
// monospace — the most ATS-safe-reading of the set. Owns its entire look;
// reads only content + accentColor, never resume.settings. CSS: .ledger-*.
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
    return <p className="ledger-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <div className="ledger-tag-grid">
        {flat.map((tag, i) => (
          <div className="ledger-tag-item" key={`${tag}-${i}`}>
            <span className="ledger-tag-dot" aria-hidden="true" />
            {tag}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ledger-skill-groups">
      {groups.map((g) => (
        <div className="ledger-skill-row" key={g.id}>
          <span className="ledger-skill-label">{g.label && g.label.trim() ? g.label.trim() : ''}</span>
          <span className="ledger-skill-values">{g.tags.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="ledger-heading-wrap">
      <h2 className="ledger-heading">
        <span className="ledger-heading-mark" aria-hidden="true" />
        {title.toUpperCase()}
      </h2>
    </div>
  );
}

export default function LedgerTemplate({ resume, accentColor = '#1f3a5f' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper ledger-template" style={{ '--ledger-accent': accentColor }}>
      <div className="ledger-frame">
        <header className="ledger-header">
          <div className="ledger-header-row">
            <div className="ledger-name-block">
              <span className="ledger-mark" aria-hidden="true" />
              <h1 className="ledger-name">{basics.name || 'Your name'}</h1>
            </div>
            <div className="ledger-header-meta">
              {basics.title && <p className="ledger-title">{basics.title}</p>}
              {contactItems.length > 0 && (
                <div className="ledger-contact-row">
                  {contactItems.map((item, i) => (
                    <span className="ledger-contact-item" key={item.key}>
                      {i > 0 && <span className="ledger-contact-sep" aria-hidden="true" />}
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
          </div>
          <div className="ledger-header-rule" />
        </header>

        {sections.map((section) => (
          <section className="ledger-section" key={section.id}>
            <SectionHeading title={section.title} />

            {section.kind === 'text' && (
              isHtmlEmpty(section.content) ? (
                <p className="ledger-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                <div className="ledger-text" dangerouslySetInnerHTML={{ __html: section.content }} />
              )
            )}

            {section.kind === 'tags' && <TagsBlock section={section} />}

            {section.kind === 'entries' && (
              section.entries.filter(
                (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
              ).length === 0 ? (
                <p className="ledger-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                section.entries
                  .filter((e) => !e.hidden)
                  .map((entry) => {
                    const { start, end } = formatEntryDateRange(entry, dateFormat);
                    const dateRange = [start, end].filter(Boolean).join(' – ');
                    return (
                      <div className="ledger-entry" key={entry.id}>
                        <div className="ledger-entry-row">
                          <span className="ledger-entry-heading">
                            {entry.link ? (
                              <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                                {entry.heading}
                              </a>
                            ) : (
                              entry.heading
                            )}
                          </span>
                          {dateRange && <span className="ledger-entry-date">{dateRange}</span>}
                        </div>
                        {(entry.subheading || entry.location) && (
                          <div className="ledger-entry-sub">
                            {[entry.subheading, entry.location].filter(Boolean).join(' – ')}
                          </div>
                        )}
                        {!isHtmlEmpty(entry.description) && (
                          <div className="ledger-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
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
