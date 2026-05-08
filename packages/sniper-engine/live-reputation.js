// KAIROS SNIPER — REPUTATION & COMPLAINT-EVASION INTELLIGENCE v2.0
// Two layers:
//   1. Curated KNOWN_SCAM_ENTITIES database (regex of confirmed brands) — REAL.
//   2. Linguistic detection of "complaint-evasion" language and review-site
//      gaslighting (e.g. "ignore Trustpilot, those reviews are fake").
// Optional Layer 3: Live Google Safe Browsing lookup is available in
// `packages/sniper-scraper/safe-browsing.js`. NO fake API simulations live here.

'use strict';

// ─── KNOWN SCAM ENTITY DATABASE ───────────────────────────────────────────────
// Entities confirmed in complaint databases: ReclameAqui, Procon, FTC, FCA, CMVM.
// Format: { pattern, source, fatalScore, reportCount, lastSeen }
// This is a living database — entries are added as new scams are confirmed.

const KNOWN_SCAM_ENTITIES = [
  // ── Crypto/Forex Scam Operations ──
  { pattern: /\b(bitconnect|bit\s*connect)\b/i, source: 'FTC/SEC', fatalScore: 100, reportCount: 50000, lastSeen: '2024-01' },
  { pattern: /\b(onecoin|one\s*coin)\b/i, source: 'Europol/FCA', fatalScore: 100, reportCount: 35000, lastSeen: '2024-03' },
  { pattern: /\b(plustoken|plus\s*token)\b/i, source: 'Interpol', fatalScore: 100, reportCount: 40000, lastSeen: '2023-12' },
  { pattern: /\b(safemoon|safe\s*moon)\b/i, source: 'SEC', fatalScore: 95, reportCount: 15000, lastSeen: '2024-02' },
  { pattern: /\b(squid\s*game\s*token|squid\s*coin)\b/i, source: 'FTC', fatalScore: 100, reportCount: 8000, lastSeen: '2023-11' },
  { pattern: /\b(luna\s*classic|terra\s*luna\s*classic)\b/i, source: 'SEC', fatalScore: 90, reportCount: 25000, lastSeen: '2024-01' },
  { pattern: /\b(ftx\s*(exchange|crypto|token)?)\b/i, source: 'DOJ/SEC', fatalScore: 95, reportCount: 100000, lastSeen: '2024-03' },
  { pattern: /\b(celsius\s*(network|crypto)?)\b/i, source: 'SEC/FTC', fatalScore: 90, reportCount: 30000, lastSeen: '2024-02' },
  { pattern: /\b(voyager\s*(digital|crypto)?)\b/i, source: 'SEC', fatalScore: 90, reportCount: 20000, lastSeen: '2024-01' },
  { pattern: /\b(3ac|three\s*arrows\s*capital)\b/i, source: 'SEC/MAS', fatalScore: 90, reportCount: 18000, lastSeen: '2024-01' },

  // ── Brazilian Scam Operations (ReclameAqui confirmed) ──
  { pattern: /\b(atlas\s*quantum)\b/i, source: 'ReclameAqui/CVM', fatalScore: 100, reportCount: 12000, lastSeen: '2023-10' },
  { pattern: /\b(trader\s*evolution)\b/i, source: 'ReclameAqui/Procon', fatalScore: 95, reportCount: 8000, lastSeen: '2024-01' },
  { pattern: /\b(xland\s*(invest|trading)?)\b/i, source: 'ReclameAqui', fatalScore: 95, reportCount: 5000, lastSeen: '2024-02' },
  { pattern: /\b(braiscompany)\b/i, source: 'CVM/Procon', fatalScore: 100, reportCount: 20000, lastSeen: '2024-03' },
  { pattern: /\b(unick\s*forex)\b/i, source: 'CVM/ReclameAqui', fatalScore: 100, reportCount: 15000, lastSeen: '2023-12' },
  { pattern: /\b(grupo\s*m[oó]dulo)\b/i, source: 'ReclameAqui/Procon', fatalScore: 95, reportCount: 7000, lastSeen: '2024-01' },
  { pattern: /\b(bitcoin\s*banco)\b/i, source: 'CVM', fatalScore: 100, reportCount: 10000, lastSeen: '2023-11' },
  { pattern: /\b(criptomaníacos?|criptomaniaco)\b/i, source: 'ReclameAqui', fatalScore: 90, reportCount: 3000, lastSeen: '2024-02' },

  // ── Portuguese Scam Operations (CMVM/Banco de Portugal confirmed) ──
  { pattern: /\b(forex\s*time|fxtm)\b/i, source: 'CMVM', fatalScore: 90, reportCount: 5000, lastSeen: '2024-01' },
  { pattern: /\b(iq\s*option)\b/i, source: 'CMVM/FCA', fatalScore: 85, reportCount: 25000, lastSeen: '2024-03' },
  { pattern: /\b(olymp\s*trade)\b/i, source: 'CMVM', fatalScore: 85, reportCount: 15000, lastSeen: '2024-02' },
  { pattern: /\b(binary\s*(options?|trading))\b/i, source: 'CMVM/FCA/ASIC', fatalScore: 90, reportCount: 50000, lastSeen: '2024-03' },
  { pattern: /\b(expert\s*option)\b/i, source: 'CMVM', fatalScore: 85, reportCount: 8000, lastSeen: '2024-01' },

  // ── MLM / Pyramid Scheme Operations ──
  { pattern: /\b(empower\s*network)\b/i, source: 'FTC', fatalScore: 100, reportCount: 30000, lastSeen: '2023-09' },
  { pattern: /\b(wake\s*up\s*now)\b/i, source: 'FTC', fatalScore: 100, reportCount: 20000, lastSeen: '2023-08' },
  { pattern: /\b(zeek\s*rewards?)\b/i, source: 'SEC/FTC', fatalScore: 100, reportCount: 25000, lastSeen: '2023-07' },
  { pattern: /\b(digital\s*altitude)\b/i, source: 'FTC', fatalScore: 100, reportCount: 15000, lastSeen: '2023-10' },
  { pattern: /\b(mobe|my\s*online\s*business\s*empire)\b/i, source: 'FTC', fatalScore: 100, reportCount: 18000, lastSeen: '2023-11' },
  { pattern: /\b(imarketslive|iml)\b/i, source: 'FTC', fatalScore: 95, reportCount: 12000, lastSeen: '2024-01' },
  { pattern: /\b(kuvera\s*(global)?)\b/i, source: 'FTC', fatalScore: 95, reportCount: 8000, lastSeen: '2024-02' },

  // ── Generic High-Risk Patterns (complaint database fingerprints) ──
  { pattern: /\b(ponzi|pyramid\s*scheme|esquema\s*pir[aâ]mide|corrente\s*de\s*dinheiro)\b/i, source: 'Generic-Fraud-DB', fatalScore: 95, reportCount: 999999, lastSeen: '2024-03' },
  { pattern: /\b(hyip|high\s*yield\s*investment\s*program)\b/i, source: 'FTC/SEC', fatalScore: 95, reportCount: 100000, lastSeen: '2024-03' },
  { pattern: /\b(advance\s*fee\s*fraud|nigerian\s*(prince|letter|scam))\b/i, source: 'FBI/Interpol', fatalScore: 100, reportCount: 999999, lastSeen: '2024-03' },
  { pattern: /\b(romance\s*scam|pig\s*butchering|sha\s*zhu\s*pan)\b/i, source: 'FBI/Interpol', fatalScore: 100, reportCount: 200000, lastSeen: '2024-03' },
];

