const HIGH_RISK_PATTERNS = [
  // English
  /guaranteed\s+profit/i,
  /get\s+rich\s+quick/i,
  /easy\s+money/i,
  /double\s+your\s+money/i,
  /guru\s+secrets?/i,
  /instant\s+income/i,
  /make\s+money\s+fast/i,
  /financial\s+freedom\s+guaranteed/i,
  /passive\s+income\s+guaranteed/i,
  /risk[\s-]free\s+investment/i,
  /100%\s+guaranteed/i,
  /secret\s+method/i,
  /secret\s+formula/i,
  /millionaire\s+secret/i,
  /crypto\s+guaranteed/i,
  /forex\s+guaranteed/i,
  /binary\s+options?\s+profit/i,
  /pyramid\s+scheme/i,
  /ponzi/i,
  /mlm\s+guaranteed/i,
  /work\s+from\s+home\s+guaranteed/i,
  /earn\s+\d+\s*(€|\$|£|eur|usd|gbp)\s*per\s*(day|hour|week)/i,
  /\d+\s*(€|\$|£)\s*per\s*(day|hour)\s*(guaranteed|assured)/i,

  // Portuguese (PT + BR)
  /ia\s+milagrosa/i,
  /dinheiro\s+f[aá]cil/i,
  /lucro\s+garantido/i,
  /ganhos?\s+garantidos?/i,
  /renda\s+passiva\s+garantida/i,
  /investimento\s+garantido/i,
  /retorno\s+garantido/i,
  /m[eé]todo\s+secreto/i,
  /f[oó]rmula\s+secreta/i,
  /segredo\s+dos\s+milion[aá]rios?/i,
  /ficar\s+rico\s+r[aá]pido/i,
  /enriquecer\s+r[aá]pido/i,
  /ganhar\s+dinheiro\s+r[aá]pido/i,
  /sem\s+esfor[cç]o\s+garantido/i,
  /trabalhar\s+de\s+casa\s+garantido/i,
  /crypto\s+garantido/i,
  /forex\s+garantido/i,
  /esquema\s+pir[aâ]mide/i,
  /corrente\s+de\s+dinheiro/i,
  /ganhar\s+\d+\s*(€|\$|R\$)\s*por\s*(dia|hora|semana)/i,
  /\d+\s*(€|R\$)\s*por\s*(dia|hora)\s*garantido/i,

  // Spanish
  /dinero\s+f[aá]cil/i,
  /ganancia\s+garantizada/i,
  /ingresos?\s+garantizados?/i,
  /m[eé]todo\s+secreto/i,
  /hacerse\s+rico\s+r[aá]pido/i,
  /inversi[oó]n\s+garantizada/i,
  /sin\s+riesgo\s+garantizado/i,

  // German
  /garantierter\s+gewinn/i,
  /schnell\s+reich\s+werden/i,
  /geheime\s+methode/i,

  // French
  /argent\s+facile\s+garanti/i,
  /gains?\s+garantis?/i,
  /m[eé]thode\s+secr[eè]te/i,
  /devenir\s+riche\s+rapidement/i,
];

const MEDIUM_RISK_PATTERNS = [
  // English
  /limited\s+time\s+only/i,
  /act\s+now/i,
  /only\s+today/i,
  /exclusive\s+method/i,
  /don['']?t\s+miss\s+out/i,
  /last\s+chance/i,
  /urgent\s+opportunity/i,
  /once\s+in\s+a\s+lifetime/i,
  /insider\s+information/i,
  /exclusive\s+access/i,
  /vip\s+access\s+only/i,
  /spots?\s+limited/i,
  /only\s+\d+\s+spots?\s+left/i,
  /join\s+thousands?\s+who/i,
  /financial\s+independence\s+fast/i,
  /quit\s+your\s+job/i,
  /fire\s+your\s+boss/i,
  /passive\s+income\s+stream/i,
  /automated\s+income/i,
  /ai\s+makes?\s+money\s+for\s+you/i,
  /bot\s+generates?\s+profit/i,
  /trading\s+bot\s+profit/i,
  /crypto\s+signals?\s+vip/i,
  /forex\s+signals?\s+guaranteed/i,

  // Portuguese
  /sem\s+risco/i,
  /retorno\s+imediato/i,
  /oportunidade\s+[uú]nica/i,
  /vagas?\s+limitadas?/i,
  /s[oó]\s+hoje/i,
  /[uú]ltima\s+chance/i,
  /urgente\s+oportunidade/i,
  /acesso\s+exclusivo/i,
  /acesso\s+vip/i,
  /liberdade\s+financeira\s+r[aá]pida/i,
  /demita\s+seu\s+chefe/i,
  /largue\s+o\s+emprego/i,
  /renda\s+autom[aá]tica/i,
  /bot\s+de\s+trading/i,
  /sinais?\s+vip\s+crypto/i,
  /sinais?\s+forex\s+garantidos?/i,
  /grupo\s+vip\s+investimento/i,
  /mentor\s+financeiro\s+exclusivo/i,
  /curso\s+secreto\s+milion[aá]rio/i,

  // Spanish
  /sin\s+riesgo/i,
  /retorno\s+inmediato/i,
  /oportunidad\s+[uú]nica/i,
  /plazas?\s+limitadas?/i,
  /solo\s+hoy/i,
  /[uú]ltima\s+oportunidad/i,

  // German
  /nur\s+heute/i,
  /begrenzte\s+pl[aä]tze/i,
  /kein\s+risiko/i,

  // French
  /sans\s+risque/i,
  /offre\s+limit[eé]e/i,
  /aujourd['']hui\s+seulement/i,
];

