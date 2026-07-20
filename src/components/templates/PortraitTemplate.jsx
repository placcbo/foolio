import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// PortraitTemplate — self-contained framed two-column design and the first
// template with a photo slot. Left column: name, title, photo, icon contact
// list, then all text- and tags-kind sections (summary, skills, languages);
// right column: all entries-kind sections (experience, education,
// certificates). Section headings are soft gray badge bars; the languages
// section renders proficiency bars parsed from tags like "English (Fluent)".
// ---------------------------------------------------------------------------

function normalizeUrl(link) {
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}

// "English (Fluent)" -> { name: 'English', level: 1 } ... unknown wording
// gets a solid-but-not-full bar rather than pretending precision.
export function parseLanguageLevel(tag) {
  const m = String(tag).match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!m) return { name: tag, level: 0.7 };
  const level = m[2].toLowerCase();
  let value = 0.7;
  if (/native|mother/.test(level)) value = 1;
  else if (/fluent|c2|proficien/.test(level)) value = 0.92;
  else if (/advanced|professional|c1/.test(level)) value = 0.8;
  else if (/intermediate|conversational|b1|b2/.test(level)) value = 0.6;
  else if (/basic|beginner|elementary|a1|a2/.test(level)) value = 0.35;
  return { name: m[1], level: value };
}

function Badge({ title }) {
  return <h2 className="portrait-badge">{title}</h2>;
}

function LeftTags({ section }) {
  const groups = (section.groups?.length
    ? section.groups
    : [{ id: 'flat', label: '', tags: section.tags || [] }]
  ).filter((g) => (g.tags || []).length > 0);
  if (!groups.length) return null;

  if (section.type === 'languages') {
    const langs = groups.flatMap((g) => g.tags).map(parseLanguageLevel);
    return (
      <div className="portrait-left-section">
        <Badge title={section.title} />
        <div className="portrait-langs">
          {langs.map((l, i) => (
            <div className="portrait-lang-row" key={`${l.name}-${i}`}>
              <span className="portrait-lang-name">{l.name}</span>
              <span className="portrait-lang-track">
                <span style={{ width: `${Math.round(l.level * 100)}%` }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  return (
    <div className="portrait-left-section">
      <Badge title={section.title} />
      {groups.map((g) => (
        <div className="portrait-tag-group" key={g.id}>
          {hasLabels && g.label && g.label.trim() && (
            <span className="portrait-tag-group-label">{g.label.trim()}</span>
          )}
          <ul className="portrait-tag-list">
            {g.tags.map((t, i) => (
              <li key={`${t}-${i}`}>{t}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function PortraitTemplate({ resume, accentColor = '#2b4a6f' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  const leftSections = sections.filter((s) => s.kind === 'tags' || s.kind === 'text');
  const rightSections = sections.filter((s) => s.kind === 'entries');

  return (
    <div className="paper portrait-template" style={{ '--portrait-accent': accentColor }}>
      <div className="portrait-card">
        <aside className="portrait-left">
          <h1 className="portrait-name">{basics.name || 'Your name'}</h1>
          {basics.title && <p className="portrait-title">{basics.title}</p>}

          {basics.photo && (
            <div className="portrait-photo">
              <img src={basics.photo} alt="" />
            </div>
          )}

          {contactItems.length > 0 && (
            <ul className="portrait-contact">
              {contactItems.map(({ key, Icon, text, href }) => (
                <li key={key}>
                  <Icon size={12} />
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      {text}
                    </a>
                  ) : (
                    <span>{text}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {leftSections.map((section) => (
            section.kind === 'tags' ? (
              <LeftTags section={section} key={section.id} />
            ) : (
              <div className="portrait-left-section" key={section.id}>
                <Badge title={section.title} />
                {isHtmlEmpty(section.content) ? (
                  <p className="portrait-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
                ) : (
                  <div className="portrait-text" dangerouslySetInnerHTML={{ __html: section.content }} />
                )}
              </div>
            )
          ))}
        </aside>

        <main className="portrait-right">
          {rightSections.map((section) => (
            <section className="portrait-section" key={section.id}>
              <Badge title={section.title} />
              {section.entries.filter(
                (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
              ).length === 0 ? (
                <p className="portrait-placeholder">Add your {section.title.toLowerCase()}\u2026</p>
              ) : (
                section.entries
                  .filter((e) => !e.hidden)
                  .map((entry) => {
                    const { start, end } = formatEntryDateRange(entry, dateFormat);
                    const dateRange = [start, end].filter(Boolean).join(' \u2013 ');
                    const metaLine = [dateRange, entry.location].filter(Boolean).join(' | ');
                    return (
                      <div className="portrait-entry" key={entry.id}>
                        <div className="portrait-entry-heading">
                          {entry.link ? (
                            <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                              {entry.heading}
                            </a>
                          ) : (
                            entry.heading
                          )}
                        </div>
                        {entry.subheading && <div className="portrait-entry-sub">{entry.subheading}</div>}
                        {metaLine && <div className="portrait-entry-meta">{metaLine}</div>}
                        {!isHtmlEmpty(entry.description) && (
                          <div className="portrait-bullets" dangerouslySetInnerHTML={{ __html: entry.description }} />
                        )}
                      </div>
                    );
                  })
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
    </div>
  );
}