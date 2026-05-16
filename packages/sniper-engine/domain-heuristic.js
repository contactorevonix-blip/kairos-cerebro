// KAIROS SNIPER — Domain Name Heuristic v1.0
// Scores DOMAIN NAMES specifically for phishing/fraud signals.
// This layer runs before content analysis and catches cases where
// the domain name itself is the primary fraud signal.
//
// Detects:
//   - Brand impersonation (paypal-security.net, amaz0n.com)
//   - High-risk TLDs (.store, .shop, .club, etc.)
//   - Homograph attacks (0→o, 1→i, etc.)
//   - Suspicious keyword combinations in domain names
//   - Structural abuse (excessive hyphens, very long domains)

'use strict';

// ─── HIGH-RISK TLDS (common in phishing campaigns) ────────────────────────────
// Source: APWG eCrime reports, SURBL, Spamhaus
const HIGH_RISK_TLDS = new Set([
  // Commercial abuse TLDs (cheap, unregulated)
  '.store', '.shop', '.click', '.loan', '.work',
  '.club', '.online', '.site', '.website', '.space',
  '.fun', '.vip', '.trade', '.bid', '.link', '.win',
  '.download', '.review', '.stream', '.party', '.men',
  '.accountant', '.science', '.racing', '.date', '.faith',
  '.country', '.cricket', '.webcam', '.gdn', '.ice',
  // Free/abused TLDs (historically high phishing rate)
  '.gq', '.tk', '.ml', '.cf', '.ga',
  // New gTLDs abused heavily
  '.xyz', '.top', '.icu', '.cyou', '.cfd', '.sbs',
]);

// ─── MEDIUM-RISK TLDS ─────────────────────────────────────────────────────────
const MEDIUM_RISK_TLDS = new Set([
  '.info', '.biz', '.mobi', '.name', '.pro',
  '.pw', '.cc', '.ws', '.in', '.ru', '.cn',
]);