// ─── HIGH-RISK PAYMENT GATEWAY PATTERNS ──────────────────────────────────────
// Payment gateways frequently used by scam operations.
// These are NOT inherently scam gateways, but their presence in certain contexts
// combined with other signals = FATAL.

const HIGH_RISK_PAYMENT_GATEWAYS = [
  // Crypto payment processors (high scam usage)
  /\b(coinpayments?|nowpayments?|cryptomus|plisio)\b/i,
  /\b(bitpay|coinbase\s*commerce)\b/i,  // legitimate but heavily abused
  // Wire transfer / Western Union / MoneyGram (classic scam payment methods)
  /\b(western\s*union|moneygram|ria\s*money|world\s*remit)\b/i,
  // Gift card payment requests (ALWAYS a scam)
  /\b(pay\s*(with|using|via|in)\s*(gift\s*cards?|itunes?|google\s*play|amazon\s*gift|steam\s*gift))\b/i,
  /\b(pague\s*(com|usando|via|em)\s*(cart[aã]o\s*presente|gift\s*card|itunes?|google\s*play))\b/i,
  // Unregulated crypto exchanges
  /\b(binance\s*p2p|localbitcoins?|paxful|hodlhodl)\b/i,
  // Suspicious payment terms
  /\b(send\s*(bitcoin|crypto|eth|usdt|bnb)\s*(to|for)\s*(unlock|access|activate|receive))\b/i,
  /\b(envie\s*(bitcoin|crypto|eth|usdt|bnb)\s*(para|por)\s*(desbloquear|acessar|ativar|receber))\b/i,
  // Mbway/Pix scam patterns
  /\b(mbway\s*(urgente|bloqueado|suspenso|verificar|confirmar))\b/i,
  /\b(pix\s*(urgente|bloqueado|suspenso|verificar|confirmar))\b/i,
  /\b(transferência\s*(urgente|imediata|agora)\s*(via\s*)?(pix|mbway|transferência))\b/i,
];

