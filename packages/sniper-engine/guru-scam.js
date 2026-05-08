// KAIROS SNIPER — GURU-SCAM DETECTOR v7.0
// Zero tolerance for "Get Rich Quick" courses, fake gurus, and investment scams.
// A scam course is a scam. Full stop.

'use strict';

// ─── GURU-SCAM COURSE PATTERNS ────────────────────────────────────────────────
// These are the DNA of every fake "online course" / "mentoria" scam.
// Each match is FATAL — minimum 25 pts per hit.

const GURU_COURSE_PATTERNS = [
  // ── English ──
  /get\s+rich\s+(quick|fast|overnight|in\s+\d+\s+days?)/i,
  /make\s+\d+[k]?\s*(€|\$|£|usd|eur)\s*(per|a)\s*(day|week|month)\s*(online|from\s+home|guaranteed)?/i,
  /\d+[k]?\s*(€|\$|£)\s*(per|a|\/)\s*(day|week|month)\s*(guaranteed|assured|promise)/i,
  /quit\s+your\s+(9[\s-]?to[\s-]?5|job|boss)\s+(today|now|forever)/i,
  /fire\s+your\s+boss\s+(today|now|forever|with\s+this)/i,
  /financial\s+freedom\s+in\s+\d+\s+(days?|weeks?|months?)/i,
  /passive\s+income\s+(machine|blueprint|system|formula|secret|hack)/i,
  /zero\s+to\s+(hero|millionaire|\d+k)\s+in\s+\d+\s+(days?|weeks?|months?)/i,
  /from\s+(broke|zero|\$0|€0)\s+to\s+(\d+k?|millionaire|rich|wealthy)/i,
  /i\s+made\s+\d+[k]?\s*(€|\$|£)\s*(in|within)\s+\d+\s+(days?|hours?|weeks?)/i,
  /how\s+i\s+(made|earn(ed)?)\s+\d+[k]?\s*(€|\$|£)\s*(online|from\s+home|with\s+no\s+experience)/i,
  /no\s+experience\s+(needed|required|necessary)\s+(to\s+)?(make|earn|profit)/i,
  /works?\s+(even\s+if|for\s+anyone|while\s+you\s+sleep|on\s+autopilot)/i,
  /copy[\s-]?paste\s+(method|system|formula|blueprint)\s+(to\s+)?(make|earn)/i,
  /done[\s-]?for[\s-]?you\s+(system|business|income|profit|funnel)/i,
  /\d+x\s+(your\s+)?(income|revenue|profit|money|salary)\s+(in|within)\s+\d+/i,
  /turn\s+\$?\d+\s+into\s+\$?\d+[k]?\s+(in|within|guaranteed)/i,
  /secret\s+(method|formula|system|blueprint|hack|trick)\s+(to\s+)?(make|earn|profit|get\s+rich)/i,
  /millionaire\s+(mindset|blueprint|formula|secret|method|mentor|code)/i,
  /\d+\s+figure\s+(income|business|earner|entrepreneur)/i,
  /7[\s-]?figure\s+(income|business|earner|lifestyle|blueprint)/i,
  /6[\s-]?figure\s+(income|salary|business|earner|blueprint)/i,
  /dropshipping\s+(guaranteed|secret|blueprint|course|masterclass)\s*(profit|income|rich)?/i,
  /affiliate\s+marketing\s+(secret|blueprint|guaranteed|passive|autopilot)/i,
  /crypto\s+(trading\s+)?(secret|blueprint|guaranteed|signals?\s+vip|bot\s+profit)/i,
  /forex\s+(trading\s+)?(secret|blueprint|guaranteed|signals?\s+vip|bot\s+profit)/i,
  /nft\s+(guaranteed|profit|secret|blueprint|passive\s+income)/i,
  /trading\s+bot\s+(guaranteed|profit|secret|passive|autopilot)/i,
  /ai\s+(trading|bot|system)\s+(guaranteed|profit|passive|autopilot)/i,
  /online\s+course\s+(guaranteed|secret|blueprint|passive|autopilot|rich)/i,
  /masterclass\s+(secret|guaranteed|blueprint|passive|rich|millionaire)/i,
  /mentoria\s+(secreta|garantida|milion[aá]ria|exclusiva)\s*(de\s+)?(renda|lucro|dinheiro)?/i,

  // ── Portuguese (PT + BR) ──
  /ganhar\s+\d+[k]?\s*(€|R\$|\$)\s*(por|ao)\s*(dia|semana|m[eê]s)\s*(garantido|online|em\s+casa)?/i,
  /\d+[k]?\s*(€|R\$)\s*(por|ao)\s*(dia|semana|m[eê]s)\s*(garantido|assegurado|prometido)/i,
  /liberdade\s+financeira\s+em\s+\d+\s+(dias?|semanas?|meses?)/i,
  /renda\s+passiva\s+(m[aá]quina|blueprint|sistema|f[oó]rmula|segredo|hack)/i,
  /do\s+zero\s+ao\s+(milh[aã]o|milion[aá]rio|\d+k)\s+em\s+\d+\s+(dias?|semanas?|meses?)/i,
  /fiz\s+\d+[k]?\s*(€|R\$|\$)\s*(em|em\s+apenas)\s+\d+\s+(dias?|horas?|semanas?)/i,
  /como\s+(fiz|ganhei|faturei)\s+\d+[k]?\s*(€|R\$|\$)\s*(online|em\s+casa|sem\s+experi[eê]ncia)/i,
  /sem\s+experi[eê]ncia\s+(necess[aá]ria|precisa|exigida)\s*(para\s+)?(ganhar|lucrar|faturar)/i,
  /funciona\s+(mesmo\s+se|para\s+qualquer\s+um|enquanto\s+dorme|no\s+piloto\s+autom[aá]tico)/i,
  /copiar\s+e\s+colar\s+(m[eé]todo|sistema|f[oó]rmula)\s*(para\s+)?(ganhar|lucrar)/i,
  /feito\s+para\s+voc[eê]\s+(sistema|neg[oó]cio|renda|lucro|funil)/i,
  /multiplicar\s+(sua\s+)?(renda|dinheiro|lucro|sal[aá]rio)\s+(em|por)\s+\d+/i,
  /transformar\s+R?\$?\d+\s+em\s+R?\$?\d+[k]?\s+(em|garantido)/i,
  /m[eé]todo\s+(secreto|f[oó]rmula|sistema|blueprint|hack|truque)\s*(para\s+)?(ganhar|lucrar|ficar\s+rico)/i,
  /mentalidade\s+de\s+milion[aá]rio/i,
  /\d+\s+d[ií]gitos\s+(de\s+)?(renda|faturamento|neg[oó]cio)/i,
  /dropshipping\s+(garantido|secreto|blueprint|curso|masterclass)\s*(lucro|renda|rico)?/i,
  /marketing\s+de\s+afiliados?\s+(secreto|blueprint|garantido|passivo|autom[aá]tico)/i,
  /curso\s+(online\s+)?(garantido|secreto|blueprint|passivo|autom[aá]tico|milion[aá]rio)/i,
  /mentoria\s+(online\s+)?(garantida|secreta|blueprint|passiva|autom[aá]tica|milion[aá]ria)/i,
  /treinamento\s+(secreto|garantido|milion[aá]rio|exclusivo)\s*(de\s+)?(renda|lucro|dinheiro)?/i,
  /largue\s+o\s+emprego\s+(hoje|agora|de\s+vez|para\s+sempre)/i,
  /demita\s+seu\s+chefe\s+(hoje|agora|de\s+vez|para\s+sempre)/i,
  /trabalhar\s+de\s+casa\s+(garantido|f[aá]cil|sem\s+experi[eê]ncia|milion[aá]rio)/i,

  // ── Spanish ──
  /ganar\s+\d+[k]?\s*(€|\$)\s*(por|al)\s*(d[ií]a|semana|mes)\s*(garantizado|online|en\s+casa)?/i,
  /libertad\s+financiera\s+en\s+\d+\s+(d[ií]as?|semanas?|meses?)/i,
  /de\s+cero\s+a\s+(mill[oó]n|millonario|\d+k)\s+en\s+\d+\s+(d[ií]as?|semanas?|meses?)/i,
  /m[eé]todo\s+(secreto|f[oó]rmula|sistema|blueprint|hack|truco)\s*(para\s+)?(ganar|enriquecerse)/i,
  /curso\s+(online\s+)?(garantizado|secreto|blueprint|pasivo|autom[aá]tico|millonario)/i,
];

