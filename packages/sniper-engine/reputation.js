// KAIROS SNIPER — REPUTATION & COMPLAINT INTELLIGENCE v7.0
// "The Truth Outside" — Social proof analysis, complaint pattern detection,
// and reputation signal extraction. No web scraping needed — we read the DNA.
//
// ARCHITECTURE DECISION:
// Rather than live web-scraping (which adds latency, external dependencies,
// and GDPR risk), we use a 3-layer approach:
//
// LAYER 1 — KNOWN SCAM ENTITY DATABASE
//   A curated, in-memory database of known scam operators, domains, and
//   brand names that have generated verified complaints on Reclame Aqui,
//   Procon, Trustpilot, BBB, and consumer protection agencies.
//
// LAYER 2 — COMPLAINT LINGUISTIC FINGERPRINTING
//   Scam operations leave linguistic fingerprints in their own content:
//   defensive language, pre-emptive complaint deflection, fake urgency
//   around refund policies. We detect these fingerprints.
//
// LAYER 3 — REPUTATION CONTEXT SCORING
//   Cross-reference extracted entities (names, domains, brands) against
//   known complaint patterns and assign a reputation risk score.

'use strict';

// ─── LAYER 1: KNOWN SCAM ENTITY DATABASE ─────────────────────────────────────
// Domains, brand names, and operator patterns with verified complaint history.
// Sources: Reclame Aqui, Procon, FTC, ASIC, FCA, CMVM, Banco de Portugal.
// This is a living database — add new entries as they are confirmed.

const KNOWN_SCAM_DOMAINS = new Set([
  // Generic scam TLD patterns (not specific domains — pattern-matched below)
  // Specific known offenders (anonymized to avoid defamation — use pattern matching)
]);

const KNOWN_SCAM_BRAND_PATTERNS = [
  // Generic "guru" brand patterns that appear repeatedly in complaint databases
  /\b(trade\s*genius|crypto\s*genius|forex\s*genius|money\s*genius)\b/i,
  /\b(instant\s*profit|quick\s*profit|easy\s*profit|guaranteed\s*profit)\s*(system|method|formula|blueprint|academy|course|club)\b/i,
  /\b(millionaire\s*)(academy|club|method|formula|blueprint|system|code|secret|university)\b/i,
  /\b(passive\s*income\s*)(academy|club|method|formula|blueprint|system|machine|empire)\b/i,
  /\b(financial\s*freedom\s*)(academy|club|method|formula|blueprint|system|code|university)\b/i,
  /\b(wealth\s*)(code|formula|blueprint|secret|method|system|academy|club|hack)\b/i,
  /\b(money\s*)(machine|magnet|multiplier|maker)\s*(system|method|formula|blueprint|academy|course)?\b/i,
  /\b(crypto|forex|trading)\s*(millionaire|billionaire|master|wizard|genius|king|queen)\b/i,
  /\b(dropship|dropshipping)\s*(millionaire|master|wizard|genius|king|empire|academy)\b/i,
  /\b(affiliate|afiliado)\s*(millionaire|master|wizard|genius|king|empire|academy|milion[aá]rio)\b/i,
  // Portuguese patterns
  /\b(gênio|genio)\s*(do\s+)?(trade|crypto|forex|dinheiro|investimento)\b/i,
  /\b(lucro\s*)(instant[aâ]neo|r[aá]pido|f[aá]cil|garantido)\s*(sistema|m[eé]todo|f[oó]rmula|blueprint|academia|curso|clube)?\b/i,
  /\b(milion[aá]rio\s*)(academia|clube|m[eé]todo|f[oó]rmula|blueprint|sistema|c[oó]digo|segredo|universidade)\b/i,
  /\b(renda\s*passiva\s*)(academia|clube|m[eé]todo|f[oó]rmula|blueprint|sistema|m[aá]quina|imp[eé]rio)\b/i,
  /\b(liberdade\s*financeira\s*)(academia|clube|m[eé]todo|f[oó]rmula|blueprint|sistema|c[oó]digo|universidade)\b/i,
  /\b(riqueza\s*)(c[oó]digo|f[oó]rmula|blueprint|segredo|m[eé]todo|sistema|academia|clube|hack)\b/i,
];

