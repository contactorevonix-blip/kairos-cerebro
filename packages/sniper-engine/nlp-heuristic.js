// KAIROS Engine — NLP Heuristic (Scam Matrix)
// Deep behavioral & intent analysis. The "Scam Matrix" detector.
// Analyzes CONTEXT and INTENT — not just keywords.
// If it smells like "easy money", the score goes UP automatically.

'use strict';

// ─── SCAM MATRIX DIMENSIONS ───────────────────────────────────────────────────
// The Scam Matrix fires when 2+ dimensions are detected simultaneously.
// Dimension 1: URGENCY — pressure to act NOW
// Dimension 2: UNREALISTIC ROI — promises of extraordinary returns
// Dimension 3: VAGUE METHODS — no real explanation of HOW
// Dimension 4: AUTHORITY BAIT — fake credibility signals
// Dimension 5: FEAR OF MISSING OUT — FOMO manipulation
// Dimension 6: IDENTITY ESCAPE — "quit your job", "fire your boss"

// ─── URGENCY SIGNALS ─────────────────────────────────────────────────────────
const URGENCY_SIGNALS = [
  // English
  /\b(act\s+now|right\s+now|immediately|instantly|today\s+only|tonight\s+only)\b/i,
  /\b(limited\s+(time|offer|spots?|seats?|places?|access))\b/i,
  /\b(expires?\s+(soon|tonight|in\s+\d+\s+(hours?|minutes?|days?)))\b/i,
  /\b(last\s+(chance|call|opportunity|warning))\b/i,
  /\b(don['']?t\s+(wait|delay|miss|hesitate))\b/i,
  /\b(closing\s+(soon|tonight|in\s+\d+))\b/i,
  /\b(hurry|rush|urgent|urgently|asap|immediately)\b/i,
  /\b(only\s+\d+\s+(spots?|seats?|places?|copies?|slots?)\s+(left|remaining|available))\b/i,
  /\b(price\s+(goes?\s+up|increases?|doubles?|triples?)\s+(in|after|at|tonight))\b/i,
  /\b(this\s+(offer|deal|price|discount|access)\s+(disappears?|ends?|closes?|expires?)\s+(soon|tonight|forever))\b/i,
  /\b(countdown|timer|deadline)\b/i,
  // Portuguese
  /\b(aja\s+agora|agora\s+mesmo|imediatamente|instantaneamente|s[oó]\s+hoje|s[oó]\s+esta\s+noite)\b/i,
  /\b(tempo\s+limitado|oferta\s+limitada|vagas?\s+limitadas?|acesso\s+limitado)\b/i,
  /\b(expira\s+(em\s+breve|hoje|em\s+\d+\s+(horas?|minutos?|dias?)))\b/i,
  /\b([uú]ltima\s+(chance|chamada|oportunidade|aviso))\b/i,
  /\b(n[aã]o\s+(espere|demore|perca|hesite))\b/i,
  /\b(fechando\s+(em\s+breve|hoje\s+[aà]\s+noite|em\s+\d+))\b/i,
  /\b(corra|urgente|urgentemente|imediato|imediatamente)\b/i,
  /\b(apenas\s+\d+\s+(vagas?|lugares?|c[oó]pias?|slots?)\s+(restantes?|dispon[ií]veis?|sobrando))\b/i,
  /\b(pre[cç]o\s+(sobe|aumenta|dobra|triplica)\s+(em|ap[oó]s|hoje\s+[aà]\s+noite))\b/i,
  /\b(contagem\s+regressiva|cronômetro|prazo)\b/i,
  // Spanish
  /\b(actúa\s+ahora|ahora\s+mismo|inmediatamente|solo\s+hoy|solo\s+esta\s+noche)\b/i,
  /\b(tiempo\s+limitado|oferta\s+limitada|plazas?\s+limitadas?)\b/i,
  /\b([uú]ltima\s+(oportunidad|llamada|advertencia))\b/i,
];