// ─── HIGH-PRESSURE SALES TACTICS ─────────────────────────────────────────────
// Psychological manipulation patterns used by scam courses.
// Each match adds 15 pts.

const HIGH_PRESSURE_PATTERNS = [
  // English
  /only\s+\d+\s+(spots?|seats?|places?)\s+(left|remaining|available)/i,
  /price\s+(goes?\s+up|increases?|doubles?)\s+(in|after|at)\s+\d+/i,
  /this\s+(offer|deal|price|discount)\s+(expires?|ends?|closes?)\s+(in|at|tonight|midnight)/i,
  /\d+\s+(people|students?|members?)\s+(already\s+)?(joined|enrolled|signed\s+up)\s+(today|this\s+week)/i,
  /don['']?t\s+(miss|lose)\s+(this|your)\s+(chance|opportunity|shot)\s+(to\s+)?(get\s+rich|make\s+money|change\s+your\s+life)/i,
  /warning\s*:\s*(this\s+)?(offer|price|access)\s+(will\s+)?(disappear|expire|close|end)/i,
  /\d+%\s+off\s+(today\s+only|for\s+the\s+next\s+\d+\s+hours?|limited\s+time)/i,
  /bonus\s+(worth|valued\s+at)\s+\$?\d+[k]?\s+(free|included|yours)/i,
  /testimonials?\s+from\s+(real|verified|actual)\s+(students?|members?|clients?)/i,
  /as\s+seen\s+on\s+(tv|cnn|bbc|forbes|entrepreneur)/i,
  /endorsed\s+by\s+(celebrities?|experts?|millionaires?)/i,
  /join\s+(over\s+)?\d+[k,]?\d*\s+(happy\s+)?(students?|members?|clients?|people)/i,
  /money[\s-]?back\s+guarantee\s+(if\s+you\s+don['']?t\s+make|or\s+your\s+money\s+back)/i,
  /i\s+guarantee\s+you['']?ll\s+(make|earn|profit|get\s+rich)/i,
  /results?\s+(not\s+typical|may\s+vary)\s*\*/i,

  // Portuguese
  /apenas\s+\d+\s+(vagas?|lugares?|planos?)\s+(restantes?|dispon[ií]veis?|sobrando)/i,
  /pre[cç]o\s+(sobe|aumenta|dobra)\s+(em|ap[oó]s|daqui\s+a)\s+\d+/i,
  /esta?\s+(oferta|promo[cç][aã]o|desconto|pre[cç]o)\s+(expira|termina|fecha)\s+(em|hoje|[aà]\s+meia[\s-]?noite)/i,
  /\d+\s+(pessoas?|alunos?|membros?)\s+(j[aá]\s+)?(entraram|se\s+inscreveram|compraram)\s+(hoje|esta\s+semana)/i,
  /n[aã]o\s+(perca|perd[ae])\s+(esta|sua)\s+(chance|oportunidade)\s+(de\s+)?(ficar\s+rico|ganhar\s+dinheiro|mudar\s+de\s+vida)/i,
  /aten[cç][aã]o\s*:\s*(esta?\s+)?(oferta|pre[cç]o|acesso)\s+(vai\s+)?(desaparecer|expirar|fechar|terminar)/i,
  /\d+%\s+de\s+desconto\s+(s[oó]\s+hoje|nas\s+pr[oó]ximas\s+\d+\s+horas?|por\s+tempo\s+limitado)/i,
  /b[oô]nus\s+(no\s+valor\s+de|avaliado\s+em)\s+R?\$?\d+[k]?\s+(gr[aá]tis|inclu[ií]do|seu)/i,
  /depoimentos?\s+de\s+(alunos?|membros?|clientes?)\s+(reais?|verificados?|verdadeiros?)/i,
  /como\s+visto\s+(na\s+tv|no\s+jornal|na\s+globo|na\s+forbes)/i,
  /junte[\s-]?se\s+(a\s+mais\s+de\s+)?\d+[k,]?\d*\s+(alunos?|membros?|pessoas?)\s+(felizes?|satisfeitos?)/i,
  /garantia\s+de\s+reembolso\s+(se\s+n[aã]o\s+ganhar|ou\s+devolvemos\s+seu\s+dinheiro)/i,
  /eu\s+garanto\s+que\s+voc[eê]\s+vai\s+(ganhar|lucrar|ficar\s+rico)/i,
];