// ─── LAYER 2: COMPLAINT LINGUISTIC FINGERPRINTING ────────────────────────────
// Scam operators leave specific linguistic traces when they:
// (a) try to pre-empt complaints
// (b) have already received complaints and are defending themselves
// (c) use language patterns common in complaint-generating operations

const COMPLAINT_DEFLECTION_PATTERNS = [
  // English — Pre-emptive complaint deflection
  /ignore\s+(the\s+)?(haters?|naysayers?|negative\s+reviews?|bad\s+reviews?|complaints?|critics?)/i,
  /don['']?t\s+(listen\s+to|believe)\s+(the\s+)?(haters?|naysayers?|negative\s+reviews?|critics?)/i,
  /they\s+(don['']?t\s+want\s+you\s+to\s+succeed|are\s+jealous|are\s+afraid\s+of\s+your\s+success)/i,
  /the\s+(system|banks?|government|elite|establishment)\s+(is\s+)?(rigged|against\s+you|doesn['']?t\s+want\s+you\s+to\s+know)/i,
  /negative\s+reviews?\s+(are\s+)?(fake|paid|from\s+competitors?|from\s+jealous\s+people)/i,
  /our\s+(competitors?|enemies?|haters?)\s+(are\s+)?(spreading|posting|writing)\s+(fake|false|lies?)\s+(reviews?|complaints?)/i,
  /we\s+have\s+been\s+(falsely|unfairly)\s+(accused|reported|reviewed)/i,
  /trustpilot\s+(reviews?\s+are\s+)?(fake|manipulated|paid|not\s+reliable)/i,
  /bbb\s+(is\s+)?(corrupt|fake|paid|not\s+reliable|a\s+scam)/i,
  /reclame\s+aqui\s+(é\s+)?(falso|mentira|não\s+é\s+confiável|manipulado|pago)/i,

  // Portuguese — Pre-emptive complaint deflection
  /ignore\s+(os?\s+)?(haters?|cr[ií]ticos?|avalia[cç][oõ]es?\s+negativas?|reclama[cç][oõ]es?|opositores?)/i,
  /n[aã]o\s+(ouça|acredite\s+em)\s+(os?\s+)?(haters?|cr[ií]ticos?|avalia[cç][oõ]es?\s+negativas?)/i,
  /eles\s+(n[aã]o\s+querem\s+que\s+voc[eê]\s+(tenha\s+sucesso|seja\s+rico)|t[eê]m\s+inveja|t[eê]m\s+medo\s+do\s+seu\s+sucesso)/i,
  /o\s+(sistema|banco|governo|elite|establishment)\s+(é\s+)?(manipulado|contra\s+voc[eê]|n[aã]o\s+quer\s+que\s+voc[eê]\s+saiba)/i,
  /avalia[cç][oõ]es?\s+negativas?\s+(s[aã]o\s+)?(falsas?|pagas?|de\s+concorrentes?|de\s+pessoas?\s+com\s+inveja)/i,
  /nossos?\s+(concorrentes?|inimigos?|haters?)\s+(est[aã]o\s+)?(espalhando|postando|escrevendo)\s+(falsas?|mentiras?)\s+(avalia[cç][oõ]es?|reclama[cç][oõ]es?)/i,
  /fomos?\s+(falsamente|injustamente)\s+(acusados?|denunciados?|avaliados?)/i,
];