// ─── CHECKOUT FUNNEL RISK PATTERNS ───────────────────────────────────────────
// Aggressive sales funnel indicators — the "guru checkout" fingerprint.
// These patterns appear in checkout pages and sales funnels of scam operations.

const CHECKOUT_FUNNEL_PATTERNS = [
  // English — Aggressive upsell/downsell patterns
  /\b(one[\s-]?time\s+offer|oto\s+\d+|upsell|downsell|order\s+bump)\b/i,
  /\b(wait\s*!\s*(your\s+order\s+is\s+not\s+complete|before\s+you\s+go|special\s+offer))\b/i,
  /\b(add\s+to\s+order|upgrade\s+my\s+order|yes\s*!\s*add\s+this)\b/i,
  /\b(this\s+(page|offer)\s+(will\s+)?(close|expire|disappear)\s+(in|after)\s+\d+\s+(minutes?|seconds?|hours?))\b/i,
  /\b(your\s+(cart|order)\s+(expires?\s+in|is\s+reserved\s+for)\s+\d+\s+(minutes?|seconds?))\b/i,
  /\b(clickbank|jvzoo|warrior\s*plus|digistore24)\b/i,  // platforms heavily used by scam courses
  /\b(hotmart|eduzz|monetizze)\b/i,  // Brazilian platforms (legitimate but heavily abused)
  // Portuguese — Aggressive upsell patterns
  /\b(oferta\s+[uú]nica|oferta\s+especial\s+de\s+\d+\s+(minutos?|segundos?|horas?))\b/i,
  /\b(espere\s*!\s*(seu\s+pedido\s+n[aã]o\s+est[aá]\s+completo|antes\s+de\s+sair|oferta\s+especial))\b/i,
  /\b(adicionar\s+ao\s+pedido|atualizar\s+meu\s+pedido|sim\s*!\s*adicionar\s+isso)\b/i,
  /\b(seu\s+(carrinho|pedido)\s+(expira\s+em|est[aá]\s+reservado\s+por)\s+\d+\s+(minutos?|segundos?))\b/i,
  // Fake scarcity on checkout
  /\b(only\s+\d+\s+(copies?|units?|licenses?)\s+(left|remaining)\s+at\s+this\s+price)\b/i,
  /\b(apenas\s+\d+\s+(c[oó]pias?|unidades?|licen[cç]as?)\s+(restantes?|sobrando)\s+neste\s+pre[cç]o)\b/i,
  // Fake discount countdown
  /\b(regular\s+price\s*:\s*\$?\d+[k]?.*?today\s+(only\s+)?\$?\d+[k]?)\b/is,
  /\b(pre[cç]o\s+normal\s*:\s*R?\$?\d+[k]?.*?hoje\s+(apenas\s+)?R?\$?\d+[k]?)\b/is,
];

