import { Logo } from './Logo';
import { TEMPLATE_COMPONENTS } from './templates';
import { TEMPLATES } from '../data/templates';
import { TEMPLATE_SAMPLES } from '../data/templateSamples';
import { SAMPLE_RESUME } from '../data/sampleResume';
import { JOB_STATUSES } from './JobTracker';
import TemplateSlider from './TemplateSlider';
import { IconCheck, IconPlus } from './icons';

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

// The hero shows the product rather than describing it. Lens is the pick
// because its sample carries a real headshot in the header band — a resume
// with a face on it reads as a person's document at a glance, where a wall
// of grey text just reads as filler. Its big name/photo lockup also survives
// being scaled down, which the denser text-only templates don't. Only
// 'lens' and 'portrait' support photos at all; Portrait puts its photo in a
// sidebar rather than the header.
const HERO_TEMPLATE_ID = 'lens';

// Claims the app can actually stand behind today. Deliberately no
// "free forever" — auth and a backend are coming, and copy written now
// shouldn't become a lie later.
const BENEFITS = [
  ['No account needed', 'Start building immediately. Nothing to sign up for.'],
  ['No watermarks', 'Your exports carry your name, not ours.'],
  ['Unlimited exports', 'Download as many PDFs and DOCX files as you want.'],
  ['Fifteen templates', 'Switch design or recolor at any point without retyping.'],
  ['Bring an old resume', 'Paste in plain text and it fills the sections for you.'],
  ['Stays on your device', 'Your resume is saved in your browser, not on a server.'],
];

// Honest answers to the questions a no-account, browser-only tool actually
// raises — especially the one most builders skip: what happens when the
// browser is cleared.
const FAQS = [
  [
    'Is it really free?',
    'Yes. You can build a resume and export it as a PDF or DOCX without an account and without paying. There are no watermarks and no export limits.',
  ],
  [
    'Where is my resume stored?',
    'In your browser’s local storage, on the device you built it on. It is never uploaded — there is no server holding a copy of it.',
  ],
  [
    'What if I clear my browser or switch devices?',
    'Your resume would be gone, because the browser is the only place it lives. Export a copy whenever you finish a session. Optional accounts that sync across devices are on the way.',
  ],
  [
    'Will it get through an applicant tracking system?',
    'Exports are real, selectable text — not a screenshot of a resume — so parsers can read them. No builder can promise a specific ATS will score you well, but the file itself won’t be the problem.',
  ],
  [
    'Can I import a resume I already have?',
    'Yes. Paste it in as plain text and Draftly splits it into sections you can edit. Copy out of Word, Google Docs, or an existing PDF.',
  ],
  [
    'Can I keep more than one resume?',
    'Yes. Keep a separate copy per role, duplicate one to tailor it, and link each to a job in the tracker.',
  ],
];

export default function Home({ onStart, onSelectTemplate, onSignIn, onSignUp, isAuthenticated }) {
  const featured = FEATURED_IDS
    .map((id) => TEMPLATES.find((t) => t.id === id))
    .filter(Boolean);

  const heroTemplate = TEMPLATES.find((t) => t.id === HERO_TEMPLATE_ID);
  const HeroTemplate = heroTemplate ? TEMPLATE_COMPONENTS[heroTemplate.layout] : null;
  const heroResume = heroTemplate
    ? {
        ...(TEMPLATE_SAMPLES[heroTemplate.id] || SAMPLE_RESUME),
        templateId: heroTemplate.layout,
        accentColor: heroTemplate.swatches[0],
      }
    : null;

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
          <div className="home-hero-copy">
            <span className="home-eyebrow home-hero-eyebrow">Free online resume builder</span>
            {/* No hard <br /> — the copy column is narrower now that the shot
                sits beside it, so a forced break just produces ragged
                four-line wrapping at some widths. Let it break naturally. */}
            <h1 className="home-hero-title">Build a resume worth reading.</h1>
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
          </div>

          <div className="home-hero-shot" aria-hidden="true">
            <div className="home-hero-shot-paper">
              <div className="home-hero-shot-scale">
                {heroTemplate && (
                  <HeroTemplate resume={heroResume} accentColor={heroResume.accentColor} />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="home-strip-section">
          <TemplateSlider templates={featured} onPick={onSelectTemplate} onSeeAll={onStart} />
        </section>

        <section className="home-track-section home-reveal" aria-labelledby="home-track-label">
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

        <section className="home-steps-section home-reveal">
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
        <section className="home-benefits-section home-reveal" aria-labelledby="home-benefits-label">
          <span className="home-eyebrow" id="home-benefits-label">What you get</span>
          <h2 className="home-section-title">No account, no watermark, no catch.</h2>
          <ul className="home-benefits">
            {BENEFITS.map(([title, detail]) => (
              <li className="home-benefit" key={title}>
                <span className="home-benefit-icon" aria-hidden="true">
                  <IconCheck size={13} />
                </span>
                <span className="home-benefit-body">
                  <span className="home-benefit-title">{title}</span>
                  <span className="home-benefit-detail">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="home-faq-section home-reveal" aria-labelledby="home-faq-label">
          <span className="home-eyebrow" id="home-faq-label">Questions</span>
          <h2 className="home-section-title">Before you start.</h2>
          <div className="home-faq">
            {FAQS.map(([q, a]) => (
              <details className="home-faq-item" key={q}>
                <summary className="home-faq-q">
                  {q}
                  <span className="home-faq-marker" aria-hidden="true" />
                </summary>
                <p className="home-faq-a">{a}</p>
              </details>
            ))}
          </div>
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
