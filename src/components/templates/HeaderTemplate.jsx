import { IconMail, IconPhone, IconPin } from '../icons';
import { Avatar, SectionBody, splitSections } from './shared';

export default function HeaderTemplate({ resume, accentColor }) {
  const { basics, sections } = resume;
  const { sidebarSections, mainSections } = splitSections(sections);
  const hasContact = basics.email || basics.phone || basics.address;

  return (
    <div className="paper header-paper">
      <header className="tpl-plain-header">
        <div>
          <h1>{basics.name || 'Your name'}</h1>
          {basics.title && <p className="tpl-role">{basics.title}</p>}
          {hasContact && (
            <div className="tpl-contact-row">
              {basics.email && (
                <span>
                  <IconMail size={12} /> {basics.email}
                </span>
              )}
              {basics.address && (
                <span>
                  <IconPin size={12} /> {basics.address}
                </span>
              )}
              {basics.phone && (
                <span>
                  <IconPhone size={12} /> {basics.phone}
                </span>
              )}
            </div>
          )}
        </div>
        <Avatar photo={basics.photo} name={basics.name} shape="rounded" size={96} />
      </header>

      <div className="tpl-header-body">
        <aside className="tpl-header-sidebar">
          {sidebarSections.map((s) => (
            <div className="tpl-sidebar-block" key={s.id}>
              <h4 className="tpl-heading" style={{ borderBottom: `2px solid ${accentColor}` }}>
                {s.title}
              </h4>
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