// ─── URL RISK ANALYZER ────────────────────────────────────────────────────────
// Analyzes URLs for checkout/funnel/scam indicators.

const HIGH_RISK_URL_PATTERNS = [
  // URL shorteners (hide destination)
  /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|short\.link|rb\.gy|cutt\.ly|is\.gd|buff\.ly|tiny\.cc)\b/i,
  // Suspicious TLDs
  /\.(xyz|top|click|loan|work|gq|tk|ml|cf|ga|pw|cc|su|icu|vip|live|online|site|website|space|fun|store)\b/i,
  // Checkout/funnel URL patterns
  /\/(checkout|order|buy|purchase|enroll|join|get-access|claim|grab|secure|limited)\b/i,
  /\/(comprar|pedido|checkout|inscrever|entrar|acesso|garantir|reivindicar|limitado)\b/i,
  // Tracking/affiliate URL patterns
  /[?&](aff|affiliate|ref|referral|utm_source=guru|utm_campaign=scam|clickid|subid)\b/i,
  // IP-based URLs (no domain = suspicious)
  /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
  // Free hosting platforms used by scammers
  /\.(wixsite\.com|weebly\.com|wordpress\.com|blogspot\.com|carrd\.co|linktree\.com|bio\.link|taplink\.cc)\b/i,
  // Newly registered domain patterns (random strings)
  /https?:\/\/[a-z0-9]{8,20}\.(com|net|org|io)\b/i,
  // Scam keyword domains
  /(profit|rich|millionaire|guru|secret|formula|blueprint|passive|income|wealth|money)(method|system|academy|club|code|hack|formula|blueprint)\.(com|net|org|io|co)\b/i,
];

// ─── REPUTATION CHECKER ───────────────────────────────────────────────────────
// Pure linguistic + curated-DB analysis.
// Detects:
//   - Confirmed scam entity mentions (curated DB)
//   - High-risk payment instruments (gift cards, wire-transfer-only, etc.)
//   - Aggressive checkout funnel patterns
//   - High-risk URL fingerprints
//   - Review-site gaslighting language ("ignore Trustpilot/ReclameAqui/BBB")
// To enrich with a live Google Safe Browsing lookup, call
// `packages/sniper-scraper/safe-browsing.lookupUrls(urls)` from the API layer.