// ─── IMPERSONATED BRANDS (top phishing targets) ───────────────────────────────
// Each entry: { name, legit } where legit = the only legitimate domain
const BRANDS = [
  // Financial
  { name: 'paypal',         legit: ['paypal.com', 'paypal.me'] },
  { name: 'stripe',         legit: ['stripe.com'] },
  { name: 'wise',           legit: ['wise.com'] },
  { name: 'revolut',        legit: ['revolut.com'] },
  { name: 'cash',           legit: ['cash.app'] },
  { name: 'venmo',          legit: ['venmo.com'] },
  { name: 'zelle',          legit: ['zellepay.com'] },
  { name: 'chase',          legit: ['chase.com'] },
  { name: 'barclays',       legit: ['barclays.co.uk', 'barclays.com'] },
  { name: 'hsbc',           legit: ['hsbc.com', 'hsbc.co.uk'] },
  { name: 'wellsfargo',     legit: ['wellsfargo.com'] },
  { name: 'bankofamerica',  legit: ['bankofamerica.com'] },
  { name: 'citibank',       legit: ['citibank.com', 'citi.com'] },
  // E-commerce
  { name: 'amazon',         legit: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.es', 'amazon.it', 'amazon.pt'] },
  { name: 'shopify',        legit: ['shopify.com', 'myshopify.com'] },
  { name: 'ebay',           legit: ['ebay.com', 'ebay.co.uk', 'ebay.de'] },
  { name: 'aliexpress',     legit: ['aliexpress.com'] },
  { name: 'etsy',           legit: ['etsy.com'] },
  // Tech giants
  { name: 'microsoft',      legit: ['microsoft.com', 'microsoft.net', 'microsoftonline.com', 'office.com', 'live.com', 'outlook.com'] },
  { name: 'apple',          legit: ['apple.com', 'icloud.com', 'itunes.com'] },
  { name: 'google',         legit: ['google.com', 'gmail.com', 'googlemail.com', 'google.co.uk', 'google.de', 'google.fr', 'google.pt'] },
  { name: 'facebook',       legit: ['facebook.com', 'fb.com', 'messenger.com', 'meta.com'] },
  { name: 'instagram',      legit: ['instagram.com'] },
  { name: 'linkedin',       legit: ['linkedin.com'] },
  { name: 'twitter',        legit: ['twitter.com', 'x.com', 't.co'] },
  { name: 'netflix',        legit: ['netflix.com', 'netflix.net'] },
  { name: 'spotify',        legit: ['spotify.com'] },
  { name: 'dropbox',        legit: ['dropbox.com'] },
  // Crypto (high-value phishing targets)
  { name: 'coinbase',       legit: ['coinbase.com'] },
  { name: 'binance',        legit: ['binance.com'] },
  { name: 'metamask',       legit: ['metamask.io'] },
  { name: 'opensea',        legit: ['opensea.io'] },
  { name: 'uniswap',        legit: ['uniswap.org'] },
  // Dev tools
  { name: 'github',         legit: ['github.com', 'githubusercontent.com', 'github.io'] },
  { name: 'vercel',         legit: ['vercel.com', 'vercel.app'] },
  { name: 'railway',        legit: ['railway.app'] },
  { name: 'supabase',       legit: ['supabase.com', 'supabase.io'] },
];

// ─── SUSPICIOUS KEYWORDS IN DOMAIN NAMES ─────────────────────────────────────
// These words in a domain name raise the risk signal
const HIGH_RISK_DOMAIN_KEYWORDS = [
  'security', 'secure', 'alert', 'verify', 'verification',
  'confirm', 'suspended', 'blocked', 'limited', 'restore',
  'recovery', 'unlock', 'urgent', 'helpdesk', 'support',
  'refund', 'claim', 'reward', 'airdrop', 'giveaway',
  'wallet', 'signin', 'login', 'password', 'credential',
  'update', 'upgrade', 'renewal', 'reactivate', 'validate',
  'penalty', 'notice', 'warning', 'invoice', 'billing',
];

const MEDIUM_RISK_DOMAIN_KEYWORDS = [
  'free', 'winner', 'prize', 'bonus', 'cashback',
  'discount', 'deal', 'offer', 'promo', 'exclusive',
  'customer', 'service', 'center', 'centre', 'portal',
  'manager', 'official', 'admin', 'help',
];

// ─── HOMOGRAPH SUBSTITUTIONS ──────────────────────────────────────────────────
// Digit '1' can look like 'i' OR 'l' — try both variants to catch all lookalikes
const HOMOGRAPH_MAPS = [
  { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '6': 'b', '8': 'b', '@': 'a', 'vv': 'w', 'rn': 'm' },
  { '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '6': 'b', '8': 'b', '@': 'a', 'vv': 'w', 'rn': 'm' },
];

function normaliseHomographs(s) {
  return HOMOGRAPH_MAPS.map(map => {
    let r = s;
    for (const [fake, real] of Object.entries(map)) r = r.split(fake).join(real);
    return r;
  });
}

// Returns true if the normalised SLD contains the real brand name.
// Works because normaliseHomographs() replaces fake chars (0→o, 1→l/i) with real ones,
// so 'amaz0n' → 'amazon', 'paypa1' → 'paypal', and we then look for the brand string.
function sldContainsBrand(sld, brandName) {
  return normaliseHomographs(sld).some(norm => norm.includes(brandName));
}

// ─── DISPOSABLE EMAIL PROVIDERS (#31) ────────────────────────────────────────
const DISPOSABLE_PROVIDERS = new Set([
  'temp-mail.org','guerrillamail.com','mailinator.com','throwaway.email',
  'fakesmtp.com','yopmail.com','sharklasers.com','guerrillamailblock.com',
  'grr.la','guerrillamail.info','trashmail.com','tempmail.com','maildrop.cc',
  'dispostable.com','spamgourmet.com','trashmail.me','getairmail.com',
  'tempr.email','discard.email','spamfree24.org','spam4.me','binkmail.com',
  'spamdecoy.net','mailnull.com','spammotel.com','mailnesia.com',
  'spamgourmet.net','spamgourmet.org','0-mail.com','0clickemail.com',
]);

function scoreEmailDomain(email) {
  if (!email || !String(email).includes('@')) return { score: 0, reasons: [] };
  const domain = String(email).split('@').pop().toLowerCase().trim();
  const reasons = [];
  let score = 0;
  if (DISPOSABLE_PROVIDERS.has(domain)) {
    score += 55;
    reasons.push(`email:disposable-provider:${domain}`);
  }
  // Also score the domain part
  const domainScore = scoreDomainName(domain);
  if (domainScore.score > 0) {
    score = Math.min(100, score + Math.round(domainScore.score * 0.5));
    reasons.push(...domainScore.reasons.map(r => 'email-domain:' + r));
  }
  return { score: Math.min(score, 100), reasons };
}

// ─── MAIN SCORER ─────────────────────────────────────────────────────────────

function scoreDomainName(domain) {
  if (!domain || typeof domain !== 'string') return { score: 0, reasons: [] };

  const raw = domain.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0];
  const lastDot = raw.lastIndexOf('.');
  const tld = lastDot >= 0 ? raw.slice(lastDot) : '';
  const sld = lastDot >= 0 ? raw.slice(0, lastDot) : raw; // everything before the TLD
  // sldNorm variants computed on-demand via sldContainsBrand()

  let score = 0;
  const reasons = [];

  // ── 1. TLD risk ─────────────────────────────────────────────────────────────
  if (HIGH_RISK_TLDS.has(tld)) {
    score += 25;
    reasons.push(`domain:high-risk-tld:${tld}`);
  } else if (MEDIUM_RISK_TLDS.has(tld)) {
    score += 10;
    reasons.push(`domain:medium-risk-tld:${tld}`);
  }

  // ── 2. Brand impersonation ───────────────────────────────────────────────────
  for (const brand of BRANDS) {
    const inRaw      = sld.includes(brand.name);
    const inHomograph = !inRaw && sldContainsBrand(sld, brand.name);

    if (inRaw || inHomograph) {
      const isLegit = brand.legit.some(l => raw === l || raw.endsWith('.' + l));
      if (!isLegit) {
        score += inHomograph ? 50 : 35;
        reasons.push(`domain:brand-impersonation:${brand.name}${inHomograph ? ':homograph' : ''}`);
        break;
      }
    }
  }

  // ── 3. Suspicious keyword combinations in SLD ────────────────────────────────
  const highKwHits = HIGH_RISK_DOMAIN_KEYWORDS.filter(kw => sld.includes(kw));
  const medKwHits  = MEDIUM_RISK_DOMAIN_KEYWORDS.filter(kw => sld.includes(kw));

  if (highKwHits.length >= 2) {
    score += 22;
    reasons.push(`domain:suspicious-keyword-combo:${highKwHits.slice(0, 3).join('+')}`);
  } else if (highKwHits.length === 1) {
    score += 10;
    reasons.push(`domain:suspicious-keyword:${highKwHits[0]}`);
  }

  if (medKwHits.length >= 2) {
    score += 8;
    reasons.push(`domain:medium-keyword-combo:${medKwHits.slice(0, 3).join('+')}`);
  }

  // ── 4. Structural abuse ──────────────────────────────────────────────────────
  const hyphenCount = (sld.match(/-/g) || []).length;
  if (hyphenCount >= 4) {
    score += 18;
    reasons.push(`domain:excessive-hyphens:${hyphenCount}`);
  } else if (hyphenCount >= 2) {
    score += 8;
    reasons.push(`domain:multiple-hyphens:${hyphenCount}`);
  }

  // Very long domain name (obfuscation / typosquatting)
  if (raw.length > 40) {
    score += 12;
    reasons.push(`domain:very-long:${raw.length}-chars`);
  } else if (raw.length > 25) {
    score += 5;
    reasons.push(`domain:long:${raw.length}-chars`);
  }

  // ── 5. Combo amplifiers ──────────────────────────────────────────────────────
  const hasBrand   = reasons.some(r => r.includes('brand-impersonation'));
  const hasHighKw  = highKwHits.length > 0;
  const hasHighTld = reasons.some(r => r.includes('high-risk-tld'));

  if (hasBrand && hasHighKw) {
    score += 15;
    reasons.push('domain:combo-brand+keyword:PHISHING-PATTERN');
  }
  if (hasBrand && hasHighTld) {
    score += 10;
    reasons.push('domain:combo-brand+tld:HIGH-CONFIDENCE-PHISHING');
  }
  if (hasBrand && hasHighKw && hasHighTld) {
    score += 10;
    reasons.push('domain:combo-brand+keyword+tld:CONFIRMED-PHISHING');
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    reasons,
  };
}

module.exports = { scoreDomainName, scoreEmailDomain, DISPOSABLE_PROVIDERS };
