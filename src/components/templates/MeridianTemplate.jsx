import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// MeridianTemplate — self-contained timeline design. Editorial masthead
// (huge name over a hairline, title + contact beneath), then every section
// laid out on a two-track grid: labels and date ranges live in a left
// gutter, content sits right of a continuous vertical line, and each entry
// gets an accent dot on the line — a resume drawn as a timeline.
// ---------------------------------------------------------------------------

function normalizeUrl(link) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

function TagsContent({ section }) {
  const groups = (section.groups?.length
    ? section.groups
    : [{ id: 'flat', label: '', tags: section.tags || [] }]
  ).filter((g) => (g.tags || []).length > 0);
  const flat = groups.flatMap((g) => g.tags);

  if (!flat.length) {
    return <p className="meridian-placeholder">Add your {section.title.toLowerCase()}\u2026</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <p className="meridian-tags">
        {flat.map((tag, i) => (
          <span key={`${tag}-${i}`}>
            {i > 0 && <span className="meridian-tag-sep" aria-hidden="true" />}
            {tag}
          </span>
        ))}
      </p>
    );
  }

  return (
    <div className="meridian-tag-groups">
      {groups.map((g) => (
        <p className="meridian-tag-group" key={g.id}>
          {g.label && g.label.trim() && <strong>{g.label.trim()}: </strong>}
          {g.tags.join(', ')}
        </p>
      ))}
    </div>
  );
}

export default function MeridianTemplate({ resume, accentColor = '#d43d2a' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper meridian-template" style={{ '--meridian-accent': accentColor }}>
      <header className="meridian-masthead">
        <h1 className="meridian-name">{basics.name || 'Your name'}</h1>
        <div className="meridian-masthead-rule" />
        <div className="meridian-masthead-row">
          {basics.title && <span className="meridian-title">{basics.title}</span>}
          {contactItems.length > 0 && (
            <span className="meridian-contact">
              {contactItems.map((item, i) => (
                <span key={item.key}>
                  {i > 0 && <span className="meridian-tag-sep" aria-hidden="true" />}
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
                </span>
              ))}
            </span>
          )}
        </div>
      </header>

      {sections.map((section) => (
        <section className="meridian-section" key={section.id}>
          <div className="meridian-row meridian-row-head">
            <div className="meridian-gutter">
              <h2 className="meridian-heading">{section.title}</h2>
            </div>
            <div className="meridian-content meridian-content-spacer" />
          </div>

          {section.kind === 'text' && (
            <div className="meridian-row">
              <div className="meridian-gutter" />
              <div className="meridian-content">
                {isHtmlEmpty(section.content) ? (
                  <p className="meridian-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
                ) : (
                  <div className="meridian-text" dangerouslySetInnerHTML={{ __html: section.content }} />
                )}
              </div>
            </div>
          )}

          {section.kind === 'tags' && (
            <div className="meridian-row">
              <div className="meridian-gutter" />
              <div className="meridian-content">
                <TagsContent section={section} />
              </div>
            </div>
          )}

          {section.kind === 'entries' && (
            section.entries.filter(
              (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
            ).length === 0 ? (
              <div className="meridian-row">
                <div className="meridian-gutter" />
                <div className="meridian-content">
                  <p className="meridian-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
                </div>
              </div>
            ) : (
              section.entries
                .filter((e) => !e.hidden)
                .map((entry) => {
                  const { start, end } = formatEntryDateRange(entry, dateFormat);
                  const dateRange = [start, end].filter(Boolean).join(' \u2013 ');
                  return (
                    <div className="meridian-row" key={entry.id}>
                      <div className="meridian-gutter meridian-date">{dateRange}</div>
                      <div className="meridian-content meridian-entry">
                        <span className="meridian-dot" aria-hidden="true" />
                        <div className="meridian-entry-heading">
                          {entry.link ? (
                            <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                              {entry.heading}
                            </a>
                          ) : (
                            entry.heading
                          )}
                        </div>
                        {(entry.subheading || entry.location) && (
                          <div className="meridian-entry-sub">
                            {[entry.subheading, entry.location].filter(Boolean).join(' \u2013 ')}
                          </div>
                        )}
                        {!isHtmlEmpty(entry.description) && (
                          <div className="meridian-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
                        )}
                      </div>
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