// ─── FAKE TESTIMONIAL & SOCIAL PROOF MANIPULATION ────────────────────────────
// Scam courses live and die by fake testimonials. Each match adds 12 pts.

const FAKE_SOCIAL_PROOF_PATTERNS = [
  // English
  /\d+\s+five[\s-]?star\s+reviews?/i,
  /verified\s+(purchase|buyer|student|member)\s*[★⭐✓✅]/i,
  /\[real\s+(student|member|client|testimonial)\]/i,
  /before\s*:\s*(broke|struggling|\$0|zero)\s*[→\-|]\s*after\s*:\s*(\$\d+[k]?|rich|millionaire|free)/i,
  /screenshot\s+(of\s+)?(my\s+)?(earnings?|profits?|income|bank\s+account|paypal)/i,
  /proof\s+of\s+(earnings?|income|payment|results?)/i,
  /this\s+(student|member|client)\s+made\s+\$?\d+[k]?\s+(in|within)\s+\d+\s+(days?|hours?|weeks?)/i,
  /\d+\s+success\s+stories?\s+(this\s+week|today|this\s+month)/i,

  // Portuguese
  /\d+\s+avalia[cç][oõ]es?\s+de\s+cinco\s+estrelas?/i,
  /compra\s+verificada\s*[★⭐✓✅]/i,
  /\[aluno\s+(real|verdadeiro|verificado)\]/i,
  /antes\s*:\s*(falido|sem\s+dinheiro|R?\$0|zero)\s*[→\-|]\s*depois\s*:\s*(R?\$\d+[k]?|rico|milion[aá]rio|livre)/i,
  /print\s+(dos?\s+)?(meus?\s+)?(ganhos?|lucros?|renda|conta\s+banc[aá]ria|paypal)/i,
  /prova\s+de\s+(ganhos?|renda|pagamento|resultados?)/i,
  /este\s+(aluno|membro|cliente)\s+(fez|ganhou|faturou)\s+R?\$?\d+[k]?\s+(em|em\s+apenas)\s+\d+\s+(dias?|horas?|semanas?)/i,
  /\d+\s+hist[oó]rias?\s+de\s+sucesso\s+(esta\s+semana|hoje|este\s+m[eê]s)/i,
];

