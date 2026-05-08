// KAIROS Engine — Deep Checkout & Link Inspection
// "Look inside the URL" — Analyzes destination, checkout structure, and link behavior.
// A checkout link combined with promises of wealth = 100/100 SCAM.
// Detects: aggressive sales funnels, hidden redirects, high-risk payment gateways.

'use strict';

// ─── AGGRESSIVE SALES FUNNEL INDICATORS ──────────────────────────────────────
// These are the structural fingerprints of scam checkout pages.
// Legitimate businesses don't use these tactics.

const AGGRESSIVE_FUNNEL_PATTERNS = [
  // ── Countdown timers (fake urgency on checkout) ──
  /\b(checkout\s+expires?\s+in\s+\d+\s+(minutes?|seconds?|hours?))\b/i,
  /\b(your\s+(order|cart|session)\s+(expires?\s+in|is\s+reserved\s+for)\s+\d+\s+(minutes?|seconds?))\b/i,
  /\b(complete\s+your\s+order\s+(before|in)\s+\d+\s+(minutes?|seconds?))\b/i,
  /\b(seu\s+(pedido|carrinho|sess[aã]o)\s+(expira\s+em|est[aá]\s+reservado\s+por)\s+\d+\s+(minutos?|segundos?))\b/i,
  /\b(complete\s+seu\s+pedido\s+(antes\s+de|em)\s+\d+\s+(minutos?|segundos?))\b/i,

  // ── One-Time Offer (OTO) patterns ──
  /\b(one[\s-]?time\s+(offer|deal|price|discount|opportunity))\b/i,
  /\b(this\s+(offer|price|deal)\s+(is\s+)?(only\s+)?(available|valid)\s+(once|one\s+time|this\s+one\s+time))\b/i,
  /\b(oferta\s+[uú]nica|oportunidade\s+[uú]nica\s+de\s+compra)\b/i,
  /\b(esta\s+(oferta|pre[cç]o|deal)\s+(s[oó]\s+[eé]\s+)?(dispon[ií]vel|v[aá]lida)\s+(uma\s+vez|uma\s+[uú]nica\s+vez))\b/i,

  // ── Upsell/Downsell manipulation ──
  /\b(wait\s*[!,]?\s*(before\s+you\s+(go|leave|close)|your\s+order\s+is\s+not\s+complete))\b/i,
  /\b(espere\s*[!,]?\s*(antes\s+de\s+(sair|fechar)|seu\s+pedido\s+n[aã]o\s+est[aá]\s+completo))\b/i,
  /\b(upgrade\s+(my|your)\s+(order|package|plan)\s+(to|for)\s+(just|only)\s+\$?\d+)\b/i,
  /\b(add\s+(this|the\s+upgrade|the\s+bonus)\s+to\s+(my|your)\s+order\s+(for\s+just|for\s+only)\s+\$?\d+)\b/i,
  /\b(no\s+thanks\s*,?\s*i\s+(don['']?t\s+want|prefer\s+not\s+to|will\s+pass\s+on))\b/i,
  /\b(n[aã]o\s+obrigado\s*,?\s*eu\s+(n[aã]o\s+quero|prefiro\s+n[aã]o|vou\s+passar))\b/i,

  // ── Fake scarcity on checkout ──
  /\b(only\s+\d+\s+(copies?|units?|licenses?|spots?|seats?)\s+(left|remaining)\s+(at\s+this\s+price|in\s+stock))\b/i,
  /\b(apenas\s+\d+\s+(c[oó]pias?|unidades?|licen[cç]as?|vagas?|lugares?)\s+(restantes?|sobrando)\s+(neste\s+pre[cç]o|em\s+estoque))\b/i,
  /\b(\d+\s+(people|students?|members?)\s+(are\s+)?(currently\s+)?(viewing|looking\s+at|on)\s+this\s+(page|offer|checkout))\b/i,
  /\b(\d+\s+(pessoas?|alunos?|membros?)\s+(est[aã]o\s+)?(atualmente\s+)?(vendo|olhando\s+para|na)\s+(esta\s+p[aá]gina|esta\s+oferta|este\s+checkout))\b/i,

  // ── Fake discount manipulation ──
  /\b(regular\s+price\s*[:\-]?\s*\$?\d+[k]?.*?today\s+(only\s+)?\$?\d+[k]?)\b/is,
  /\b(was\s*[:\-]?\s*\$?\d+[k]?.*?now\s+(only\s+)?\$?\d+[k]?)\b/is,
  /\b(pre[cç]o\s+normal\s*[:\-]?\s*R?\$?\d+[k]?.*?hoje\s+(apenas\s+)?R?\$?\d+[k]?)\b/is,
  /\b(era\s*[:\-]?\s*R?\$?\d+[k]?.*?agora\s+(apenas\s+)?R?\$?\d+[k]?)\b/is,
  /\b(save\s+\$?\d+[k]?\s+(today|now|instantly|immediately))\b/i,
  /\b(economize\s+R?\$?\d+[k]?\s+(hoje|agora|instantaneamente|imediatamente))\b/i,

  // ── Fake bonus stacking ──
  /\b(bonus\s+#?\d+\s*[:\-]?\s*(valued?\s+at|worth)\s+\$?\d+[k]?)\b/i,
  /\b(b[oô]nus\s+#?\d+\s*[:\-]?\s*(avaliado\s+em|no\s+valor\s+de)\s+R?\$?\d+[k]?)\b/i,
  /\b(total\s+value\s*[:\-]?\s*\$?\d+[k]?.*?you\s+(pay|get\s+it\s+for)\s+(just|only)\s+\$?\d+[k]?)\b/is,
  /\b(valor\s+total\s*[:\-]?\s*R?\$?\d+[k]?.*?voc[eê]\s+(paga|leva\s+por)\s+(apenas|s[oó])\s+R?\$?\d+[k]?)\b/is,

  // ── Psychological manipulation on checkout ──
  /\b(yes\s*[!,]?\s*i\s+(want|need|deserve)\s+(access|this|the\s+secret|financial\s+freedom))\b/i,
  /\b(sim\s*[!,]?\s*eu\s+(quero|preciso|mere[cç]o)\s+(acesso|isso|o\s+segredo|liberdade\s+financeira))\b/i,
  /\b(i\s+understand\s+that\s+(this\s+offer|this\s+price|this\s+deal)\s+(expires?|ends?|closes?)\s+(soon|tonight|in\s+\d+))\b/i,
  /\b(entendo\s+que\s+(esta\s+oferta|este\s+pre[cç]o|este\s+deal)\s+(expira|termina|fecha)\s+(em\s+breve|hoje|em\s+\d+))\b/i,
];

// ─── HIDDEN REDIRECT INDICATORS ──────────────────────────────────────────────
// Patterns that indicate hidden redirects or destination obfuscation.

const HIDDEN_REDIRECT_PATTERNS = [
  // URL shorteners (always hide destination)
  /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|short\.link|rb\.gy|cutt\.ly|is\.gd|buff\.ly|tiny\.cc|lnkd\.in|ift\.tt)\b/i,
  // Redirect services
  /\b(redirect\s*\.\s*(to|me|link)|go\s*\.\s*(to|link)|click\s*\.\s*(to|link|here))\b/i,
  // Tracking pixels and affiliate redirects
  /\b(track\s*\.\s*(to|link)|hop\s*\.\s*(clickbank|jvzoo)|warriorplus\s*\.\s*com\/o\/)\b/i,
  // JavaScript redirect patterns in text
  /\b(window\s*\.\s*location\s*=|document\s*\.\s*location\s*=|location\s*\.\s*href\s*=)\b/i,
  // Meta refresh redirect
  /\b(meta\s+http-equiv\s*=\s*['"]\s*refresh\s*['"])\b/i,
  // Suspicious redirect parameters
  /[?&](redirect|redir|goto|url|link|dest|destination|target|forward|next|return|callback)\s*=\s*https?/i,
  // Cloaked affiliate links
  /\/(go|out|click|track|aff|affiliate|refer|r)\/(https?|[a-z0-9]+)/i,
  // Portuguese redirect patterns
  /\b(clique\s+aqui\s+para\s+(acessar|ver|descobrir|obter)\s+(o\s+)?(link|acesso|segredo|m[eé]todo))\b/i,
  /\b(acesse\s+(agora|aqui|j[aá])\s+(o\s+)?(link|acesso|segredo|m[eé]todo)\s+(exclusivo|secreto|especial))\b/i,
];

// ─── CHECKOUT + WEALTH PROMISE DETECTOR ──────────────────────────────────────
// The FATAL combo: checkout link + wealth promise = 100/100 SCAM
// This is the CEO's directive: "A checkout link combined with promises of wealth = 100/100 SCAM"

const CHECKOUT_URL_PATTERNS = [
  /https?:\/\/[^\s"'<>]*(checkout|order|buy|purchase|enroll|join|get-access|claim|grab|secure|pay|payment)/i,
  /https?:\/\/[^\s"'<>]*(comprar|pedido|checkout|inscrever|entrar|acesso|garantir|pagar|pagamento)/i,
  /\b(hotmart\.com\/(product|checkout|pay)|eduzz\.com\/(checkout|pay)|monetizze\.com\.br\/(checkout|pay))\b/i,
  /\b(clickbank\.net\/order|jvzoo\.com\/checkout|warriorplus\.com\/o\/|digistore24\.com\/redir)\b/i,
  /\b(stripe\.com\/checkout|paypal\.com\/(cgi-bin\/webscr|checkout)|mercadopago\.com\/(checkout|pay))\b/i,
];

const WEALTH_PROMISE_PATTERNS = [
  /\b(get\s+rich|make\s+money|earn\s+\$?\d+|financial\s+freedom|passive\s+income|secret\s+method)\b/i,
  /\b(ficar\s+rico|ganhar\s+dinheiro|faturar\s+R?\$?\d+|liberdade\s+financeira|renda\s+passiva|m[eé]todo\s+secreto)\b/i,
  /\b(hacerse\s+rico|ganar\s+dinero|libertad\s+financiera|ingresos\s+pasivos|m[eé]todo\s+secreto)\b/i,
  /\b(millionaire|milion[aá]rio|millonario|guru\s+secret|segredo\s+do\s+guru)\b/i,
  /\b(crypto\s+(profit|guaranteed|secret)|forex\s+(profit|guaranteed|secret))\b/i,
  /\b(trading\s+(bot|signal|guaranteed)|bot\s+de\s+trading|sinais?\s+vip)\b/i,
];

// ─── DEEP LINK ANALYZER ───────────────────────────────────────────────────────
// Analyzes individual URLs for risk indicators.

function analyzeUrl(url) {
  const urlStr = String(url).toLowerCase();
  const risks = [];
  let urlScore = 0;

  // Check for URL shortener
  if (/\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|short\.link|rb\.gy|cutt\.ly|is\.gd|buff\.ly|tiny\.cc)\b/i.test(urlStr)) {
    risks.push('url-shortener:destination-hidden');
    urlScore += 20;
  }

  // Check for suspicious TLD
  if (/\.(xyz|top|click|loan|work|gq|tk|ml|cf|ga|pw|cc|su|icu|vip)\b/i.test(urlStr)) {
    risks.push('suspicious-tld:high-abuse-rate');
    urlScore += 25;
  }

  // Check for IP-based URL
  if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(urlStr)) {
    risks.push('ip-based-url:no-domain-registration');
    urlScore += 35;
  }

  // Check for checkout/funnel path
  if (/\/(checkout|order|buy|purchase|enroll|join|get-access|claim|grab|secure|pay|payment|comprar|pedido|inscrever|garantir|pagar|pagamento)\b/i.test(urlStr)) {
    risks.push('checkout-funnel-url:sales-funnel-detected');
    urlScore += 15;
  }

  // Check for affiliate/tracking parameters
  if (/[?&](aff|affiliate|ref|referral|clickid|subid|hop|jvzoo|cb_affiliate)\b/i.test(urlStr)) {
    risks.push('affiliate-tracking:commission-based-referral');
    urlScore += 10;
  }

  // Check for free hosting platforms
  if (/\.(wixsite\.com|weebly\.com|wordpress\.com|blogspot\.com|carrd\.co|linktree\.com|bio\.link|taplink\.cc)\b/i.test(urlStr)) {
    risks.push('free-hosting:scammer-preferred-platform');
    urlScore += 15;
  }

  // Check for scam keyword in domain
  if (/(profit|rich|millionaire|guru|secret|formula|blueprint|passive|income|wealth|money)(method|system|academy|club|code|hack|formula|blueprint)\./i.test(urlStr)) {
    risks.push('scam-keyword-domain:high-risk-domain-name');
    urlScore += 30;
  }

  // Check for known scam platforms
  if (/\b(hotmart\.com|eduzz\.com|monetizze\.com\.br|clickbank\.net|jvzoo\.com|warriorplus\.com|digistore24\.com)\b/i.test(urlStr)) {
    risks.push('scam-course-platform:heavily-abused-by-scammers');
    urlScore += 20;
  }

  // Check for hidden redirect parameters
  if (/[?&](redirect|redir|goto|url|link|dest|destination|target|forward|next|return|callback)\s*=\s*https?/i.test(urlStr)) {
    risks.push('hidden-redirect:destination-obfuscated');
    urlScore += 25;
  }

  return { url: urlStr.substring(0, 100), risks, urlScore };
}

// ─── MAIN CHECKOUT INSPECTOR ─────────────────────────────────────────────────

function inspectCheckout(text = '', urls = []) {
  const source = String(text);
  let score = 0;
  const reasons = [];
  const alerts = [];
  const checkoutData = {
    aggressiveFunnelSignals: 0,
    hiddenRedirectSignals: 0,
    checkoutUrlsFound: [],
    urlAnalysis: [],
    wealthPromiseDetected: false,
    checkoutWithWealthPromise: false,
  };

  // ── Scan for aggressive funnel patterns ─────────────────────────────────
  for (const pattern of AGGRESSIVE_FUNNEL_PATTERNS) {
    if (pattern.test(source)) {
      checkoutData.aggressiveFunnelSignals++;
      score += 10;
      reasons.push(`aggressive-funnel:${pattern.source.substring(0, 50)}`);
    }
  }

  // ── Scan for hidden redirect patterns ───────────────────────────────────
  for (const pattern of HIDDEN_REDIRECT_PATTERNS) {
    if (pattern.test(source)) {
      checkoutData.hiddenRedirectSignals++;
      score += 12;
      reasons.push(`hidden-redirect:${pattern.source.substring(0, 50)}`);
    }
  }

  // ── Detect checkout URLs in text ─────────────────────────────────────────
  const extractedUrls = source.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  const allUrls = [...new Set([...urls, ...extractedUrls])];

  for (const url of allUrls) {
    // Check if it's a checkout URL
    for (const pattern of CHECKOUT_URL_PATTERNS) {
      if (pattern.test(url)) {
        checkoutData.checkoutUrlsFound.push(url.substring(0, 100));
        score += 20;
        reasons.push(`checkout-url-detected:${url.substring(0, 60)}`);
        break;
      }
    }

    // Deep URL analysis
    const urlAnalysis = analyzeUrl(url);
    if (urlAnalysis.risks.length > 0) {
      checkoutData.urlAnalysis.push(urlAnalysis);
      score += urlAnalysis.urlScore;
      for (const risk of urlAnalysis.risks) {
        reasons.push(`url-risk:${risk}:${urlAnalysis.url.substring(0, 40)}`);
      }
    }
  }

  // ── Detect wealth promises ───────────────────────────────────────────────
  for (const pattern of WEALTH_PROMISE_PATTERNS) {
    if (pattern.test(source)) {
      checkoutData.wealthPromiseDetected = true;
      break;
    }
  }

  // ── THE FATAL COMBO: Checkout URL + Wealth Promise ───────────────────────
  // CEO Directive: "A checkout link combined with promises of wealth = 100/100 SCAM"
  if (checkoutData.checkoutUrlsFound.length > 0 && checkoutData.wealthPromiseDetected) {
    checkoutData.checkoutWithWealthPromise = true;
    score += 80; // FATAL amplifier
    reasons.push('FATAL-COMBO:CHECKOUT-URL+WEALTH-PROMISE=100/100-SCAM');
    alerts.push({
      level: 'FATAL',
      type: 'checkout-wealth-combo',
      message: 'Checkout link combined with wealth promises = 100/100 SCAM (CEO Directive)',
      action: 'BLOCK_IMMEDIATELY',
      urls: checkoutData.checkoutUrlsFound,
    });
  }

  // ── Aggressive funnel combo amplifiers ──────────────────────────────────

  // Multiple aggressive funnel signals = confirmed scam funnel
  if (checkoutData.aggressiveFunnelSignals >= 3) {
    score += 25;
    reasons.push(`checkout-combo:CONFIRMED-SCAM-FUNNEL:${checkoutData.aggressiveFunnelSignals}-funnel-signals`);
    alerts.push({
      level: 'HIGH',
      type: 'aggressive-funnel',
      message: `${checkoutData.aggressiveFunnelSignals} aggressive sales funnel signals detected`,
      action: 'REVIEW',
    });
  }

  // Hidden redirect + checkout = destination obfuscation
  if (checkoutData.hiddenRedirectSignals >= 1 && checkoutData.checkoutUrlsFound.length > 0) {
    score += 20;
    reasons.push('checkout-combo:hidden-redirect+checkout-url=destination-obfuscation');
  }

  // Multiple high-risk URLs = coordinated scam infrastructure
  const highRiskUrlCount = checkoutData.urlAnalysis.filter(u => u.urlScore >= 30).length;
  if (highRiskUrlCount >= 2) {
    score += 20;
    reasons.push(`checkout-combo:coordinated-scam-infrastructure:${highRiskUrlCount}-high-risk-urls`);
  }

  // Aggressive funnel + wealth promise (even without explicit checkout URL)
  if (checkoutData.aggressiveFunnelSignals >= 2 && checkoutData.wealthPromiseDetected) {
    score += 30;
    reasons.push('checkout-combo:aggressive-funnel+wealth-promise=scam-sales-page');
  }

  return {
    score,
    reasons,
    alerts,
    checkoutData,
  };
}

module.exports = { inspectCheckout, analyzeUrl };
