import { useRef } from 'react';
import { Logo } from './Logo';
import { TEMPLATE_COMPONENTS } from './templates';
import { TEMPLATES } from '../data/templates';
import { TEMPLATE_SAMPLES } from '../data/templateSamples';
import { SAMPLE_RESUME } from '../data/sampleResume';
import { JOB_STATUSES } from './JobTracker';
import { IconArrowLeft, IconCheck, IconPlus } from './icons';

// Width-fit for the ~232px preview tile, same ratio the real TemplateCard
// uses. We render the template component directly at low zoom rather than
// reusing TemplateCard, so the strip stays light — no per-card color state,
// no hover/preview modal machinery, just the design.
const PREVIEW_SCALE = 232 / 794;

// The homepage leads with a curated handful, not the whole catalogue — the
// picker is where you browse all of them. Left-to-right reads plainest →
// most designed, so the strip shows breadth at a glance.
const FEATURED_IDS = ['simple', 'classic', 'chronicle', 'slate', 'bloom', 'portrait', 'meridian', 'codex'];

// Illustrative only — a still of what the tracker's match panel looks like
// once you've pasted a real job description. Pulled from the same shape
// matchKeywords() returns, so the marketing never promises a layout the
// feature doesn't actually render. "Rejected" is trimmed off the status
// list here; the real tracker has it, but a landing page needn't lead with it.
const DEMO_MATCH = {
  score: 68,
  missing: ['kubernetes', 'terraform', 'ci/cd'],
  matched: ['react', 'typescript', 'postgres', 'docker', 'rest apis'],
};
const DEMO_STATUSES = JOB_STATUSES.slice(0, 4);

function TemplateStripCard({ template, onPick }) {
  const Template = TEMPLATE_COMPONENTS[template.layout];
  const sample = TEMPLATE_SAMPLES[template.id] || SAMPLE_RESUME;
  const color = template.swatches[0];
  const previewResume = { ...sample, templateId: template.layout, accentColor: color };

  return (
    <button
      type="button"
      className="home-strip-card"
      onClick={() => onPick(template.layout, color, template.preset)}
      aria-label={`Start with the ${template.name} template`}
    >
      <span className="home-strip-preview" aria-hidden="true">
        <span className="home-strip-scale" style={{ zoom: PREVIEW_SCALE }}>
          <Template resume={previewResume} accentColor={color} />
        </span>
      </span>
      <span className="home-strip-foot">
        <span className="home-strip-name">{template.name}</span>
        <span className="home-strip-use">Use this <span aria-hidden="true">&rarr;</span></span>
      </span>
    </button>
  );
}