// ─── UNREALISTIC ROI CLAIMS ───────────────────────────────────────────────────
// Any promise of specific, unrealistic returns. Each match adds 20 pts.

const UNREALISTIC_ROI_PATTERNS = [
  /\d{3,}%\s+(return|roi|profit|gain|yield)\s+(guaranteed|assured|promised|in\s+\d+)/i,
  /\d{3,}%\s+(de\s+)?(retorno|roi|lucro|ganho|rendimento)\s+(garantido|assegurado|prometido|em\s+\d+)/i,
  /double\s+(your\s+)?(money|investment|income)\s+(in\s+\d+\s+(days?|weeks?|months?)|guaranteed|overnight)/i,
  /dobrar\s+(seu\s+)?(dinheiro|investimento|renda)\s+(em\s+\d+\s+(dias?|semanas?|meses?)|garantido|da\s+noite\s+para\s+o\s+dia)/i,
  /triple\s+(your\s+)?(money|investment|income)\s+(in\s+\d+|guaranteed)/i,
  /triplicar\s+(seu\s+)?(dinheiro|investimento|renda)\s+(em\s+\d+|garantido)/i,
  /10x\s+(your\s+)?(money|investment|income|returns?)\s+(in\s+\d+|guaranteed|fast)/i,
  /\d+x\s+(your\s+)?(money|investment|income|returns?)\s+(in\s+\d+|guaranteed|fast)/i,
  /earn\s+\d{3,}\s*(€|\$|£|R\$)\s*(per|a)\s*(day|hour)\s*(guaranteed|assured|promised|easily)/i,
  /ganhar\s+\d{3,}\s*(€|R\$|\$)\s*(por|ao)\s*(dia|hora)\s*(garantido|assegurado|prometido|facilmente)/i,
  /invest\s+\$?\d+\s+and\s+(get|receive|earn|make)\s+\$?\d+[k]?\s+(back\s+)?(in|within|guaranteed)/i,
  /invista\s+R?\$?\d+\s+e\s+(receba|ganhe|lucre|fature)\s+R?\$?\d+[k]?\s+(de\s+volta\s+)?(em|garantido)/i,
];

