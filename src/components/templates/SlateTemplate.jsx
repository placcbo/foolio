import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// SlateTemplate — self-contained two-column design: a dark charcoal sidebar
// (name, title, contact, and every tags-kind section — skills, languages,
// interests) beside a white main column (summary, experience, education...).
// The tags-to-sidebar rule is deterministic, so the template always knows
// where content belongs without any per-template settings.
// ---------------------------------------------------------------------------

function normalizeUrl(link) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

function SideTags({ section }) {
  const groups = (section.groups?.length
    ? section.groups
    : [{ id: 'flat', label: '', tags: section.tags || [] }]
  ).filter((g) => (g.tags || []).length > 0);
  if (!groups.length) return null;
  const hasLabels = groups.some((g) => g.label && g.label.trim());

  return (
    <div className="slate-side-section">
      <h2 className="slate-side-heading">{section.title}</h2>
      {hasLabels ? (
        groups.map((g) => (
          <div className="slate-side-group" key={g.id}>
            {g.label && g.label.trim() && <span className="slate-side-group-label">{g.label.trim()}</span>}
            <ul className="slate-side-list">
              {g.tags.map((t, i) => (
                <li key={`${t}-${i}`}>{t}</li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <ul className="slate-side-list">
          {groups[0].tags.map((t, i) => (
            <li key={`${t}-${i}`}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SlateTemplate({ resume, accentColor = '#3aa7a3' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  const sideSections = sections.filter((s) => s.kind === 'tags');
  const mainSections = sections.filter((s) => s.kind !== 'tags');

  return (
    <div className="paper slate-template" style={{ '--slate-accent': accentColor }}>
      <aside className="slate-side">
        <h1 className="slate-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="slate-title">{basics.title}</p>}

        {contactItems.length > 0 && (
          <div className="slate-side-section">
            <h2 className="slate-side-heading">Contact</h2>
            <ul className="slate-side-list slate-contact-list">
              {contactItems.map((item) => (
                <li key={item.key}>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sideSections.map((section) => (
          <SideTags section={section} key={section.id} />
        ))}
      </aside>

      <main className="slate-main">
        {mainSections.map((section) => (
          <section className="slate-section" key={section.id}>
            <h2 className="slate-heading">{section.title}</h2>

            {section.kind === 'text' && (
              isHtmlEmpty(section.content) ? (
                <p className="slate-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
              ) : (
                <div className="slate-text" dangerouslySetInnerHTML={{ __html: section.content }} />
              )
            )}

            {section.kind === 'entries' && (
              section.entries.filter(
                (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
              ).length === 0 ? (
                <p className="slate-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
              ) : (
                section.entries
                  .filter((e) => !e.hidden)
                  .map((entry) => {
                    const { start, end } = formatEntryDateRange(entry, dateFormat);
                    const dateRange = [start, end].filter(Boolean).join(' \u2013 ');
                    return (
                      <div className="slate-entry" key={entry.id}>
                        <div className="slate-entry-row">
                          <span className="slate-entry-heading">
                            {entry.link ? (
                              <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                                {entry.heading}
                              </a>
                            ) : (
                              entry.heading
                            )}
                          </span>
                          {dateRange && <span className="slate-entry-date">{dateRange}</span>}
                        </div>
                        {(entry.subheading || entry.location) && (
                          <div className="slate-entry-sub">
                            {[entry.subheading, entry.location].filter(Boolean).join(' \u2013 ')}
                          </div>
                        )}
                        {!isHtmlEmpty(entry.description) && (
                          <div className="slate-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
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
      </main>
    </div>
  );
}