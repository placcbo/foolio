import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// WillowTemplate — self-contained, like SimpleTemplate/NovaTemplate/etc.
//
// A serif, editorial sidebar design: the accent color fills a muted panel
// on the left carrying identity, contact, and the "quick reference" content
// (summary/skills/languages/education), while the long-form career story
// (experience and anything else entries-shaped) flows in the white main
// column. Splitting by "is this short reference info or a career story" —
// rather than tags-vs-everything like SlateTemplate — is the one structural
// difference from the other sidebar templates. Owns its entire look; reads
// only content + accentColor, never resume.settings. CSS: .willow-*.
// ---------------------------------------------------------------------------

function normalizeUrl(link) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

// Short reference info lives in the sidebar (summary, skills, languages,
// education); the long-form career narrative flows in the main column.
function splitSections(sections) {
  const aside = sections.filter((s) => s.kind !== 'entries' || s.type === 'education');
  const main = sections.filter((s) => s.kind === 'entries' && s.type !== 'education');
  return { aside, main };
}

function AsideTags({ section }) {
  const groups = (section.groups?.length
    ? section.groups
    : [{ id: 'flat', label: '', tags: section.tags || [] }]
  ).filter((g) => (g.tags || []).length > 0);

  if (!groups.length) {
    return <p className="willow-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  return (
    <div className="willow-tag-groups">
      {groups.map((g) => (
        <div className="willow-tag-group" key={g.id}>
          {g.label && g.label.trim() && <span className="willow-tag-group-label">{g.label.trim()}</span>}
          <div className="willow-tag-list">
            {g.tags.map((t, i) => (
              <span key={`${t}-${i}`}>{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AsideEntries({ section, dateFormat }) {
  const entries = section.entries.filter(
    (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
  );
  if (!entries.length) {
    return <p className="willow-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }
  return entries.map((entry) => {
    const { start, end } = formatEntryDateRange(entry, dateFormat);
    const dateRange = [start, end].filter(Boolean).join(' – ');
    return (
      <div className="willow-aside-entry" key={entry.id}>
        <div className="willow-aside-entry-heading">{entry.heading}</div>
        {(entry.subheading || dateRange) && (
          <div className="willow-aside-entry-sub">
            {[entry.subheading, dateRange].filter(Boolean).join(' · ')}
          </div>
        )}
        {!isHtmlEmpty(entry.description) && (
          <div className="willow-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
        )}
      </div>
    );
  });
}

function SectionHeading({ title }) {
  return (
    <div className="willow-heading-wrap">
      <h2 className="willow-heading">{title}</h2>
      <span className="willow-heading-rule" aria-hidden="true" />
    </div>
  );
}

export default function WillowTemplate({ resume, accentColor = '#b7c4b4' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);
  const { aside: asideSections, main: mainSections } = splitSections(sections);

  return (
    <div className="paper willow-template">
      <aside className="willow-aside" style={{ background: accentColor }}>
        <h1 className="willow-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="willow-title">{basics.title}</p>}

        {contactItems.length > 0 && (
          <div className="willow-contact">
            {contactItems.map(({ key, Icon, text, href }) => (
              <span className="willow-contact-item" key={key}>
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

        {asideSections.map((section) => (
          <div className="willow-section" key={section.id}>
            <SectionHeading title={section.title} />
            {section.kind === 'text' && (
              isHtmlEmpty(section.content) ? (
                <p className="willow-placeholder">Add your {section.title.toLowerCase()}…</p>
              ) : (
                <div className="willow-text" dangerouslySetInnerHTML={{ __html: section.content }} />
              )
            )}
            {section.kind === 'tags' && <AsideTags section={section} />}
            {section.kind === 'entries' && <AsideEntries section={section} dateFormat={dateFormat} />}
          </div>
        ))}
      </aside>

      <main className="willow-main">
        {mainSections.map((section) => (
          <section className="willow-section" key={section.id}>
            <SectionHeading title={section.title} />
            {section.entries.filter(
              (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
            ).length === 0 ? (
              <p className="willow-placeholder">Add your {section.title.toLowerCase()}…</p>
            ) : (
              section.entries
                .filter((e) => !e.hidden)
                .map((entry) => {
                  const { start, end } = formatEntryDateRange(entry, dateFormat);
                  const dateRange = [start, end].filter(Boolean).join(' – ');
                  return (
                    <div className="willow-entry" key={entry.id}>
                      <div className="willow-entry-row">
                        <span className="willow-entry-heading">
                          {entry.link ? (
                            <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                              {entry.heading}
                            </a>
                          ) : (
                            entry.heading
                          )}
                        </span>
                        {dateRange && <span className="willow-entry-date">{dateRange}</span>}
                      </div>
                      {(entry.subheading || entry.location) && (
                        <div className="willow-entry-sub">
                          {[entry.subheading, entry.location].filter(Boolean).join(' – ')}
                        </div>
                      )}
                      {!isHtmlEmpty(entry.description) && (
                        <div className="willow-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
                      )}
                    </div>
                  );
                })
            )}
          </section>
        ))}

        {mainSections.length === 0 && asideSections.length === 0 && (
          <p className="preview-empty">
            Click <strong>Add Content</strong> on the left to start building your resume.
          </p>
        )}
      </main>
    </div>
  );
}