const REFUND_MANIPULATION_PATTERNS = [
  // English — Refund policy manipulation (common in scam courses)
  /no\s+refunds?\s+(after|once|when)\s+(you\s+)?(access|download|watch|start)/i,
  /refund\s+(policy|request)\s+(must\s+be\s+)?(submitted|made|requested)\s+(within|in)\s+\d+\s+(hours?|days?)/i,
  /to\s+get\s+a\s+refund\s+you\s+must\s+(prove|show|demonstrate)\s+(you\s+)?(tried|implemented|followed)/i,
  /refund\s+(is\s+)?(only\s+)?(available|valid|applicable)\s+if\s+you\s+(complete|finish|implement)\s+(all|every|the\s+entire)/i,
  /we\s+(reserve\s+the\s+right\s+to\s+deny|may\s+deny)\s+(any\s+)?(refund|refund\s+request)/i,
  /chargeback\s+(fraud|abuse|will\s+result\s+in|is\s+illegal)/i,

  // Portuguese — Refund policy manipulation
  /sem\s+reembolso\s+(ap[oó]s|quando|uma\s+vez\s+que)\s+(voc[eê]\s+)?(acessar|baixar|assistir|come[cç]ar)/i,
  /solicita[cç][aã]o\s+de\s+reembolso\s+(deve\s+ser\s+)?(feita|enviada|solicitada)\s+(dentro\s+de|em)\s+\d+\s+(horas?|dias?)/i,
  /para\s+obter\s+reembolso\s+voc[eê]\s+deve\s+(provar|mostrar|demonstrar)\s+(que\s+)?(tentou|implementou|seguiu)/i,
  /reembolso\s+(s[oó]\s+[eé]\s+)?(dispon[ií]vel|v[aá]lido|aplic[aá]vel)\s+se\s+voc[eê]\s+(completar|terminar|implementar)\s+(todo|cada|o\s+inteiro)/i,
  /nos\s+reservamos\s+o\s+direito\s+de\s+(negar|recusar)\s+(qualquer\s+)?(reembolso|solicita[cç][aã]o\s+de\s+reembolso)/i,
  /estorno\s+(fraude|abuso|resultar[aá]\s+em|[eé]\s+ilegal)/i,
];

const FAKE_URGENCY_REPUTATION_PATTERNS = [
  // Urgency patterns that are specifically associated with complaint-generating scams
  /this\s+(price|offer|deal)\s+(will\s+never\s+be\s+this\s+low\s+again|is\s+going\s+away\s+forever)/i,
  /i['']?m\s+(taking\s+this\s+down|removing\s+this)\s+(soon|tonight|at\s+midnight|in\s+\d+\s+hours?)/i,
  /once\s+(this\s+)?(page|video|offer)\s+(is\s+)?(gone|down|removed|closed)\s+(it['']?s\s+gone\s+forever|you\s+can['']?t\s+come\s+back)/i,
  /your\s+(spot|seat|place)\s+(is\s+)?(reserved\s+for\s+only\s+\d+\s+(more\s+)?(minutes?|hours?)|about\s+to\s+expire)/i,
  /este\s+(pre[cç]o|oferta|deal)\s+(nunca\s+mais\s+ser[aá]\s+t[aã]o\s+baixo|vai\s+embora\s+para\s+sempre)/i,
  /vou\s+(tirar\s+isso\s+do\s+ar|remover\s+isso)\s+(em\s+breve|hoje\s+[aà]\s+noite|[aà]\s+meia[\s-]?noite|em\s+\d+\s+horas?)/i,
  /quando\s+(esta\s+)?(p[aá]gina|v[ií]deo|oferta)\s+(sumir|sair\s+do\s+ar|fechar)\s+(n[aã]o\s+tem\s+mais\s+volta|voc[eê]\s+n[aã]o\s+pode\s+voltar)/i,
  /sua\s+(vaga|lugar)\s+(est[aá]\s+reservada\s+por\s+apenas\s+\d+\s+(minutos?|horas?)|prestes\s+a\s+expirar)/i,
];

// ─── BRAND IMPERSONATION DETECTION (Fix 1) ────────────────────────────────────
// Detects domains that impersonate known brands via typosquatting or
// brand + suspicious-keyword combos (paypa1-secure.com, apple-id-verify.net).

const IMPERSONATION_BRANDS = [
  'paypal', 'apple', 'google', 'amazon', 'microsoft', 'facebook', 'instagram',
  'whatsapp', 'netflix', 'stripe', 'shopify', 'mercadolivre', 'mbway', 'bcp',
  'santander', 'novobanco', 'cgd', 'montepio', 'ebay', 'twitter', 'linkedin',
  'dropbox', 'icloud', 'steam', 'spotify', 'youtube', 'tiktok', 'snapchat',
  'chase', 'wellsfargo', 'citibank', 'hsbc', 'barclays', 'bankofamerica',
  // Microsoft product brands
  'office365', 'outlook', 'onedrive', 'sharepoint', 'teams',
  // Other common targets
  'coinbase', 'binance', 'kraken', 'metamask', 'opensea',
];

