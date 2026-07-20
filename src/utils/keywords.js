// ---------------------------------------------------------------------------
// Local keyword matching — runs entirely in the browser, no backend.
//
// This is a pragmatic keyword scan, not an ATS simulation: it pulls the most
// frequent meaningful words and two-word phrases out of a pasted job
// description, then checks which appear anywhere in the resume's text. Good
// enough to surface real gaps ("the JD says Kubernetes eight times and your
// CV never does"); the UI copy should stay honest about what it is.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(
  (
    'a,an,the,and,or,for,with,you,your,yours,we,our,us,will,are,is,be,being,been,to,of,in,on,as,at,by,' +
    'from,it,its,their,they,them,this,that,these,those,have,has,had,do,does,can,could,should,would,may,' +
    'must,not,but,if,then,than,more,most,other,into,over,under,about,across,within,per,via,etc,eg,ie,' +
    'who,what,when,where,why,how,all,any,each,both,such,own,same,so,too,very,just,also,well,while,out,' +
    'up,down,able,ability,abilities,strong,excellent,good,great,solid,proven,demonstrated,experience,' +
    'experiences,experienced,years,year,work,working,works,worked,team,teams,skills,skill,including,' +
    'include,includes,included,plus,preferred,required,require,requires,requirements,responsibility,' +
    'responsibilities,responsible,role,roles,job,jobs,position,positions,company,candidate,candidates,' +
    'ideal,join,looking,seek,seeking,knowledge,understanding,familiarity,background,related,relevant,' +
    'new,day,daily,help,helping,ensure,ensuring,using,use,used,uses,make,making,part,one,two,like,' +
    'benefits,salary,apply,application,opportunity,opportunities,environment,ways,way'
  ).split(',')
);

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[-./]+|[-./]+$/g, ''))
    .filter(Boolean);
}

// Ranked list of the JD's most meaningful terms: frequent unigrams plus
// two-word phrases that repeat (phrases get a frequency boost so "customer
// support" outranks "customer" and "support" separately, and unigrams
// already covered by a chosen phrase are skipped).
export function extractKeywords(jdText, limit = 24) {
  const tokens = tokenize(jdText);

  const uni = new Map();
  tokens.forEach((t) => {
    if (t.length < 3 || STOPWORDS.has(t) || /^\d+$/.test(t)) return;
    uni.set(t, (uni.get(t) || 0) + 1);
  });

  const bi = new Map();
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (a.length < 3 || b.length < 3 || STOPWORDS.has(a) || STOPWORDS.has(b)) continue;
    if (/^\d+$/.test(a) || /^\d+$/.test(b)) continue;
    const phrase = `${a} ${b}`;
    bi.set(phrase, (bi.get(phrase) || 0) + 1);
  }

  const phrases = [...bi.entries()].filter(([, n]) => n >= 2).map(([term, n]) => ({ term, n: n * 2 }));
  const words = [...uni.entries()].map(([term, n]) => ({ term, n }));

  const chosen = [];
  const seen = new Set();
  [...phrases, ...words]
    .sort((x, y) => y.n - x.n)
    .forEach(({ term }) => {
      if (chosen.length >= limit || seen.has(term)) return;
      if (!term.includes(' ') && chosen.some((c) => c.includes(' ') && c.split(' ').includes(term))) return;
      seen.add(term);
      chosen.push(term);
    });

  return chosen;
}

// Everything a resume says, flattened into one lowercase string —
// basics, section titles, text content, tags (grouped or flat), and every
// entry's fields, with HTML stripped.
export function resumeToText(resume) {
  const parts = [];
  const b = resume?.basics || {};
  parts.push(b.name, b.title, b.address);

  (resume?.sections || []).forEach((s) => {
    parts.push(s.title);
    if (s.kind === 'text') parts.push(String(s.content || '').replace(/<[^>]*>/g, ' '));
    if (s.kind === 'tags') {
      (s.tags || []).forEach((t) => parts.push(t));
      (s.groups || []).forEach((g) => {
        parts.push(g.label);
        (g.tags || []).forEach((t) => parts.push(t));
      });
    }
    (s.entries || []).forEach((e) => {
      if (e.hidden) return;
      parts.push(e.heading, e.subheading, e.location, String(e.description || '').replace(/<[^>]*>/g, ' '));
    });
  });

  return parts.filter(Boolean).join(' ').toLowerCase();
}

export function matchKeywords(jdText, resume) {
  if (!jdText || !jdText.trim() || !resume) return null;
  const keywords = extractKeywords(jdText);
  if (!keywords.length) return null;

  const text = resumeToText(resume);
  const matched = [];
  const missing = [];
  keywords.forEach((k) => (text.includes(k) ? matched : missing).push(k));

  return {
    matched,
    missing,
    total: keywords.length,
    score: Math.round((matched.length / keywords.length) * 100),
  };
}