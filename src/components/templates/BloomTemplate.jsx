import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// BloomTemplate — self-contained banner design: a full-width rounded block
// in the accent color carries the name, title, and contact line in white;
// below it, a single column with accent headings (short underline bar) and
// skills rendered as soft pill chips tinted from the accent.
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
    return <p className="bloom-placeholder">Add your {section.title.toLowerCase()}\u2026</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <div className="bloom-chips">
        {flat.map((tag, i) => (
          <span className="bloom-chip" key={`${tag}-${i}`}>
            {tag}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="bloom-chip-groups">
      {groups.map((g) => (
        <div className="bloom-chip-group" key={g.id}>
          {g.label && g.label.trim() && <span className="bloom-chip-group-label">{g.label.trim()}</span>}
          <div className="bloom-chips">
            {g.tags.map((tag, i) => (
              <span className="bloom-chip" key={`${tag}-${i}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BloomTemplate({ resume, accentColor = '#c85a54' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper bloom-template" style={{ '--bloom-accent': accentColor }}>
      <header className="bloom-hero">
        <h1 className="bloom-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="bloom-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <p className="bloom-contact-row">
            {contactItems.map((item, i) => (
              <span key={item.key}>
                {i > 0 && <span className="bloom-dot" aria-hidden="true">{'\u2022'}</span>}
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
        <section className="bloom-section" key={section.id}>
          <h2 className="bloom-heading">{section.title}</h2>

          {section.kind === 'text' && (
            isHtmlEmpty(section.content) ? (
              <p className="bloom-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
            ) : (
              <div className="bloom-text" dangerouslySetInnerHTML={{ __html: section.content }} />
            )
          )}

          {section.kind === 'tags' && <TagsBlock section={section} />}

          {section.kind === 'entries' && (
            section.entries.filter(
              (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
            ).length === 0 ? (
              <p className="bloom-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
            ) : (
              section.entries
                .filter((e) => !e.hidden)
                .map((entry) => {
                  const { start, end } = formatEntryDateRange(entry, dateFormat);
                  const dateRange = [start, end].filter(Boolean).join(' \u2013 ');
                  return (
                    <div className="bloom-entry" key={entry.id}>
                      <div className="bloom-entry-row">
                        <span className="bloom-entry-heading">
                          {entry.link ? (
                            <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                              {entry.heading}
                            </a>
                          ) : (
                            entry.heading
                          )}
                        </span>
                        {dateRange && <span className="bloom-entry-date">{dateRange}</span>}
                      </div>
                      {(entry.subheading || entry.location) && (
                        <div className="bloom-entry-sub">
                          {[entry.subheading, entry.location].filter(Boolean).join(' \u2013 ')}
                        </div>
                      )}
                      {!isHtmlEmpty(entry.description) && (
                        <div className="bloom-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
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