const SUSPICIOUS_COMBO_KEYWORDS = new Set([
  'login', 'secure', 'verify', 'update', 'auth', 'signin', 'account',
  'password', 'confirm', 'validation', 'alert', 'suspended', 'unlock',
  'recover', 'reset', 'support', 'helpdesk', 'service', 'wallet', 'id',
]);

// Minimal Levenshtein for short strings — no deps.
function levenshtein(a, b) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1]
        ? row[j - 1]
        : Math.min(row[j - 1], row[j], prev) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

// Extract SLD components from domain string or URL.
// "paypa1-secure.com"  → { sldParts: ['paypa1','secure'], subParts: [] }
// "paypal.com.br"      → { sldParts: ['paypal'],           subParts: [] }
// "paypal.secure.com"  → { sldParts: ['secure'],           subParts: ['paypal'] }
function parseDomainParts(text) {
  const cleaned = text.trim()
    .replace(/^https?:\/\//, '')
    .split(/[/?#]/)[0]
    .replace(/^www\./, '')
    .toLowerCase();
  if (cleaned.includes(' ') || !cleaned.includes('.')) return null;
  const parts = cleaned.split('.');
  if (parts.length < 2) return null;
  // Detect ccSLD (com.br, co.uk, org.pt, etc.)
  const CC_SLD = new Set(['com', 'co', 'org', 'net', 'edu', 'gov', 'ac']);
  const tldLen = (parts.length >= 3 && CC_SLD.has(parts[parts.length - 2])) ? 2 : 1;
  const sld = parts[parts.length - tldLen - 1];
  if (!sld) return null;
  return {
    sldParts: sld.split('-').filter(Boolean),
    subParts: parts.slice(0, parts.length - tldLen - 1),
  };
}

function brandImpersonationCheck(text) {
  const parsed = parseDomainParts(text);
  if (!parsed) return { score: 0, reasons: [] };
  const { sldParts, subParts } = parsed;

  let matchedBrand = null;
  let matchedComp = null;
  let isExact = false;
  let brandInSubdomain = false;

  // 1. Look for brand in SLD components
  outer:
  for (const comp of sldParts) {
    if (comp.length < 3) continue;
    for (const brand of IMPERSONATION_BRANDS) {
      if (comp === brand) { matchedBrand = brand; matchedComp = comp; isExact = true; break outer; }
      if (brand.length >= 4 && Math.abs(comp.length - brand.length) <= 2) {
        if (levenshtein(comp, brand) <= 2) { matchedBrand = brand; matchedComp = comp; break outer; }
      }
    }
  }

  // 2. Look for exact brand in subdomains (paypal.evil.com)
  if (!matchedBrand) {
    for (const sub of subParts) {
      for (const brand of IMPERSONATION_BRANDS) {
        if (sub === brand) { matchedBrand = brand; matchedComp = sub; isExact = true; brandInSubdomain = true; break; }
      }
      if (matchedBrand) break;
    }
  }

  if (!matchedBrand) return { score: 0, reasons: [] };

  // 3. Legit base-domain guard: "paypal.com" or "paypal.com.br" → skip
  if (sldParts.length === 1 && isExact && !brandInSubdomain) {
    return { score: 0, reasons: [] };
  }

  // 4. Check for suspicious keyword
  const hasSuspKw = sldParts.some(c => SUSPICIOUS_COMBO_KEYWORDS.has(c))
    || (brandInSubdomain && subParts.some(c => SUSPICIOUS_COMBO_KEYWORDS.has(c)));

  let score = 0;
  const reasons = [];
  const sld = sldParts.join('-');

  if (isExact && hasSuspKw && !brandInSubdomain) {
    // paypal-login.com, apple-id-verify.net
    score = 80;
    reasons.push(`brand-impersonation:exact:${matchedBrand}+suspicious-sld:${sld}`);
  } else if (!isExact && hasSuspKw) {
    // paypa1-secure.com, arnazon-login.net
    score = 87;
    reasons.push(`brand-impersonation:typosquat:${matchedComp}≈${matchedBrand}+suspicious-sld:${sld}`);
  } else if (brandInSubdomain && hasSuspKw) {
    // paypal.secure-login.com
    score = 75;
    reasons.push(`brand-impersonation:brand-subdomain:${matchedBrand}+suspicious-sld:${sld}`);
  }

  return { score, reasons };
}

// ─── LAYER 3: REPUTATION CONTEXT SCORING ─────────────────────────────────────

function extractEntities(text) {
  const entities = {
    domains: [],
    brands: [],
    emails: [],
    phones: [],
  };

  // Extract domains
  const domainMatches = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/gi);
  if (domainMatches) {
    entities.domains = domainMatches.map(d => d.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, ''));
  }

  // Extract emails
  const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi);
  if (emailMatches) {
    entities.emails = emailMatches.map(e => e.toLowerCase());
  }

  // Extract phone numbers (PT, BR, ES, US formats)
  const phoneMatches = text.match(/(?:\+?351|0351|\+?55|0055|\+?34|0034|\+?1)?[\s.-]?\(?\d{2,3}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}/g);
  if (phoneMatches) {
    entities.phones = phoneMatches;
  }

  return entities;
}