// ─── COMPLAINT & NEGATIVE REPUTATION SIGNALS ─────────────────────────────────
// Patterns that indicate the content is associated with known complaint patterns.
// These are linguistic markers of scam operations that generate complaints.
// Each match adds 10 pts.

const COMPLAINT_SIGNAL_PATTERNS = [
  // Patterns that scam operations use to pre-empt complaints
  /results?\s+(are\s+)?(not\s+typical|may\s+vary|not\s+guaranteed|individual)/i,
  /resultados?\s+(n[aã]o\s+s[aã]o\s+t[ií]picos?|podem\s+variar|n[aã]o\s+s[aã]o\s+garantidos?|individuais?)/i,
  /disclaimer\s*:\s*(results?\s+may\s+vary|not\s+financial\s+advice|for\s+entertainment)/i,
  /this\s+is\s+not\s+financial\s+advice/i,
  /isso\s+n[aã]o\s+[eé]\s+(conselho|orienta[cç][aã]o)\s+financeiro/i,
  /past\s+performance\s+(does\s+not|is\s+not)\s+(guarantee|indicat(e|ive\s+of))\s+future\s+results?/i,
  /desempenho\s+passado\s+n[aã]o\s+(garante|[eé]\s+indicativo\s+de)\s+resultados?\s+futuros?/i,
  // Patterns that indicate they've been reported before
  /ignore\s+(the\s+)?(haters?|naysayers?|negative\s+reviews?|complaints?)/i,
  /ignore\s+(os?\s+)?(haters?|cr[ií]ticos?|avalia[cç][oõ]es?\s+negativas?|reclama[cç][oõ]es?)/i,
  /they\s+(don['']?t\s+want\s+you\s+to\s+know|are\s+jealous|are\s+afraid)/i,
  /eles\s+(n[aã]o\s+querem\s+que\s+voc[eê]\s+saiba|t[eê]m\s+inveja|est[aã]o\s+com\s+medo)/i,
  /the\s+(banks?|government|elite|system)\s+(doesn['']?t\s+want\s+you\s+to\s+know|is\s+hiding)/i,
  /os?\s+(bancos?|governo|elite|sistema)\s+(n[aã]o\s+quer\s+que\s+voc[eê]\s+saiba|est[aá]\s+escondendo)/i,
  // Procon / Reclame Aqui / complaint site mentions (defensive)
  /reclame\s+aqui\s+(n[aã]o\s+[eé]\s+confi[aá]vel|[eé]\s+mentira|[eé]\s+falso)/i,
  /procon\s+(n[aã]o\s+[eé]\s+confi[aá]vel|[eé]\s+mentira|[eé]\s+falso)/i,
  /ignore\s+(reclame\s+aqui|procon|trustpilot|bbb\s+complaints?)/i,
];

// ─── GURU PERSONA PATTERNS ────────────────────────────────────────────────────
// The "guru" archetype is a red flag. Each match adds 12 pts.