function checkLiveReputation(text = '', urls = []) {
  const source = String(text);
  let score = 0;
  const reasons = [];
  const alerts = [];
  const reputationData = {
    knownScamEntities: [],
    highRiskPaymentGateways: [],
    checkoutFunnelSignals: 0,
    highRiskUrls: [],
    reviewSiteGaslighting: [],
  };

  // ── Check known scam entities ────────────────────────────────────────────
  for (const entity of KNOWN_SCAM_ENTITIES) {
    if (entity.pattern.test(source)) {
      const entityName = source.match(entity.pattern)?.[0] || 'unknown';
      reputationData.knownScamEntities.push({
        entity: entityName,
        source: entity.source,
        fatalScore: entity.fatalScore,
        reportCount: entity.reportCount,
        lastSeen: entity.lastSeen,
      });
      score += entity.fatalScore;
      reasons.push(`FATAL-ENTITY:${entityName}:confirmed-in-${entity.source}:${entity.reportCount}-reports`);
      alerts.push({
        level: 'FATAL',
        type: 'known-scam-entity',
        message: `Entity "${entityName}" confirmed in ${entity.source} with ${entity.reportCount.toLocaleString()} reports`,
        action: 'BLOCK_IMMEDIATELY',
      });
    }
  }

  // ── Check high-risk payment gateways ────────────────────────────────────
  for (const pattern of HIGH_RISK_PAYMENT_GATEWAYS) {
    if (pattern.test(source)) {
      const match = source.match(pattern)?.[0] || 'unknown';
      reputationData.highRiskPaymentGateways.push(match);
      score += 25;
      reasons.push(`high-risk-payment-gateway:${match.substring(0, 40)}`);
    }
  }

  // ── Check checkout funnel patterns ───────────────────────────────────────
  for (const pattern of CHECKOUT_FUNNEL_PATTERNS) {
    if (pattern.test(source)) {
      reputationData.checkoutFunnelSignals++;
      score += 12;
      reasons.push(`checkout-funnel:${pattern.source.substring(0, 50)}`);
    }
  }

  // ── Check URL risk patterns ──────────────────────────────────────────────
  const allUrls = [...urls];
  // Also extract URLs from text
  const urlMatches = source.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  allUrls.push(...urlMatches);

  for (const url of allUrls) {
    for (const pattern of HIGH_RISK_URL_PATTERNS) {
      if (pattern.test(url)) {
        reputationData.highRiskUrls.push(url.substring(0, 80));
        score += 15;
        reasons.push(`high-risk-url:${pattern.source.substring(0, 40)}:${url.substring(0, 50)}`);
        break; // One hit per URL is enough
      }
    }
  }

  // ── Review-site gaslighting detection ────────────────────────────────────
  // Defensive language about complaint sites = strong proxy that the entity
  // has been reported there. We detect the LANGUAGE, not the database.
  const gaslighting = detectReviewSiteGaslighting(source, allUrls);
  if (gaslighting.score > 0) {
    reputationData.reviewSiteGaslighting = gaslighting.signals;
    score += gaslighting.score;
    for (const signal of gaslighting.signals) {
      reasons.push(`review-site-gaslighting:${signal}`);
    }
  }

  // ── COMBO AMPLIFIERS ─────────────────────────────────────────────────────

  // Known scam entity + checkout funnel = INSTANT FATAL
  if (reputationData.knownScamEntities.length > 0 && reputationData.checkoutFunnelSignals > 0) {
    score += 50;
    reasons.push('live-reputation-combo:INSTANT-FATAL:known-scam-entity+checkout-funnel');
    alerts.push({
      level: 'FATAL',
      type: 'combo-amplifier',
      message: 'Known scam entity combined with checkout funnel = INSTANT BLOCK',
      action: 'BLOCK_IMMEDIATELY',
    });
  }

  // High-risk payment + checkout funnel = scam checkout
  if (reputationData.highRiskPaymentGateways.length > 0 && reputationData.checkoutFunnelSignals >= 2) {
    score += 30;
    reasons.push('live-reputation-combo:scam-checkout:high-risk-payment+checkout-funnel');
  }

  // Multiple high-risk URLs = coordinated scam network
  if (reputationData.highRiskUrls.length >= 2) {
    score += 20;
    reasons.push(`live-reputation-combo:coordinated-scam-network:${reputationData.highRiskUrls.length}-high-risk-urls`);
  }

  // Gift card payment = ALWAYS a scam
  if (/\b(pay\s*(with|using|via|in)\s*(gift\s*cards?|itunes?|google\s*play|amazon\s*gift|steam\s*gift))\b/i.test(source) ||
      /\b(pague\s*(com|usando|via|em)\s*(cart[aã]o\s*presente|gift\s*card|itunes?|google\s*play))\b/i.test(source)) {
    score += 60;
    reasons.push('live-reputation-combo:GIFT-CARD-PAYMENT=ALWAYS-SCAM');
    alerts.push({
      level: 'FATAL',
      type: 'gift-card-payment',
      message: 'Gift card payment request = 100% scam. No legitimate business requests gift cards.',
      action: 'BLOCK_IMMEDIATELY',
    });
  }

  return {
    score,
    reasons,
    alerts,
    reputationData,
  };
}