export default function Home({ onStart, onSelectTemplate, onSignIn, onSignUp, isAuthenticated }) {
  const stripRef = useRef(null);
  const featured = FEATURED_IDS
    .map((id) => TEMPLATES.find((t) => t.id === id))
    .filter(Boolean);

  function scrollStrip(dir) {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 260, behavior: 'smooth' });
  }

  return (
    <div className="home">
      <header className="home-header">
        <Logo className="home-header-logo" />
        <nav className="home-header-nav">
          {isAuthenticated ? (
            <button type="button" className="home-btn-ghost" onClick={onStart}>
              Go to app
            </button>
          ) : (
            <>
              {onSignIn && (
                <button type="button" className="home-btn-ghost" onClick={onSignIn}>
                  Sign in
                </button>
              )}
              {onSignUp && (
                <button type="button" className="home-btn-solid" onClick={onSignUp}>
                  Sign up
                </button>
              )}
            </>
          )}
        </nav>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <h1 className="home-hero-title">
            Build a resume
            <br />
            worth reading.
          </h1>
          <p className="home-hero-sub">
            Fifteen designs, real PDF and DOCX export, and an editor that stays out of your way.
            No signup to start building.
          </p>
          <div className="home-hero-cta">
            <button type="button" className="home-btn-solid home-btn-lg" onClick={onStart}>
              Build your resume
            </button>
            <span className="home-hero-note">Free to start &middot; your data stays in your browser</span>
          </div>
        </section>

        <section className="home-strip-section" aria-labelledby="home-strip-label">
          <div className="home-strip-head">
            <div>
              <span className="home-eyebrow" id="home-strip-label">Templates</span>
              <h2 className="home-section-title">Pick where you start.</h2>
            </div>
            <div className="home-strip-arrows" aria-hidden="true">
              <button type="button" className="home-strip-arrow" onClick={() => scrollStrip(-1)} aria-label="Previous templates">
                <IconArrowLeft size={18} />
              </button>
              <button type="button" className="home-strip-arrow" onClick={() => scrollStrip(1)} aria-label="More templates">
                <IconArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>

          <div className="home-strip" ref={stripRef}>
            {featured.map((t) => (
              <TemplateStripCard key={t.id} template={t} onPick={onSelectTemplate} />
            ))}
            <button type="button" className="home-strip-all" onClick={onStart}>
              <span>See all<br />templates</span>
              <span className="home-strip-all-arrow" aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </section>

        <section className="home-track-section" aria-labelledby="home-track-label">
          <div className="home-track-copy">
            <span className="home-eyebrow" id="home-track-label">Job tracker</span>
            <h2 className="home-section-title">Know what&rsquo;s missing before you send it.</h2>
            <p className="home-track-text">
              Save every job you&rsquo;re applying to, paste its description, and link the resume you
              tailored for it. Draftly pulls the posting&rsquo;s key terms and shows which ones your
              resume already covers &mdash; and which it doesn&rsquo;t.
            </p>
            <div className="home-track-statuses">
              {DEMO_STATUSES.map((s) => (
                <span className="home-track-status" key={s}>{s}</span>
              ))}
            </div>
            <p className="home-track-note">
              A keyword scan, not an ATS simulation. It runs in your browser &mdash; the posting is
              never uploaded anywhere.
            </p>
          </div>

          <div className="home-track-demo" aria-hidden="true">
            <div className="home-track-demo-head">
              <span className="home-track-demo-score">{DEMO_MATCH.score}%</span>
              <span className="home-track-demo-label">
                keyword match &middot; {DEMO_MATCH.matched.length} of{' '}
                {DEMO_MATCH.matched.length + DEMO_MATCH.missing.length} terms found
              </span>
            </div>
            <div className="home-track-demo-group">
              <span className="home-track-demo-group-label">Missing from the resume</span>
              <div className="home-track-demo-chips">
                {DEMO_MATCH.missing.map((k) => (
                  <span className="home-track-chip home-track-chip-missing" key={k}>
                    <IconPlus size={11} />
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <div className="home-track-demo-group">
              <span className="home-track-demo-group-label">Already covered</span>
              <div className="home-track-demo-chips">
                {DEMO_MATCH.matched.map((k) => (
                  <span className="home-track-chip home-track-chip-matched" key={k}>
                    <IconCheck size={11} />
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-steps-section">
          <span className="home-eyebrow">How it works</span>
          <ol className="home-steps">
            <li className="home-step">
              <span className="home-step-num">01</span>
              <span className="home-step-text">Pick a template. Switch or recolor it anytime.</span>
            </li>
            <li className="home-step">
              <span className="home-step-num">02</span>
              <span className="home-step-text">Fill in your details, or paste an old resume to start.</span>
            </li>
            <li className="home-step">
              <span className="home-step-num">03</span>
              <span className="home-step-text">Export to PDF or DOCX, ready to send.</span>
            </li>
          </ol>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer-left">
          <Logo className="home-footer-logo" />
          <span className="home-footer-line">Built in Nairobi. Your data never leaves your browser.</span>
        </div>
        <nav className="home-footer-nav">
          <a href="#">Privacy</a>
          <a href="#">Templates</a>
          <a href="#">GitHub</a>
        </nav>
      </footer>
    </div>
  );
}
