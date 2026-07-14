import { Avatar, SectionBody, splitSections, getContactItems } from './shared';

export default function BannerTemplate({ resume, accentColor }) {
  const { basics, sections } = resume;
  const { sidebarSections, mainSections } = splitSections(sections);
  const contactItems = getContactItems(basics);

  return (
    <div className="paper banner-paper">
      <header className="tpl-banner" style={{ background: accentColor }}>
        <Avatar photo={basics.photo} name={basics.name} shape="rounded" size={84} />
        <div>
          <h1>{basics.name || 'Your name'}</h1>
          {basics.title && <p className="tpl-role tpl-role-light">{basics.title}</p>}
        </div>
      </header>

      <div className="tpl-banner-body">
        <aside className="tpl-banner-sidebar">
          <div className="tpl-sidebar-block">
            <h4 className="tpl-heading">Details</h4>
            {contactItems.map(({ key, Icon, text }) => (
              <p className="tpl-contact-line" key={key}>
                <Icon size={12} /> {text}
              </p>
            ))}
          </div>
          {sidebarSections.map((s) => (
            <div className="tpl-sidebar-block" key={s.id}>
              <h4 className="tpl-heading">{s.title}</h4>
              <SectionBody section={s} />
            </div>
          ))}
        </aside>

        <main className="tpl-main">
          {mainSections.map((s) => (
            <section className="tpl-main-section" key={s.id}>
              <h4 className="tpl-heading">{s.title}</h4>
              <SectionBody section={s} />
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