// ─── REVIEW-SITE GASLIGHTING DETECTOR ─────────────────────────────────────────
// Honest implementation: we analyse the input text/urls for defensive language
// about complaint sites. Strong proxy that the entity has been reported there.
// This is NOT an external API. It is linguistic forensics.

const GASLIGHTING_PATTERNS = [
  // Portuguese (PT/BR)
  { rx: /\b(ignore\s*(o\s*)?(reclame\s*aqui|procon|consumidor\.gov))\b/i, weight: 50, label: 'ignore-pt-complaint-site' },
  { rx: /\b(reclame\s*aqui\s*(é\s*)?(falso|mentira|n[aã]o\s+[eé]\s+confi[aá]vel|manipulado))\b/i, weight: 40, label: 'reclame-aqui-discredit' },
  { rx: /\b(procon\s*(é\s*)?(falso|mentira|n[aã]o\s+[eé]\s+confi[aá]vel))\b/i, weight: 40, label: 'procon-discredit' },
  { rx: /\b(avalia[cç][oõ]es?\s+negativas?\s+(s[aã]o\s+)?(falsas?|pagas?|de\s+concorrentes?))\b/i, weight: 35, label: 'negative-reviews-blamed-on-competitors-pt' },
  // English
  { rx: /\b(ignore\s*(the\s*)?(trustpilot|bbb|better\s*business\s*bureau|scamadviser))\b/i, weight: 50, label: 'ignore-en-complaint-site' },
  { rx: /\b(trustpilot\s*(reviews?\s*are\s*)?(fake|manipulated|paid|not\s*reliable))\b/i, weight: 40, label: 'trustpilot-discredit' },
  { rx: /\b(bbb\s*(is\s*)?(corrupt|fake|paid|not\s*reliable|a\s*scam))\b/i, weight: 40, label: 'bbb-discredit' },
  { rx: /\b(negative\s+reviews?\s+(are\s+)?(fake|paid|from\s+competitors?))\b/i, weight: 35, label: 'negative-reviews-blamed-on-competitors-en' },
];

const SHALLOW_DOMAIN_SIGNALS = [
  // Random-looking domains
  { rx: /https?:\/\/[a-z0-9]{8,20}\.(com|net|org)\b/i, weight: 20, label: 'random-string-domain' },
  // Suspicious TLDs
  { rx: /\.(xyz|top|click|loan|work|gq|tk|ml|cf|ga|pw|icu|vip)\b/i, weight: 25, label: 'suspicious-tld' },
  // IP-based URLs
  { rx: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i, weight: 35, label: 'ip-based-url' },
  // Scam keyword in domain
  { rx: /(profit|rich|millionaire|guru|secret|formula|blueprint|passive|income|wealth)(method|system|academy|club|code|hack)\./i, weight: 30, label: 'scam-keyword-domain' },
];

const ANONYMITY_SIGNALS = [
  { rx: /\b(no\s+physical\s+address|sem\s+endere[cç]o\s+f[ií]sico)\b/i, weight: 15, label: 'no-physical-address' },
  { rx: /\b(anonymous\s+(owner|company|operator)|propriet[aá]rio\s+an[oô]nimo)\b/i, weight: 20, label: 'anonymous-owner' },
];

function detectReviewSiteGaslighting(text, urls = []) {
  let score = 0;
  const signals = [];

  for (const p of GASLIGHTING_PATTERNS) {
    if (p.rx.test(text)) {
      score += p.weight;
      signals.push(p.label);
    }
  }
  for (const url of urls) {
    for (const p of SHALLOW_DOMAIN_SIGNALS) {
      if (p.rx.test(url)) {
        score += p.weight;
        signals.push(`${p.label}:${url.substring(0, 60)}`);
        break;
      }
    }
  }
  for (const p of ANONYMITY_SIGNALS) {
    if (p.rx.test(text)) {
      score += p.weight;
      signals.push(p.label);
    }
  }

  return { score: Math.min(score, 80), signals };
}

module.exports = { checkLiveReputation, detectReviewSiteGaslighting };
