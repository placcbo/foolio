import { IconMail, IconPhone, IconPin } from '../icons';
import { Avatar, SectionBody, splitSections } from './shared';

export default function SidebarTemplate({ resume, accentColor }) {
  const { basics, sections } = resume;
  const { sidebarSections, mainSections } = splitSections(sections);

  return (
    <div className="paper sidebar-paper">
      <aside className="tpl-sidebar" style={{ background: accentColor }}>
        <Avatar
          photo={basics.photo}
          name={basics.name}
          shape="square"
          size={140}
          className="tpl-sidebar-photo"
        />
        <div className="tpl-sidebar-block">
          <h4 className="tpl-heading">Details</h4>
          {basics.email && (
            <p className="tpl-contact-line">
              <IconMail size={12} /> {basics.email}
            </p>
          )}
          {basics.address && (
            <p className="tpl-contact-line">
              <IconPin size={12} /> {basics.address}
            </p>
          )}
          {basics.phone && (
            <p className="tpl-contact-line">
              <IconPhone size={12} /> {basics.phone}
            </p>
          )}
        </div>
        {sidebarSections.map((s) => (
          <div className="tpl-sidebar-block" key={s.id}>
            <h4 className="tpl-heading">{s.title}</h4>
            <SectionBody section={s} />
          </div>
        ))}
      </aside>

      <main className="tpl-main">
        <h1>{basics.name || 'Your name'}</h1>
        {basics.title && <p className="tpl-role">{basics.title}</p>}

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
  );
}