// ─── UNREALISTIC ROI SIGNALS ──────────────────────────────────────────────────
const UNREALISTIC_ROI_SIGNALS = [
  // Specific high-return claims
  /\b(\d{3,}%\s+(return|roi|profit|gain|yield|retorno|lucro|ganho|rendimento))\b/i,
  /\b(double|triple|10x|20x|50x|100x)\s+(your\s+)?(money|investment|income|returns?|dinheiro|investimento|renda)\b/i,
  /\b(dobrar|triplicar|multiplicar\s+por\s+\d+)\s+(seu\s+)?(dinheiro|investimento|renda)\b/i,
  // Specific income claims per time unit
  /\b(earn|make|generate|ganhar|faturar|gerar)\s+\$?\d{3,}[k]?\s*(per|a|por|ao)\s*(day|hour|week|month|dia|hora|semana|m[eê]s)\b/i,
  /\b\d{3,}\s*(€|\$|£|R\$)\s*(per|a|por|ao)\s*(day|hour|week|month|dia|hora|semana|m[eê]s)\b/i,
  // "From X to Y" transformation claims
  /\b(from|de)\s+(zero|\$0|€0|R\$0|nothing|broke|nada|falido)\s+(to|ao?)\s+(\$\d+[k]?|€\d+[k]?|R\$\d+[k]?|millionaire|milion[aá]rio|rich|rico)\b/i,
  // Guaranteed returns
  /\b(guaranteed|assured|promised|garantido|assegurado|prometido)\s+(return|profit|income|roi|retorno|lucro|renda)\b/i,
  /\b(return|profit|income|retorno|lucro|renda)\s+(guaranteed|assured|promised|garantido|assegurado|prometido)\b/i,
  // "Risk-free" investment
  /\b(risk[\s-]?free|sem\s+risco|sin\s+riesgo|sans\s+risque|kein\s+risiko)\s+(investment|investing|investimento|investir)\b/i,
  // Passive income machine
  /\b(passive|passiva|pasiva)\s+(income|renda|ingresos)\s+(machine|m[aá]quina|m[aá]quina)\b/i,
  /\b(money\s+while\s+you\s+sleep|dinheiro\s+enquanto\s+dorme|dinero\s+mientras\s+duermes)\b/i,
  /\b(autopilot|piloto\s+autom[aá]tico|autom[aá]tico)\s+(income|profit|renda|lucro)\b/i,
];

// ─── VAGUE METHOD SIGNALS ─────────────────────────────────────────────────────
// Scammers never explain HOW — they just promise WHAT.
const VAGUE_METHOD_SIGNALS = [
  // English
  /\b(secret\s+(method|formula|system|blueprint|hack|trick|code|strategy))\b/i,
  /\b(exclusive\s+(method|formula|system|blueprint|access|strategy|secret))\b/i,
  /\b(proprietary\s+(method|formula|system|algorithm|strategy))\b/i,
  /\b(revolutionary\s+(method|formula|system|approach|strategy))\b/i,
  /\b(proven\s+(method|formula|system|blueprint|strategy)\s+(that\s+)?(works?|generates?|makes?))\b/i,
  /\b(simple\s+(method|formula|system|trick|hack)\s+(to\s+)?(make|earn|generate|get\s+rich))\b/i,
  /\b(copy[\s-]?paste\s+(method|system|formula|blueprint|strategy))\b/i,
  /\b(done[\s-]?for[\s-]?you\s+(system|business|income|profit|funnel|solution))\b/i,
  /\b(no\s+experience\s+(needed|required|necessary))\b/i,
  /\b(anyone\s+can\s+do\s+(it|this))\b/i,
  /\b(works?\s+(for\s+anyone|even\s+if|while\s+you\s+sleep|on\s+autopilot))\b/i,
  /\b(step[\s-]?by[\s-]?step\s+(system|method|formula|blueprint)\s+(to\s+)?(get\s+rich|make\s+money|earn))\b/i,
  // Portuguese
  /\b(m[eé]todo\s+(secreto|exclusivo|propriet[aá]rio|revolucion[aá]rio|comprovado|simples))\b/i,
  /\b(f[oó]rmula\s+(secreta|exclusiva|propriet[aá]ria|revolucion[aá]ria|comprovada|simples))\b/i,
  /\b(sistema\s+(secreto|exclusivo|propriet[aá]rio|revolucion[aá]rio|comprovado|simples))\b/i,
  /\b(copiar\s+e\s+colar\s+(m[eé]todo|sistema|f[oó]rmula|estrat[eé]gia))\b/i,
  /\b(feito\s+para\s+voc[eê]\s+(sistema|neg[oó]cio|renda|lucro|funil))\b/i,
  /\b(sem\s+experi[eê]ncia\s+(necess[aá]ria|precisa|exigida))\b/i,
  /\b(qualquer\s+um\s+pode\s+(fazer|ganhar|lucrar))\b/i,
  /\b(funciona\s+(para\s+qualquer\s+um|mesmo\s+sem|enquanto\s+dorme|no\s+piloto\s+autom[aá]tico))\b/i,
  /\b(passo\s+a\s+passo\s+(sistema|m[eé]todo|f[oó]rmula)\s+(para\s+)?(ficar\s+rico|ganhar\s+dinheiro|lucrar))\b/i,
  // Spanish
  /\b(m[eé]todo\s+(secreto|exclusivo|revolucionario|probado|simple))\b/i,
  /\b(f[oó]rmula\s+(secreta|exclusiva|revolucionaria|probada|simple))\b/i,
  /\b(sin\s+experiencia\s+(necesaria|requerida))\b/i,
  /\b(cualquiera\s+puede\s+(hacerlo|ganar|lucrar))\b/i,
];

