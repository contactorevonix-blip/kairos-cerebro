// KAIROS Engine — Character N-gram Fuzzy Fingerprint
// Catches NOVEL scams that use the same playbook but different surface words.
// Compares the input text against a curated corpus of confirmed-scam excerpts
// using cosine similarity over normalized 4-gram TF profiles.
//
// Why character n-grams (not words)?
//   - language-agnostic (PT/EN/ES/DE/FR collapse to the same space)
//   - robust to obfuscation (zero-width chars, leet, accents)
//   - cheap (no model, no embeddings, no GPU)

'use strict';

const N = 4;
const MIN_TEXT_LEN = 30;

const CORPUS = [
  // Each entry is a fingerprint of a confirmed-scam playbook. Keep them
  // intentionally short and focused on STRUCTURE, not brand.
  {
    id: 'guru-passive-income',
    family: 'guru-course-pyramid',
    excerpt: 'metodo secreto comprovado garante lucro mensal sem trabalhar quit your job financial freedom guaranteed passive income copy paste system limited spots vagas limitadas',
  },
  {
    id: 'crypto-doubler',
    family: 'crypto-pump',
    excerpt: 'send btc eth usdt receive double instant guaranteed return 200% in 24 hours airdrop claim now exclusive whitelist limited supply',
  },
  {
    id: 'romance-pig-butchering',
    family: 'romance-pig-butchering',
    excerpt: 'i found great investment platform special access only for friends my uncle works there guaranteed return trust me deposit small amount first see results',
  },
  {
    id: 'fake-support',
    family: 'phishing-impersonation',
    excerpt: 'we detected suspicious activity on your account verify your identity click here urgent confirm your password account will be suspended ignore previous emails',
  },
  {
    id: 'fake-marketplace',
    family: 'fake-marketplace-checkout',
    excerpt: 'limited stock only few left today special discount 80% off pay with crypto western union gift card no refunds order ships next day',
  },
  {
    id: 'mlm-recruit',
    family: 'guru-course-pyramid',
    excerpt: 'join my team build downline get 5 levels deep passive income recruit your friends financial freedom mentor system proven plan',
  },
  {
    id: 'binary-options',
    family: 'crypto-pump',
    excerpt: 'binary options secret signal 95% accurate professional trader follow my calls deposit minimum 250 dollars guaranteed profits exclusive trading group',
  },
  {
    id: 'investment-guru',
    family: 'guru-course-pyramid',
    excerpt: 'turn 100 into 10000 in 30 days proven strategy ex hedge fund manager exclusive masterclass act now seats filling fast bonuses worth 5000',
  },
];

function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[\W_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ngramTf(text, n = N) {
  const normalized = normalize(text);
  const tf = new Map();
  if (normalized.length < n) return tf;
  for (let i = 0; i <= normalized.length - n; i++) {
    const gram = normalized.substring(i, i + n);
    tf.set(gram, (tf.get(gram) || 0) + 1);
  }
  return tf;
}

function dot(a, b) {
  let s = 0;
  const small = a.size < b.size ? a : b;
  const big = a.size < b.size ? b : a;
  for (const [k, v] of small) {
    const w = big.get(k);
    if (w) s += v * w;
  }
  return s;
}

function magnitude(a) {
  let s = 0;
  for (const v of a.values()) s += v * v;
  return Math.sqrt(s);
}

function cosine(a, b) {
  const ma = magnitude(a);
  const mb = magnitude(b);
  if (ma === 0 || mb === 0) return 0;
  return dot(a, b) / (ma * mb);
}

const PRECOMPUTED = CORPUS.map((entry) => ({
  ...entry,
  tf: ngramTf(entry.excerpt),
}));

function scoreNgramSimilarity(text) {
  const reasons = [];
  const matches = [];
  const safe = String(text);
  if (safe.length < MIN_TEXT_LEN) {
    return { score: 0, reasons, topMatch: null, matches };
  }
  const tf = ngramTf(safe);
  let topSim = 0;
  let topId = null;
  let topFamily = null;
  for (const entry of PRECOMPUTED) {
    const sim = cosine(tf, entry.tf);
    if (sim > 0.12) {
      matches.push({ id: entry.id, family: entry.family, similarity: Number(sim.toFixed(4)) });
    }
    if (sim > topSim) {
      topSim = sim;
      topId = entry.id;
      topFamily = entry.family;
    }
  }
  // Score curve: <0.18 → 0 ; 0.18..0.40 → 0..40 (linear)
  let score = 0;
  if (topSim >= 0.18) {
    score = Math.min(40, Math.round(((topSim - 0.18) / 0.22) * 40));
    reasons.push(`ngram-fuzzy-match:${topId}:family=${topFamily}:sim=${topSim.toFixed(3)}`);
  }
  matches.sort((a, b) => b.similarity - a.similarity);
  return {
    score,
    reasons,
    topMatch: topId ? { id: topId, family: topFamily, similarity: Number(topSim.toFixed(4)) } : null,
    matches: matches.slice(0, 5),
  };
}

module.exports = {
  scoreNgramSimilarity,
  ngramTf,
  cosine,
  normalize,
  CORPUS,
};