const PHISHING_PATTERNS = [
  /verify\s+your\s+(account|bank|paypal|mbway|pix)/i,
  /confirm\s+your\s+(account|payment|identity)/i,
  /your\s+account\s+(has\s+been\s+)?(suspended|blocked|limited)/i,
  /click\s+here\s+to\s+(verify|confirm|unlock)/i,
  /urgent\s*:\s*(account|payment|security)/i,
  /verifique\s+a\s+sua\s+(conta|identidade|pagamento)/i,
  /confirme\s+o\s+seu\s+(pagamento|acesso|conta)/i,
  /a\s+sua\s+conta\s+(foi\s+)?(suspensa|bloqueada|limitada)/i,
  /clique\s+aqui\s+para\s+(verificar|confirmar|desbloquear)/i,
  /urgente\s*:\s*(conta|pagamento|seguran[cç]a)/i,
  /mbway\s+(urgente|bloqueado|suspenso)/i,
  /multibanco\s+(urgente|bloqueado)/i,
  /pix\s+(urgente|bloqueado|suspenso)/i,
];

function scoreContentRisk(text = '') {
  const source = String(text);
  let score = 0;
  const reasons = [];

  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(source)) {
      score += 18;
      reasons.push(`high-risk-pattern:${pattern.source.substring(0, 40)}`);
    }
  }

  for (const pattern of MEDIUM_RISK_PATTERNS) {
    if (pattern.test(source)) {
      score += 8;
      reasons.push(`medium-risk-pattern:${pattern.source.substring(0, 40)}`);
    }
  }

  for (const pattern of PHISHING_PATTERNS) {
    if (pattern.test(source)) {
      score += 22;
      reasons.push(`phishing-pattern:${pattern.source.substring(0, 40)}`);
    }
  }

  // Channel mix: external link + messaging platform
  if (/https?:\/\/[^\s]+/i.test(source) && /whatsapp|telegram|signal/i.test(source)) {
    score += 12;
    reasons.push('channel-mix:external-link-with-messaging-platform');
  }

  // URL shorteners (high risk)
  if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|short\.link|rb\.gy|cutt\.ly/i.test(source)) {
    score += 10;
    reasons.push('url-shortener:obfuscated-destination');
  }

  // Suspicious TLDs
  if (/\.(xyz|top|click|loan|work|gq|tk|ml|cf|ga)\b/i.test(source)) {
    score += 8;
    reasons.push('suspicious-tld:high-abuse-domain');
  }

  // Excessive promises with numbers
  if (/\d{3,}\s*(€|\$|£|R\$|eur|usd)\s*(por|per|\/)\s*(dia|day|hora|hour)/i.test(source)) {
    score += 14;
    reasons.push('excessive-income-claim:unrealistic-daily-earnings');
  }

  // Urgency + money combination
  if (/(urgente|urgent|agora|now|hoje|today)/i.test(source) && /(dinheiro|money|lucro|profit|ganho|earn)/i.test(source)) {
    score += 6;
    reasons.push('urgency-money-combo:pressure-tactic');
  }

  const clamped = Math.max(0, Math.min(score, 100));
  return { score: clamped, reasons };
}

function riskDecision(score) {
  if (score >= 60) return 'block';
  if (score >= 30) return 'review';
  return 'allow';
}

module.exports = { scoreContentRisk, riskDecision };