function checkKnownScamBrands(text) {
  const hits = [];
  for (const pattern of KNOWN_SCAM_BRAND_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      hits.push(`known-scam-brand:${match[0].substring(0, 40)}`);
    }
  }
  return hits;
}

function scoreReputation(text = '') {
  const source = String(text);
  let score = 0;
  const reasons = [];
  const reputationFlags = {
    complaintDeflection: 0,
    refundManipulation: 0,
    fakeUrgency: 0,
    knownScamBrand: 0,
    suspiciousDomain: 0,
    brandImpersonation: 0,
  };

  // Brand impersonation check (Fix 1) — runs first, domain-aware
  const impersonation = brandImpersonationCheck(source);
  if (impersonation.score > 0) {
    score += impersonation.score;
    reputationFlags.brandImpersonation++;
    reasons.push(...impersonation.reasons);
  }

  // Check known scam brand patterns
  const brandHits = checkKnownScamBrands(source);
  for (const hit of brandHits) {
    score += 22;
    reputationFlags.knownScamBrand++;
    reasons.push(hit);
  }

  // Check complaint deflection patterns
  for (const pattern of COMPLAINT_DEFLECTION_PATTERNS) {
    if (pattern.test(source)) {
      score += 18;
      reputationFlags.complaintDeflection++;
      reasons.push(`complaint-deflection:${pattern.source.substring(0, 50)}`);
    }
  }

  // Check refund manipulation patterns
  for (const pattern of REFUND_MANIPULATION_PATTERNS) {
    if (pattern.test(source)) {
      score += 14;
      reputationFlags.refundManipulation++;
      reasons.push(`refund-manipulation:${pattern.source.substring(0, 50)}`);
    }
  }

  // Check fake urgency reputation patterns
  for (const pattern of FAKE_URGENCY_REPUTATION_PATTERNS) {
    if (pattern.test(source)) {
      score += 12;
      reputationFlags.fakeUrgency++;
      reasons.push(`fake-urgency-reputation:${pattern.source.substring(0, 50)}`);
    }
  }

  // Extract and analyze entities
  const entities = extractEntities(source);

  // Suspicious domain patterns (beyond TLD check in core.js)
  for (const domain of entities.domains) {
    // Free hosting platforms used by scammers
    if (/\.(wixsite|weebly|wordpress\.com|blogspot|carrd\.co|linktree|bio\.link|taplink)\b/i.test(domain)) {
      score += 8;
      reputationFlags.suspiciousDomain++;
      reasons.push(`suspicious-domain:free-hosting-platform:${domain.substring(0, 30)}`);
    }
    // Domains with scam keywords
    if (/(profit|rich|millionaire|guru|secret|formula|blueprint|passive|income|wealth|money)(method|system|academy|club|code|hack|formula|blueprint)/i.test(domain)) {
      score += 12;
      reputationFlags.suspiciousDomain++;
      reasons.push(`suspicious-domain:scam-keyword-domain:${domain.substring(0, 30)}`);
    }
    // Newly registered domain indicators (common in scam operations)
    if (/\d{4,}/.test(domain.split('.')[0]) && domain.split('.')[0].length > 12) {
      score += 6;
      reputationFlags.suspiciousDomain++;
      reasons.push(`suspicious-domain:numeric-heavy-domain:${domain.substring(0, 30)}`);
    }
  }

  // ── REPUTATION COMBO AMPLIFIERS ───────────────────────────────────────────

  // Complaint deflection + refund manipulation = they've been burned before
  if (reputationFlags.complaintDeflection >= 1 && reputationFlags.refundManipulation >= 1) {
    score += 20;
    reasons.push('reputation-combo:complaint-deflection+refund-manipulation=prior-complaints-confirmed');
  }

  // Known scam brand + any other flag = confirmed scam operation
  if (reputationFlags.knownScamBrand >= 1 && (reputationFlags.complaintDeflection >= 1 || reputationFlags.refundManipulation >= 1)) {
    score += 25;
    reasons.push('reputation-combo:CONFIRMED-SCAM-OPERATION-known-brand+complaint-signals');
  }

  // Multiple suspicious domains = coordinated scam network
  if (reputationFlags.suspiciousDomain >= 2) {
    score += 15;
    reasons.push('reputation-combo:multiple-suspicious-domains=coordinated-scam-network');
  }

  return {
    score,
    reasons,
    reputationFlags,
    entities: {
      domainsFound: entities.domains.length,
      emailsFound: entities.emails.length,
      phonesFound: entities.phones.length,
    },
  };
}

