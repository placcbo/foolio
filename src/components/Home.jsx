import { useState } from 'react';
import { Logo } from './Logo';
import { TEMPLATE_COMPONENTS } from './templates';
import { TEMPLATES } from '../data/templates';
import { TEMPLATE_SAMPLES } from '../data/templateSamples';
import { SAMPLE_RESUME } from '../data/sampleResume';
import { JOB_STATUSES } from './JobTracker';
import TemplateSlider from './TemplateSlider';
import { IconCheck, IconPlus, IconEyeOff, IconUser, IconBox, IconDownload, IconX } from './icons';

// Keep count-based copy honest by deriving it from the registered templates,
// so "fifteen" can't quietly drift out of sync as templates are added/removed.
const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two',
  'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven',
  'twenty-eight', 'twenty-nine', 'thirty',
];
function numberWord(n) {
  const w = NUMBER_WORDS[n];
  return w ? w[0].toUpperCase() + w.slice(1) : String(n);
}
const TEMPLATE_WORD = numberWord(TEMPLATES.length);

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
  ['No account to start', 'Start building right away — nothing to sign up for. Optional accounts to sync across devices are on the way.'],
  ['No watermarks', 'Your exports carry your name, not ours.'],
  ['Unlimited exports', 'Download as many PDFs and DOCX files as you want.'],
  [`${TEMPLATE_WORD} templates`, 'Switch design or recolor at any point without retyping.'],
  ['Import your old resume', 'Upload a PDF or Word file and it fills every section for you.'],
  ['Stays on your device', 'Your resume is saved in your browser, not on a server.'],
];

// The privacy story is this tool's real differentiator — everything, including
// importing a PDF/DOCX, runs in the browser. Every claim here is architectural
// (no server, no account, local storage), so it stays true as the app grows.
const PRIVACY_POINTS = [
  [
    IconEyeOff,
    'Nothing is uploaded today',
    'Editing, importing a PDF or Word file, and exporting all happen on your device. Right now your file’s contents never touch a server.',
  ],
  [
    IconUser,
    'No account to start',
    'You can build a full resume without signing up — no email, password, or profile required to begin.',
  ],
  [
    IconBox,
    'Saved locally, just for you',
    'Your work lives in this browser’s local storage, on this device. Cloud sync will be opt-in when it arrives.',
  ],
  [
    IconDownload,
    'You hold the only copy',
    'Export to PDF or DOCX anytime for your own backup — so a copy is always yours, whatever you sync later.',
  ],
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
    'Today, in your browser’s local storage on the device you built it on — it is never uploaded, and there is no server holding a copy. When optional accounts arrive, syncing to the cloud will be opt-in, and only for what you choose to save.',
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
    'Yes. Upload your existing PDF or Word file and Draftly reads it into editable sections — name, experience, skills and the rest — right in your browser, nothing uploaded. It flags anything it is unsure about so you can fix it in seconds. Prefer to paste plain text? That still works too.',
  ],
  [
    'Can I keep more than one resume?',
    'Yes. Keep a separate copy per role, duplicate one to tailor it, and link each to a job in the tracker.',
  ],
];

export default function Home({ onStart, onOpenTemplate, onSignIn, onSignUp, isAuthenticated }) {
  const featured = FEATURED_IDS
    .map((id) => TEMPLATES.find((t) => t.id === id))
    .filter(Boolean);

  // Accounts land with the backend later; until then the header's Sign in/up
  // show a "coming soon" note rather than a dead end.
  const [authNotice, setAuthNotice] = useState(false);
  const handleAuth = (handler) => () => (handler ? handler() : setAuthNotice(true));

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
              <button type="button" className="home-btn-ghost" onClick={handleAuth(onSignIn)}>
                Sign in
              </button>
              <button type="button" className="home-btn-solid" onClick={handleAuth(onSignUp)}>
                Sign up
              </button>
            </>
          )}
        </nav>
      </header>

      {authNotice && (
        <div className="home-auth-notice" role="status">
          <span>
            Accounts are coming soon. For now Draftly works fully without one &mdash; start building
            straight away, and your resume stays on this device.
          </span>
          <button
            type="button"
            className="home-auth-notice-close"
            onClick={() => setAuthNotice(false)}
            aria-label="Dismiss"
          >
            <IconX size={15} />
          </button>
        </div>
      )}

      <main className="home-main">
        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="home-eyebrow home-hero-eyebrow">Free online resume builder</span>
            {/* No hard <br /> — the copy column is narrower now that the shot
                sits beside it, so a forced break just produces ragged
                four-line wrapping at some widths. Let it break naturally. */}
            <h1 className="home-hero-title">Build a resume worth reading.</h1>
            <p className="home-hero-sub">
              {TEMPLATE_WORD} designs, real PDF and DOCX export, and an editor that stays out of your way.
              No signup to start building.
            </p>
            <div className="home-hero-cta">
              <button type="button" className="home-btn-solid home-btn-lg" onClick={onStart}>
                Build your resume
              </button>
              <span className="home-hero-note">Free to start &middot; no account needed today</span>
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
          <TemplateSlider templates={featured} onPick={onOpenTemplate} onSeeAll={onStart} />
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

        <section className="home-privacy-section home-reveal" aria-labelledby="home-privacy-label">
          <span className="home-eyebrow" id="home-privacy-label">Your data</span>
          <h2 className="home-section-title">Right now, your resume stays on your device.</h2>
          <p className="home-privacy-lead">
            Today Draftly runs entirely in your browser &mdash; no server holds a copy of your
            resume, and nothing you type or import is sent anywhere. Optional accounts that sync
            across devices are coming, and they&rsquo;ll be exactly that: opt-in, and only what you
            choose to save.
          </p>
          <ul className="home-privacy-grid">
            {PRIVACY_POINTS.map(([Icon, title, detail]) => (
              <li className="home-privacy-card" key={title}>
                <span className="home-privacy-icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span className="home-privacy-title">{title}</span>
                <span className="home-privacy-detail">{detail}</span>
              </li>
            ))}
          </ul>
          <p className="home-privacy-note">
            The trade-off of a local-first tool: until you opt into an account, clearing your browser
            clears the only copy there is &mdash; so export one to keep it safe.
          </p>
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
          <span className="home-footer-line">Built in Nairobi. Local-first today &mdash; optional sync coming.</span>
        </div>
        <nav className="home-footer-nav">
          <button type="button" onClick={onStart}>Templates</button>
          <a href="#home-faq-label">Privacy &amp; data</a>
        </nav>
      </footer>
    </div>
  );
}