const GURU_PERSONA_PATTERNS = [
  // English
  /self[\s-]?made\s+(millionaire|billionaire|entrepreneur)\s+(teaches?|reveals?|shows?)/i,
  /from\s+(rags?\s+to\s+riches?|nothing\s+to\s+millions?|broke\s+to\s+rich)/i,
  /i\s+(was\s+)?(broke|homeless|in\s+debt|struggling)\s+(before|until)\s+i\s+(discovered|found|created)/i,
  /my\s+(secret|method|system|formula|blueprint)\s+(that\s+)?(made\s+me|turned\s+me\s+into)\s+(a\s+)?(millionaire|rich|wealthy)/i,
  /\d+[\s-]?year[\s-]?old\s+(millionaire|entrepreneur|trader|investor)\s+(reveals?|teaches?|shows?)/i,
  /ex[\s-]?(employee|worker|teacher|nurse|driver)\s+(now\s+)?(makes?|earns?)\s+\$?\d+[k]?\s+(per|a)\s+(month|year)/i,
  /dropout\s+(who\s+)?(now\s+)?(makes?|earns?)\s+\$?\d+[k]?\s+(per|a)\s+(month|year)/i,
  /guru\s+(reveals?|teaches?|shows?|exposes?)\s+(secret|method|system|formula)/i,
  /online\s+(guru|coach|mentor)\s+(reveals?|teaches?|shows?)\s+(secret|method|system)/i,

  // Portuguese
  /milion[aá]rio\s+(auto[\s-]?feito|que\s+come[cç]ou\s+do\s+zero)\s+(ensina|revela|mostra)/i,
  /do\s+(nada|zero|falido|endividado)\s+ao\s+(milh[aã]o|milion[aá]rio|rico|sucesso)/i,
  /eu\s+(estava\s+)?(falido|sem\s+dinheiro|endividado|lutando)\s+(antes|at[eé])\s+(descobrir|encontrar|criar)/i,
  /meu\s+(segredo|m[eé]todo|sistema|f[oó]rmula|blueprint)\s+(que\s+)?(me\s+fez|me\s+tornou)\s+(milion[aá]rio|rico|bem[\s-]?sucedido)/i,
  /\d+\s+anos?\s+(milion[aá]rio|empreendedor|trader|investidor)\s+(revela|ensina|mostra)/i,
  /ex[\s-]?(funcion[aá]rio|trabalhador|professor|enfermeiro|motorista)\s+(agora\s+)?(ganha|fatura)\s+R?\$?\d+[k]?\s+(por|ao)\s+(m[eê]s|ano)/i,
  /guru\s+(revela|ensina|mostra|exp[oõ]e)\s+(segredo|m[eé]todo|sistema|f[oó]rmula)/i,
  /coach\s+(online\s+)?(revela|ensina|mostra)\s+(segredo|m[eé]todo|sistema)/i,
];

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────

function scoreGuruScam(text = '') {
  const source = String(text);
  let score = 0;
  const reasons = [];
  const flags = {
    guruCourse: 0,
    highPressure: 0,
    fakeSocialProof: 0,
    unrealisticROI: 0,
    complaintSignals: 0,
    guruPersona: 0,
  };

  for (const pattern of GURU_COURSE_PATTERNS) {
    if (pattern.test(source)) {
      score += 25;
      flags.guruCourse++;
      reasons.push(`guru-course:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of HIGH_PRESSURE_PATTERNS) {
    if (pattern.test(source)) {
      score += 15;
      flags.highPressure++;
      reasons.push(`high-pressure-sales:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of FAKE_SOCIAL_PROOF_PATTERNS) {
    if (pattern.test(source)) {
      score += 12;
      flags.fakeSocialProof++;
      reasons.push(`fake-social-proof:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of UNREALISTIC_ROI_PATTERNS) {
    if (pattern.test(source)) {
      score += 20;
      flags.unrealisticROI++;
      reasons.push(`unrealistic-roi:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of COMPLAINT_SIGNAL_PATTERNS) {
    if (pattern.test(source)) {
      score += 10;
      flags.complaintSignals++;
      reasons.push(`complaint-signal:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of GURU_PERSONA_PATTERNS) {
    if (pattern.test(source)) {
      score += 12;
      flags.guruPersona++;
      reasons.push(`guru-persona:${pattern.source.substring(0, 50)}`);
    }
  }

  // ── COMBO AMPLIFIERS ──────────────────────────────────────────────────────
  // When multiple categories fire together, the scam probability is exponential.

  // Guru course + high pressure = classic scam funnel
  if (flags.guruCourse >= 1 && flags.highPressure >= 1) {
    score += 20;
    reasons.push('combo-amplifier:guru-course+high-pressure-sales-funnel');
  }

  // Unrealistic ROI + fake social proof = investment scam
  if (flags.unrealisticROI >= 1 && flags.fakeSocialProof >= 1) {
    score += 18;
    reasons.push('combo-amplifier:unrealistic-roi+fake-social-proof');
  }

  // Guru persona + course + pressure = full scam package
  if (flags.guruPersona >= 1 && flags.guruCourse >= 1 && flags.highPressure >= 1) {
    score += 25;
    reasons.push('combo-amplifier:FULL-SCAM-PACKAGE-guru+course+pressure');
  }

  // Multiple complaint signals = they've been reported before
  if (flags.complaintSignals >= 2) {
    score += 15;
    reasons.push('combo-amplifier:multiple-complaint-deflection-signals');
  }

  return { score, reasons, flags };
}

module.exports = { scoreGuruScam };