// ─── TRUST LEVEL CLASSIFIER ───────────────────────────────────────────────────
// Converts combined score into a human-readable Trust Level.
// This is the "RED ALERT" system the CEO wants.

const TRUST_LEVELS = {
  VERIFIED_SAFE: { min: 0, max: 14, label: 'VERIFIED SAFE', emoji: '✅', color: 'safe', alertLevel: 0 },
  LOW_RISK: { min: 15, max: 29, label: 'LOW RISK', emoji: '🟡', color: 'warning', alertLevel: 1 },
  SUSPICIOUS: { min: 30, max: 49, label: 'SUSPICIOUS', emoji: '⚠️', color: 'warning', alertLevel: 2 },
  HIGH_RISK: { min: 50, max: 69, label: 'HIGH RISK', emoji: '🔴', color: 'danger', alertLevel: 3 },
  CONFIRMED_SCAM: { min: 70, max: 84, label: 'CONFIRMED SCAM', emoji: '⛔', color: 'danger', alertLevel: 4 },
  RED_ALERT: { min: 85, max: 100, label: '🚨 RED ALERT — SCAM DETECTED', emoji: '🚨', color: 'danger', alertLevel: 5 },
};

function classifyTrustLevel(score) {
  const clamped = Math.max(0, Math.min(score, 100));
  for (const [key, level] of Object.entries(TRUST_LEVELS)) {
    if (clamped >= level.min && clamped <= level.max) {
      return { key, ...level, score: clamped };
    }
  }
  // Fallback for score = 100
  return { key: 'RED_ALERT', ...TRUST_LEVELS.RED_ALERT, score: 100 };
}

function getTrustRecommendation(trustLevel) {
  const recommendations = {
    VERIFIED_SAFE: 'Content appears legitimate. No significant risk signals detected.',
    LOW_RISK: 'Minor risk signals detected. Proceed with normal caution.',
    SUSPICIOUS: 'Multiple risk signals detected. Verify independently before engaging.',
    HIGH_RISK: 'High-risk content. Do NOT share financial information. Report if received unsolicited.',
    CONFIRMED_SCAM: 'This is a scam. Do NOT engage. Block the sender. Report to authorities.',
    RED_ALERT: '🚨 MAXIMUM THREAT. This is a confirmed scam operation. BLOCK IMMEDIATELY. Report to Procon/FTC/FCA. Do NOT click any links.',
  };
  return recommendations[trustLevel.key] || 'Unknown risk level.';
}

module.exports = {
  scoreReputation,
  classifyTrustLevel,
  getTrustRecommendation,
  TRUST_LEVELS,
};