// ─── AUTHORITY BAIT SIGNALS ───────────────────────────────────────────────────
// Fake credibility: "as seen on TV", celebrity endorsements, fake awards
const AUTHORITY_BAIT_SIGNALS = [
  // English
  /\b(as\s+seen\s+on\s+(tv|cnn|bbc|fox|forbes|entrepreneur|cnbc|bloomberg))\b/i,
  /\b(featured\s+(in|on)\s+(forbes|entrepreneur|inc|time|cnn|bbc|bloomberg))\b/i,
  /\b(endorsed\s+by\s+(celebrities?|experts?|millionaires?|billionaires?|famous))\b/i,
  /\b(award[\s-]?winning\s+(system|method|formula|course|program))\b/i,
  /\b(world['']?s?\s+(#1|number\s+one|best|top)\s+(system|method|formula|course|program))\b/i,
  /\b(trusted\s+by\s+(over\s+)?\d+[k,]?\d*\s+(people|students?|members?|clients?))\b/i,
  /\b(join\s+(over\s+)?\d+[k,]?\d*\s+(happy\s+)?(people|students?|members?|clients?))\b/i,
  /\b(self[\s-]?made\s+(millionaire|billionaire|entrepreneur)\s+(reveals?|teaches?|shows?))\b/i,
  /\b(\d+[\s-]?year[\s-]?old\s+(millionaire|entrepreneur|trader|investor)\s+(reveals?|teaches?|shows?))\b/i,
  // Portuguese
  /\b(como\s+visto\s+(na\s+tv|no\s+jornal|na\s+globo|na\s+forbes|na\s+record))\b/i,
  /\b(destaque\s+(na|no)\s+(forbes|entrepreneur|inc|globo|record|sbt))\b/i,
  /\b(endossado\s+por\s+(celebridades?|especialistas?|milion[aá]rios?|famosos?))\b/i,
  /\b(premiado\s+(sistema|m[eé]todo|f[oó]rmula|curso|programa))\b/i,
  /\b(confiado\s+por\s+(mais\s+de\s+)?\d+[k,]?\d*\s+(pessoas?|alunos?|membros?|clientes?))\b/i,
  /\b(junte[\s-]?se\s+(a\s+mais\s+de\s+)?\d+[k,]?\d*\s+(alunos?|membros?|pessoas?)\s+(felizes?|satisfeitos?))\b/i,
  /\b(milion[aá]rio\s+(auto[\s-]?feito|que\s+come[cç]ou\s+do\s+zero)\s+(ensina|revela|mostra))\b/i,
  /\b(\d+\s+anos?\s+(milion[aá]rio|empreendedor|trader|investidor)\s+(revela|ensina|mostra))\b/i,
];

// ─── FOMO (FEAR OF MISSING OUT) SIGNALS ──────────────────────────────────────
const FOMO_SIGNALS = [
  // English
  /\b(don['']?t\s+(miss\s+(out|this)|be\s+left\s+behind|get\s+left\s+behind))\b/i,
  /\b(everyone\s+(is|else\s+is)\s+(doing\s+it|making\s+money|getting\s+rich))\b/i,
  /\b(your\s+(neighbors?|friends?|colleagues?|coworkers?)\s+(are\s+already|already)\s+(making|earning|profiting))\b/i,
  /\b(while\s+you\s+(sleep|work\s+your\s+9[\s-]?to[\s-]?5|struggle)\s+(others?\s+are|people\s+are)\s+(making|earning))\b/i,
  /\b(this\s+(opportunity|chance|offer)\s+(won['']?t\s+last|is\s+going\s+away|disappears?\s+soon))\b/i,
  /\b(once\s+(in\s+a\s+lifetime|this\s+is\s+gone|it['']?s\s+gone\s+forever))\b/i,
  /\b(you\s+(can['']?t\s+afford\s+to\s+miss|would\s+be\s+crazy\s+to\s+miss)\s+this)\b/i,
  /\b(imagine\s+(your\s+life|yourself)\s+(with|having|making)\s+\$?\d+[k]?\s+(per|a)\s+(day|month|week))\b/i,
  // Portuguese
  /\b(n[aã]o\s+(perca|fique\s+de\s+fora|seja\s+deixado\s+para\s+tr[aá]s))\b/i,
  /\b(todo\s+mundo\s+(est[aá]|j[aá]\s+est[aá])\s+(fazendo|ganhando|ficando\s+rico))\b/i,
  /\b(seus?\s+(vizinhos?|amigos?|colegas?)\s+(j[aá]\s+est[aã]o|est[aã]o\s+j[aá])\s+(ganhando|lucrando|faturando))\b/i,
  /\b(enquanto\s+voc[eê]\s+(dorme|trabalha\s+das\s+9\s+[aà]s\s+18|luta)\s+(outros?\s+est[aã]o|pessoas\s+est[aã]o)\s+(ganhando|lucrando))\b/i,
  /\b(esta\s+(oportunidade|chance|oferta)\s+(n[aã]o\s+vai\s+durar|vai\s+embora|desaparece\s+em\s+breve))\b/i,
  /\b(uma\s+vez\s+na\s+vida|quando\s+isso\s+sumir|quando\s+acabar\s+n[aã]o\s+tem\s+mais)\b/i,
  /\b(imagine\s+(sua\s+vida|voc[eê])\s+(com|tendo|ganhando)\s+R?\$?\d+[k]?\s+(por|ao)\s+(dia|m[eê]s|semana))\b/i,
];

// ─── IDENTITY ESCAPE SIGNALS ──────────────────────────────────────────────────
// "Quit your job", "fire your boss" — classic scam course hook
const IDENTITY_ESCAPE_SIGNALS = [
  // English
  /\b(quit\s+(your\s+)?(job|9[\s-]?to[\s-]?5|day\s+job|boss))\b/i,
  /\b(fire\s+(your\s+boss|your\s+employer))\b/i,
  /\b(escape\s+(the\s+)?(rat\s+race|9[\s-]?to[\s-]?5|corporate\s+world|matrix))\b/i,
  /\b(financial\s+freedom\s+(in\s+\d+\s+(days?|weeks?|months?)|fast|quickly|now|guaranteed))\b/i,
  /\b(never\s+(work\s+again|have\s+to\s+work|go\s+back\s+to\s+work))\b/i,
  /\b(work\s+from\s+(anywhere|home|beach|laptop))\b/i,
  /\b(be\s+your\s+own\s+boss)\b/i,
  /\b(live\s+(the\s+)?(laptop|freedom|dream)\s+lifestyle)\b/i,
  /\b(travel\s+the\s+world\s+(while|and)\s+(making|earning)\s+money)\b/i,
  /\b(9[\s-]?to[\s-]?5)\b/i,
  /\b(dead[\s-]?end\s+(job|career|work))\b/i,
  // Portuguese
  /\b(largue\s+(o\s+)?(emprego|trabalho|chefe))\b/i,
  /\b(demita\s+(o\s+)?(seu\s+)?(chefe|patr[aã]o|empregador))\b/i,
  /\b(escape\s+(da\s+)?(corrida\s+dos\s+ratos|mundo\s+corporativo|matrix))\b/i,
  /\b(liberdade\s+financeira\s+(em\s+\d+\s+(dias?|semanas?|meses?)|r[aá]pido|rapidamente|agora|garantida))\b/i,
  /\b(nunca\s+(mais\s+trabalhar|precisar\s+trabalhar|voltar\s+a\s+trabalhar))\b/i,
  /\b(trabalhar\s+de\s+(qualquer\s+lugar|casa|praia|laptop))\b/i,
  /\b(seja\s+seu\s+pr[oó]prio\s+chefe)\b/i,
  /\b(viver\s+(o\s+)?(estilo\s+de\s+vida\s+de\s+)?(laptop|liberdade|sonho))\b/i,
  /\b(viajar\s+o\s+mundo\s+(enquanto|e)\s+(ganha|fatura)\s+dinheiro)\b/i,
  /\b(trabalho\s+de\s+qualquer\s+lugar)\b/i,
  /\b(largou\s+o\s+emprego)\b/i,
  // Spanish
  /\b(renuncia\s+(a\s+tu\s+)?(trabajo|jefe|empleo))\b/i,
  /\b(libertad\s+financiera\s+(en\s+\d+\s+(d[ií]as?|semanas?|meses?)|r[aá]pido|ahora|garantizada))\b/i,
  /\b(trabaja\s+desde\s+(cualquier\s+lugar|casa|playa|laptop))\b/i,
];

// ─── EASY MONEY CONTEXT DETECTOR ─────────────────────────────────────────────
// Detects the overall "easy money" narrative even when individual keywords are disguised
const EASY_MONEY_CONTEXT_PATTERNS = [
  // The "I was broke, now I'm rich" narrative
  /\b(was\s+(broke|homeless|in\s+debt|struggling|poor)|era\s+(falido|sem\s+dinheiro|endividado|pobre))\b.*\b(now\s+(i\s+)?(make|earn|have)|agora\s+(eu\s+)?(ganho|tenho|fatura))\b/is,
  // The "no skills needed" narrative
  /\b(no\s+(skills?|experience|knowledge|education|degree)\s+(needed|required|necessary))\b/i,
  /\b(sem\s+(habilidades?|experi[eê]ncia|conhecimento|educa[cç][aã]o|diploma)\s+(necess[aá]rios?|preciso|exigido))\b/i,
  // The "works while you sleep" narrative
  /\b(earn(ing)?|mak(ing)?|generat(ing)?|ganhar|ganhando|faturar|faturando)\s+(money\s+while\s+you\s+sleep|dinheiro\s+enquanto\s+dorme)\b/i,
  // The "laptop lifestyle" narrative
  /\b(laptop\s+lifestyle|estilo\s+de\s+vida\s+laptop|vida\s+de\s+laptop)\b/i,
  // The "anyone can do it" narrative
  /\b(anyone\s+can\s+(do\s+it|make\s+money|get\s+rich)|qualquer\s+um\s+pode\s+(fazer|ganhar|ficar\s+rico))\b/i,
  // The "I'll show you how" narrative (without explaining)
  /\b(i['']?ll\s+show\s+you\s+(exactly\s+)?how\s+(i\s+)?(made|make|earn)\s+\$?\d+[k]?)\b/i,
  /\b(vou\s+te\s+mostrar\s+(exatamente\s+)?como\s+(eu\s+)?(fiz|fa[cç]o|ganho)\s+R?\$?\d+[k]?)\b/i,
  // The "this changed my life" narrative
  /\b(this\s+(changed|transformed|revolutionized)\s+my\s+(life|finances|income))\b/i,
  /\b(isso\s+(mudou|transformou|revolucionou)\s+minha\s+(vida|finan[cç]as|renda))\b/i,
  // The "they don't want you to know" conspiracy narrative
  /\b(they\s+don['']?t\s+want\s+you\s+to\s+know\s+(this|about\s+this|the\s+truth))\b/i,
  /\b(eles\s+n[aã]o\s+querem\s+que\s+voc[eê]\s+saiba\s+(disso|sobre\s+isso|a\s+verdade))\b/i,
  /\b(os?\s+(bancos?|governo|elite|sistema)\s+est[aá]\s+(escondendo|ocultando)\s+(isso|a\s+verdade))\b/i,
  // The "limited beta" / "exclusive group" narrative
  /\b(exclusive\s+(beta|group|community|mastermind|inner\s+circle)\s+(of\s+)?(only\s+)?\d+\s+(people|members?))\b/i,
  /\b(grupo\s+(exclusivo|fechado|vip|secreto)\s+(de\s+)?(apenas\s+)?\d+\s+(pessoas?|membros?))\b/i,
];

// ─── SCAM MATRIX SCORER ───────────────────────────────────────────────────────
// Detects INTENT by measuring how many
// dimensions of the Scam Matrix are present simultaneously.

function scoreNLPHeuristic(text = '') {
  const source = String(text);
  let score = 0;
  const reasons = [];
  const dimensions = {
    urgency: 0,
    unrealisticROI: 0,
    vagueMethod: 0,
    authorityBait: 0,
    fomo: 0,
    identityEscape: 0,
    easyMoneyContext: 0,
  };

  // ── Scan each dimension ──────────────────────────────────────────────────
  for (const pattern of URGENCY_SIGNALS) {
    if (pattern.test(source)) {
      dimensions.urgency++;
      reasons.push(`nlp-urgency:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of UNREALISTIC_ROI_SIGNALS) {
    if (pattern.test(source)) {
      dimensions.unrealisticROI++;
      reasons.push(`nlp-unrealistic-roi:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of VAGUE_METHOD_SIGNALS) {
    if (pattern.test(source)) {
      dimensions.vagueMethod++;
      reasons.push(`nlp-vague-method:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of AUTHORITY_BAIT_SIGNALS) {
    if (pattern.test(source)) {
      dimensions.authorityBait++;
      reasons.push(`nlp-authority-bait:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of FOMO_SIGNALS) {
    if (pattern.test(source)) {
      dimensions.fomo++;
      reasons.push(`nlp-fomo:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of IDENTITY_ESCAPE_SIGNALS) {
    if (pattern.test(source)) {
      dimensions.identityEscape++;
      reasons.push(`nlp-identity-escape:${pattern.source.substring(0, 50)}`);
    }
  }

  for (const pattern of EASY_MONEY_CONTEXT_PATTERNS) {
    if (pattern.test(source)) {
      dimensions.easyMoneyContext++;
      reasons.push(`nlp-easy-money-context:${pattern.source.substring(0, 50)}`);
    }
  }

  // ── Base scoring per dimension ────────────────────────────────────────────
  // Each dimension hit adds points proportional to its danger level
  score += Math.min(dimensions.urgency * 6, 24);           // max 24 pts
  score += Math.min(dimensions.unrealisticROI * 12, 36);   // max 36 pts
  score += Math.min(dimensions.vagueMethod * 8, 24);       // max 24 pts
  score += Math.min(dimensions.authorityBait * 7, 21);     // max 21 pts
  score += Math.min(dimensions.fomo * 6, 18);              // max 18 pts
  score += Math.min(dimensions.identityEscape * 8, 24);    // max 24 pts
  score += Math.min(dimensions.easyMoneyContext * 10, 30); // max 30 pts

  // ── SCAM MATRIX COMBO AMPLIFIERS ─────────────────────────────────────────
  // The Scam Matrix fires when multiple dimensions are active simultaneously.
  // This is the KEY insight: scammers use ALL these tactics together.

  const activeDimensions = Object.values(dimensions).filter(v => v > 0).length;

  // 2 dimensions active = suspicious
  if (activeDimensions >= 2) {
    score += 15;
    reasons.push(`scam-matrix:2-dimensions-active(${activeDimensions})`);
  }

  // 3 dimensions active = high risk
  if (activeDimensions >= 3) {
    score += 20;
    reasons.push(`scam-matrix:3-dimensions-active(${activeDimensions})`);
  }

  // 4+ dimensions active = confirmed scam pattern
  if (activeDimensions >= 4) {
    score += 30;
    reasons.push(`scam-matrix:CONFIRMED-SCAM-PATTERN-${activeDimensions}-dimensions-active`);
  }

  // 5+ dimensions = FATAL — this is a textbook scam
  if (activeDimensions >= 5) {
    score += 20;
    reasons.push(`scam-matrix:FATAL-TEXTBOOK-SCAM-${activeDimensions}-dimensions-active`);
  }

  // Specific deadly combos
  if (dimensions.urgency >= 1 && dimensions.unrealisticROI >= 1 && dimensions.vagueMethod >= 1) {
    score += 25;
    reasons.push('scam-matrix:DEADLY-COMBO:urgency+unrealistic-roi+vague-method');
  }

  if (dimensions.identityEscape >= 1 && dimensions.easyMoneyContext >= 1) {
    score += 15;
    reasons.push('scam-matrix:DEADLY-COMBO:identity-escape+easy-money-context');
  }

  if (dimensions.authorityBait >= 1 && dimensions.fomo >= 1 && dimensions.unrealisticROI >= 1) {
    score += 20;
    reasons.push('scam-matrix:DEADLY-COMBO:authority-bait+fomo+unrealistic-roi');
  }

  // "Easy money" context alone is a strong signal
  if (dimensions.easyMoneyContext >= 2) {
    score += 20;
    reasons.push('scam-matrix:MULTIPLE-EASY-MONEY-NARRATIVES');
  }

  return {
    score,
    reasons,
    dimensions,
    activeDimensions,
  };
}

module.exports = { scoreNLPHeuristic };
