import { getContactItems, isHtmlEmpty } from './shared';
import { formatEntryDateRange } from '../../utils/dateFormat';

// ---------------------------------------------------------------------------
// SimpleTemplate — a self-contained unit.
//
// Unlike the older shared-settings templates (OneColumnTemplate,
// SidebarTemplate, etc.), this component does NOT read resume.settings for
// its look. It owns its entire design: typography, spacing, header
// arrangement, heading style, all of it is fixed and intentional, defined
// right here in this one file. The only inputs are the resume's actual
// content (basics/sections) and the single accent color.
//
// Why: the old approach had every template built from the same shared
// rendering pieces (HeaderBlock, SectionHeading, SplitLayout...) driven by
// one giant settings object with a dozen interacting panels. That meant a
// bug or an edge case in any shared piece could break every template at
// once, and "customizing" one template's look risked producing states its
// design was never intended to support. A self-contained template can't do
// that to anything else — its CSS is its own scoped namespace
// (`.simple-template …`), its JSX doesn't call into the shared settings
// pipeline at all, and there's nothing to keep in sync.
// ---------------------------------------------------------------------------

function Bullets({ html }) {
  if (isHtmlEmpty(html)) return null;
  return <div className="simple-bullets" dangerouslySetInnerHTML={{ __html: html }} />;
}

// Users type "acme.com" as often as "https://acme.com" — without a scheme
// the browser treats the href as a relative path, so normalize.
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
    return <p className="simple-placeholder">Add your {section.title.toLowerCase()}…</p>;
  }

  const hasLabels = groups.some((g) => g.label && g.label.trim());
  if (!hasLabels) {
    return (
      <div className="simple-tags">
        {flat.map((tag, i) => (
          <span className="simple-tag" key={`${tag}-${i}`}>
            {i > 0 && <span className="simple-tag-sep" aria-hidden="true" />}
            {tag}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="simple-skill-groups">
      {groups.map((g) => (
        <div className="simple-skill-row" key={g.id}>
          <span className="simple-skill-label">{g.label && g.label.trim() ? `${g.label.trim()}:` : ''}</span>
          <span className="simple-skill-values">{g.tags.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ title }) {
  return <h2 className="simple-heading">{title}</h2>;
}

export default function SimpleTemplate({ resume, accentColor = '#d9622b' }) {
  const basics = resume?.basics || {};
  const sections = (resume?.sections || []).filter((s) => !s.hidden);
  const dateFormat = resume?.settings?.dateFormat;
  const contactItems = getContactItems(basics);

  return (
    <div className="paper simple-template" style={{ '--simple-accent': accentColor }}>
      <header className="simple-header">
        <h1 className="simple-name">{basics.name || 'Your name'}</h1>
        {basics.title && <p className="simple-title">{basics.title}</p>}
        {contactItems.length > 0 && (
          <div className="simple-contact-row">
            {contactItems.map((item, i) => (
              <span className="simple-contact-item" key={item.key}>
                {i > 0 && <span className="simple-contact-sep" aria-hidden="true" />}
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
      </header>

      {sections.map((section) => (
        <section className="simple-section" key={section.id}>
          <SectionHeading title={section.title} />

          {section.kind === 'text' && (
            isHtmlEmpty(section.content) ? (
              <p className="simple-placeholder">Add your {section.title.toLowerCase()}…</p>
            ) : (
              <div className="simple-text" dangerouslySetInnerHTML={{ __html: section.content }} />
            )
          )}

          {section.kind === 'tags' && <TagsBlock section={section} />}

          {section.kind === 'entries' && (
            section.entries.filter(
              (e) => !e.hidden && (e.heading || e.subheading || !isHtmlEmpty(e.description) || e.location || e.start || e.end)
            ).length === 0 ? (
              <p className="simple-placeholder">Add your {section.title.toLowerCase()}…</p>
            ) : (
              section.entries
                .filter((e) => !e.hidden)
                .map((entry) => {
                  const { start, end } = formatEntryDateRange(entry, dateFormat);
                  const dateRange = [start, end].filter(Boolean).join(' \u2013 ');
                  return (
                    <div className="simple-entry" key={entry.id}>
                      <div className="simple-entry-row">
                        <span className="simple-entry-heading">
                          {entry.link ? (
                            <a href={normalizeUrl(entry.link)} target="_blank" rel="noopener noreferrer">
                              {entry.heading}
                            </a>
                          ) : (
                            entry.heading
                          )}
                        </span>
                        {dateRange && <span className="simple-entry-date">{dateRange}</span>}
                      </div>
                      {(entry.subheading || entry.location) && (
                        <div className="simple-entry-sub">
                          {[entry.subheading, entry.location].filter(Boolean).join(' \u2013 ')}
                        </div>
                      )}
                      <Bullets html={entry.description} />
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