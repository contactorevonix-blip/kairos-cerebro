// KAIROS — Global product showcase (landing)
// Self-contained HTML. i18n (5 locales), FX display, /api/geo, PLANS → pricing.
//
// Styling: system UI font stack (crisp metrics on Windows/macOS), scoped `#kairos-landing`.
// v6 landing — Outfit + JetBrains Mono, design tokens, cred strip. Typo lock in JS avoids mutating html/body inline styles.

'use strict';

const { readGlobalMetrics } = require('../sniper-db');
const { PLANS } = require('../billing');

/** @type {Record<string, Record<string, string>>} */
const I18N = {
  en: {
    metaTitle: 'Kairos Check — OSINT fraud scoring API for indie devs',
    metaDesc: 'Self-serve fraud scoring API for SaaS founders and indie devs. 8-layer OSINT engine, GDPR-native, zero external dependencies. Free tier included.',
    navProduct: 'Product',
    navPricing: 'Pricing',
    navApi: 'API',
    navTrust: 'Trust',
    navDashboard: 'Dashboard',
    navCta: 'Verify now',
    heroKicker: 'Infrastructure, not a gimmick',
    heroH1a: 'Stop fraud',
    heroH1b: 'before checkout.',
    heroLead: 'A deterministic eight-layer engine, cross-tenant reputation graph, and GDPR-first OSINT architecture — exposed as a single REST API your risk team can trust.',
    heroCtaPrimary: 'Run instant check',
    heroCtaSecondary: 'View API contract',
    heroMicro: 'No account required for the public demo. We never store raw PII — pseudonymized at write.',
    heroPanelAria: 'Example verification API response',
    heroPanelLabel: 'kairos — verify · production',
    secProduct: '01 · Product',
    secPricing: '02 · Pricing',
    secApi: '03 · Integration',
    secTrust: '04 · Trust',
    trustStripAria: 'Compliance and architecture signals',
    trustChip1: 'GDPR Art.15 / 17 endpoints',
    trustChip2: 'OSINT-only inputs',
    trustChip3: 'Pseudonymized at rest',
    trustChip4: 'SHA-256 audit chain',
    metricsBlocked: 'Threat signals (blocked)',
    metricsReviews: 'Flagged for review',
    metricsVolume: 'Verifications served',
    bentoTitle: 'Eight layers. One verdict.',
    bentoLead: 'Everything below is live in production — not a roadmap slide.',
    layerCore: 'Core & language risk',
    layerGuru: 'Guru & pyramid patterns',
    layerRep: 'Reputation forensics',
    layerNlp: 'Scam-matrix NLP',
    layerLive: 'Complaint-evasion signals',
    layerCheckout: 'Links & checkout DNA',
    layerNgram: 'Novel playbook similarity',
    layerGraph: 'Cross-tenant reputation graph',
    networkTitle: 'Network effect moat',
    networkBody: 'Every verification updates a time-decayed graph. Bad actors compound their score — good traffic does not pollute the prior.',
    pricingTitle: 'Plans that scale with risk volume',
    pricingLead: 'Prices anchor in EUR; shown currencies are indicative FX for display. Stripe bills in your configured region.',
    planFree: 'Seed risk data',
    planPro: 'Individual power users',
    planBiz: 'Growing product teams',
    planPilot: 'Banks & PSP pilots',
    planEnt: 'Global programmes',
    customPrice: 'Custom',
    perMonth: '/mo',
    reqMin: 'req/min',
    ctaStart: 'Start with API key',
    ctaTalk: 'Talk to us',
    apiTitle: 'Integrate in one POST',
    apiLead: 'Authenticate with x-api-key. Same payload from server, extension, or batch job.',
    apiCopy: 'Copy',
    apiCopied: 'Copied',
    verifyTitle: 'Live verifier',
    verifyPlaceholder: 'Paste suspicious message, landing copy, or IM text…',
    verifyRun: 'Analyze',
    verifyAnalyzing: 'Running engine…',
    verdictBlock: 'BLOCK',
    verdictReview: 'REVIEW',
    verdictAllow: 'ALLOW',
    verdictRec: 'Do not share banking or ID data. Verify through official channels only.',
    rateLimited: 'Rate limit reached. Upgrade or retry shortly.',
    trustTitle: 'Trust & compliance',
    trust1: 'OSINT-only: public or user-pasted content only',
    trust2: 'Salted pseudonymization before any disk write',
    trust3: 'Tamper-evident audit chain (SHA-256 linked)',
    trust4: 'GDPR Art.15 / Art.17 endpoints live',
    footerProduct: 'Product',
    footerLegal: 'Legal',
    footerPrivacy: 'Privacy (policy)',
    footerRights: 'Data rights',
    langLabel: 'Language',
    currLabel: 'Display currency',
    geoHint: 'Region hint',
    notForHumans: 'Operational telemetry — not marketing estimates.',
  },
  pt: {
    metaTitle: 'Kairos Check — API de scoring anti-fraude OSINT',
    metaDesc: 'API OSINT de scoring de fraude self-serve para devs e founders. Motor de 8 camadas, RGPD-native, zero dependências externas. Tier grátis incluído.',
    navProduct: 'Produto',
    navPricing: 'Preços',
    navApi: 'API',
    navTrust: 'Confiança',
    navDashboard: 'Painel',
    navCta: 'Verificar agora',
    heroKicker: 'Infra-estrutura real',
    heroH1a: 'Pare a fraude',
    heroH1b: 'antes do checkout.',
    heroLead: 'Motor determinístico de oito camadas, grafo de reputação transversal e arquitectura OSINT RGPD-first — exposta como REST API que a sua equipa de risco pode auditar.',
    heroCtaPrimary: 'Verificação instantânea',
    heroCtaSecondary: 'Contrato da API',
    heroMicro: 'Demo pública sem conta. Não armazenamos dados pessoais em claro — pseudonimização na escrita.',
    heroPanelAria: 'Exemplo de resposta da API de verificação',
    heroPanelLabel: 'kairos — verificar · produção',
    secProduct: '01 · Produto',
    secPricing: '02 · Preços',
    secApi: '03 · Integração',
    secTrust: '04 · Conformidade',
    trustStripAria: 'Sinais de conformidade e arquitetura',
    trustChip1: 'RGPD Art.15 / 17 em produção',
    trustChip2: 'Entradas só OSINT',
    trustChip3: 'Pseudonimização em repouso',
    trustChip4: 'Cadeia de auditoria SHA-256',
    metricsBlocked: 'Sinais bloqueados',
    metricsReviews: 'Em revisão',
    metricsVolume: 'Verificações processadas',
    bentoTitle: 'Oito camadas. Um veredicto.',
    bentoLead: 'Tudo o que segue está em produção — não é roadmap.',
    layerCore: 'Risco core e multi-idioma',
    layerGuru: 'Padrões guru e pirâmide',
    layerRep: 'Forensics de reputação',
    layerNlp: 'NLP — matriz de scam',
    layerLive: 'Evasão de reclamações',
    layerCheckout: 'Links e DNA de checkout',
    layerNgram: 'Similaridade de playbooks',
    layerGraph: 'Grafo de reputação global',
    networkTitle: 'Muralha de efeito de rede',
    networkBody: 'Cada verificação actualiza um grafo com decaimento temporal. Actores maliciosos acumulam score — tráfego legítimo não contamina o prior.',
    pricingTitle: 'Planos que escalam com o volume',
    pricingLead: 'Preços ancorados em EUR; outras moedas são FX indicativo. A fatura Stripe segue a sua região configurada.',
    planFree: 'Dados de risco iniciais',
    planPro: 'Utilizadores avançados',
    planBiz: 'Equipas de produto',
    planPilot: 'Pilotos bancários e PSP',
    planEnt: 'Programas globais',
    customPrice: 'Sob medida',
    perMonth: '/mês',
    reqMin: 'ped/min',
    ctaStart: 'Começar com chave API',
    ctaTalk: 'Falar connosco',
    apiTitle: 'Integração num POST',
    apiLead: 'Autenticação x-api-key. Mesmo payload em servidor, extensão ou job em lote.',
    apiCopy: 'Copiar',
    apiCopied: 'Copiado',
    verifyTitle: 'Verificador ao vivo',
    verifyPlaceholder: 'Cole texto suspeito, copy de landing ou mensagem…',
    verifyRun: 'Analisar',
    verifyAnalyzing: 'A executar motor…',
    verdictBlock: 'BLOQUEAR',
    verdictReview: 'REVISÃO',
    verdictAllow: 'PERMITIR',
    verdictRec: 'Não partilhe dados bancários ou de identidade. Confirme por canais oficiais.',
    rateLimited: 'Limite atingido. Faça upgrade ou tente mais tarde.',
    trustTitle: 'Confiança e conformidade',
    trust1: 'Só OSINT: conteúdo público ou colado pelo utilizador',
    trust2: 'Pseudonimização com salt antes de escrever em disco',
    trust3: 'Cadeia de auditoria à prova de adulteração (SHA-256)',
    trust4: 'Endpoints RGPD Art.15 / Art.17 disponíveis',
    footerProduct: 'Produto',
    footerLegal: 'Legal',
    footerPrivacy: 'Privacidade',
    footerRights: 'Direitos dos titulares',
    langLabel: 'Idioma',
    currLabel: 'Moeda de exibição',
    geoHint: 'Região',
    notForHumans: 'Telemetria operacional — não são números de marketing.',
  },
  es: {
    metaTitle: 'Kairos Check — API de scoring antifraude OSINT',
    metaDesc: 'API OSINT de scoring de fraude self-serve para devs y founders. Motor de 8 capas, RGPD-nativo, cero dependencias. Capa gratuita incluida.',
    navProduct: 'Producto',
    navPricing: 'Precios',
    navApi: 'API',
    navTrust: 'Confianza',
    navDashboard: 'Panel',
    navCta: 'Verificar',
    heroKicker: 'Infraestructura real',
    heroH1a: 'Detén el fraude',
    heroH1b: 'antes del checkout.',
    heroLead: 'Motor determinista de ocho capas, grafo de reputación transversal y arquitectura OSINT RGPD — como una API REST auditable.',
    heroCtaPrimary: 'Verificar ahora',
    heroCtaSecondary: 'Contrato API',
    heroMicro: 'Demo pública sin cuenta. No almacenamos PII en claro.',
    heroPanelAria: 'Ejemplo de respuesta de verificación',
    heroPanelLabel: 'kairos — verificar · producción',
    secProduct: '01 · Producto',
    secPricing: '02 · Precios',
    secApi: '03 · Integración',
    secTrust: '04 · Cumplimiento',
    trustStripAria: 'Señales de cumplimiento',
    trustChip1: 'RGPD Art.15 / 17 en vivo',
    trustChip2: 'Solo entradas OSINT',
    trustChip3: 'Seudoanonimizado en reposo',
    trustChip4: 'Cadena de auditoría SHA-256',
    metricsBlocked: 'Bloqueados',
    metricsReviews: 'En revisión',
    metricsVolume: 'Verificaciones',
    bentoTitle: 'Ocho capas. Un veredicto.',
    bentoLead: 'Todo está en producción.',
    layerCore: 'Riesgo core multilingüe',
    layerGuru: 'Patrones guru / pirámide',
    layerRep: 'Forensia reputacional',
    layerNlp: 'NLP matriz de estafa',
    layerLive: 'Evasión de reclamaciones',
    layerCheckout: 'Enlaces y checkout',
    layerNgram: 'Similitud de guiones',
    layerGraph: 'Grafo global',
    networkTitle: 'Ventaja de red',
    networkBody: 'Cada verificación enriquece el grafo con decaimiento temporal.',
    pricingTitle: 'Planes por volumen',
    pricingLead: 'Precios en EUR; otras divisas son orientativas. Stripe factura tu región.',
    planFree: 'Semilla de datos',
    planPro: 'Usuarios avanzados',
    planBiz: 'Equipos de producto',
    planPilot: 'Pilotos bancarios',
    planEnt: 'Programas globales',
    customPrice: 'A medida',
    perMonth: '/mes',
    reqMin: 'pet/min',
    ctaStart: 'Empezar con API key',
    ctaTalk: 'Contactar',
    apiTitle: 'Integra con un POST',
    apiLead: 'Autenticación x-api-key.',
    apiCopy: 'Copiar',
    apiCopied: 'Copiado',
    verifyTitle: 'Verificador',
    verifyPlaceholder: 'Pega texto sospechoso…',
    verifyRun: 'Analizar',
    verifyAnalyzing: 'Ejecutando…',
    verdictBlock: 'BLOQUEAR',
    verdictReview: 'REVISAR',
    verdictAllow: 'PERMITIR',
    verdictRec: 'No compartas datos bancarios. Verifica canales oficiales.',
    rateLimited: 'Límite alcanzado.',
    trustTitle: 'Confianza',
    trust1: 'Solo OSINT',
    trust2: 'Pseudonimización',
    trust3: 'Cadena de auditoría',
    trust4: 'RGPD vivo',
    footerProduct: 'Producto',
    footerLegal: 'Legal',
    footerPrivacy: 'Privacidad',
    footerRights: 'Derechos',
    langLabel: 'Idioma',
    currLabel: 'Moneda',
    geoHint: 'Región',
    notForHumans: 'Telemetría operativa.',
  },
  de: {
    metaTitle: 'Kairos Check — OSINT Fraud Scoring API',
    metaDesc: 'Self-serve OSINT Fraud Scoring API für Indie-Devs und SaaS-Gründer. 8-Schichten-Engine, DSGVO-nativ, keine externen Abhängigkeiten. Kostenloses Tier inklusive.',
    navProduct: 'Produkt',
    navPricing: 'Preise',
    navApi: 'API',
    navTrust: 'Vertrauen',
    navDashboard: 'Dashboard',
    navCta: 'Jetzt prüfen',
    heroKicker: 'Echte Infrastruktur',
    heroH1a: 'Betrug stoppen',
    heroH1b: 'vor dem Checkout.',
    heroLead: 'Deterministische Achtschicht-Engine, Reputationsgraph und DSGVO/OSINT-Architektur — als REST-API.',
    heroCtaPrimary: 'Sofort prüfen',
    heroCtaSecondary: 'API-Vertrag',
    heroMicro: 'Öffentliche Demo ohne Konto. Keine Klartext-PII auf Disk.',
    heroPanelAria: 'Beispiel einer Verifikationsantwort',
    heroPanelLabel: 'kairos — prüfen · produktion',
    secProduct: '01 · Produkt',
    secPricing: '02 · Preise',
    secApi: '03 · Integration',
    secTrust: '04 · Compliance',
    trustStripAria: 'Compliance- und Architektur-Signale',
    trustChip1: 'DSGVO Art.15 / 17 live',
    trustChip2: 'Nur OSINT-Eingaben',
    trustChip3: 'Pseudonymisierung at rest',
    trustChip4: 'SHA-256-Audit-Kette',
    metricsBlocked: 'Blockiert',
    metricsReviews: 'Review',
    metricsVolume: 'Prüfungen',
    bentoTitle: 'Acht Layer. Ein Urteil.',
    bentoLead: 'Alles produktiv.',
    layerCore: 'Core & Mehrsprache',
    layerGuru: 'Guru-/Pyramidenmuster',
    layerRep: 'Reputation',
    layerNlp: 'Scam-Matrix NLP',
    layerLive: 'Beschwerde-Umgehung',
    layerCheckout: 'Links & Checkout',
    layerNgram: 'Playbook-Ähnlichkeit',
    layerGraph: 'Reputationsgraph',
    networkTitle: 'Netzwerkvorteil',
    networkBody: 'Jede Prüfung aktualisiert den Graph mit Zeitabfall.',
    pricingTitle: 'Pläne nach Volumen',
    pricingLead: 'Preise in EUR; andere Währungen indicativ.',
    planFree: 'Start',
    planPro: 'Pro',
    planBiz: 'Business',
    planPilot: 'Institutionell',
    planEnt: 'Enterprise',
    customPrice: 'Individuell',
    perMonth: '/Monat',
    reqMin: 'Anfr/min',
    ctaStart: 'Mit API-Key starten',
    ctaTalk: 'Kontakt',
    apiTitle: 'Ein POST genügt',
    apiLead: 'x-api-key Auth.',
    apiCopy: 'Kopieren',
    apiCopied: 'Kopiert',
    verifyTitle: 'Live-Prüfer',
    verifyPlaceholder: 'Verdächtigen Text einfügen…',
    verifyRun: 'Analysieren',
    verifyAnalyzing: 'Motor läuft…',
    verdictBlock: 'BLOCK',
    verdictReview: 'REVIEW',
    verdictAllow: 'ERLAUBT',
    verdictRec: 'Keine Bankdaten teilen.',
    rateLimited: 'Limit erreicht.',
    trustTitle: 'Vertrauen',
    trust1: 'Nur OSINT',
    trust2: 'Pseudonymisierung',
    trust3: 'Audit-Kette',
    trust4: 'DSGVO API',
    footerProduct: 'Produkt',
    footerLegal: 'Legal',
    footerPrivacy: 'Datenschutz',
    footerRights: 'Betroffenenrechte',
    langLabel: 'Sprache',
    currLabel: 'Währung',
    geoHint: 'Region',
    notForHumans: 'Betriebsmetriken.',
  },
  fr: {
    metaTitle: 'Kairos Check — API de scoring antifraude OSINT',
    metaDesc: 'API OSINT de scoring antifraude self-serve pour devs et fondateurs SaaS. Moteur 8 couches, RGPD natif, zéro dépendances. Tier gratuit inclus.',
    navProduct: 'Produit',
    navPricing: 'Tarifs',
    navApi: 'API',
    navTrust: 'Confiance',
    navDashboard: 'Tableau',
    navCta: 'Vérifier',
    heroKicker: 'Infrastructure réelle',
    heroH1a: 'Stoppez la fraude',
    heroH1b: 'avant le paiement.',
    heroLead: 'Moteur déterministe à huit couches, graphe de réputation et architecture OSINT/RGPD — API REST auditable.',
    heroCtaPrimary: 'Vérifier',
    heroCtaSecondary: 'Contrat API',
    heroMicro: 'Démo sans compte. Pas de PII en clair.',
    heroPanelAria: 'Exemple de réponse de vérification',
    heroPanelLabel: 'kairos — vérifier · production',
    secProduct: '01 · Produit',
    secPricing: '02 · Tarifs',
    secApi: '03 · Intégration',
    secTrust: '04 · Conformité',
    trustStripAria: 'Signaux de conformité',
    trustChip1: 'RGPD Art.15 / 17 en production',
    trustChip2: 'Entrées OSINT uniquement',
    trustChip3: 'Pseudonymisation au repos',
    trustChip4: "Chaîne d'audit SHA-256",
    metricsBlocked: 'Bloqués',
    metricsReviews: 'En revue',
    metricsVolume: 'Vérifications',
    bentoTitle: 'Huit couches. Un verdict.',
    bentoLead: 'Tout est en production.',
    layerCore: 'Risque multilingue',
    layerGuru: 'Gourou / pyramide',
    layerRep: 'Réputation',
    layerNlp: 'NLP matrice',
    layerLive: 'Évasion plaintes',
    layerCheckout: 'Liens & checkout',
    layerNgram: 'Similarité playbook',
    layerGraph: 'Graphe global',
    networkTitle: 'Effet réseau',
    networkBody: 'Chaque vérification met à jour le graphe.',
    pricingTitle: 'Offres au volume',
    pricingLead: 'Prix en EUR; conversion indicative.',
    planFree: 'Amorçage',
    planPro: 'Pro',
    planBiz: 'Business',
    planPilot: 'Institutionnel',
    planEnt: 'Enterprise',
    customPrice: 'Sur mesure',
    perMonth: '/mois',
    reqMin: 'req/min',
    ctaStart: 'Clé API',
    ctaTalk: 'Contact',
    apiTitle: 'Intégration POST',
    apiLead: 'Auth x-api-key.',
    apiCopy: 'Copier',
    apiCopied: 'Copié',
    verifyTitle: 'Vérificateur',
    verifyPlaceholder: 'Collez le texte…',
    verifyRun: 'Analyser',
    verifyAnalyzing: 'Moteur…',
    verdictBlock: 'BLOQUER',
    verdictReview: 'REVUE',
    verdictAllow: 'AUTORISER',
    verdictRec: 'Ne partagez pas vos données bancaires.',
    rateLimited: 'Limite atteinte.',
    trustTitle: 'Confiance',
    trust1: 'OSINT uniquement',
    trust2: 'Pseudonymisation',
    trust3: "Chaîne d'audit",
    trust4: 'RGPD',
    footerProduct: 'Produit',
    footerLegal: 'Mentions',
    footerPrivacy: 'Confidentialité',
    footerRights: 'Droits',
    langLabel: 'Langue',
    currLabel: 'Devise',
    geoHint: 'Région',
    notForHumans: 'Télémétrie opérationnelle.',
  },
};

const PLAN_LABEL_KEYS = {
  kairos_free: 'planFree',
  kairos_pro: 'planPro',
  kairos_business: 'planBiz',
  kairos_b2b_pilot: 'planPilot',
  kairos_enterprise: 'planEnt',
};

function escapeJsonForScript(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function renderLandingPage() {
  const stats = readGlobalMetrics();
  const plansForClient = Object.values(PLANS).map((p) => ({
    id: p.id,
    name: p.name,
    priceEurMonthly: p.priceEurMonthly,
    rateLimitPerMinute: p.rateLimitPerMinute,
    entitlements: p.entitlements,
    labelKey: PLAN_LABEL_KEYS[p.id] || 'planFree',
  }));

  const ssr = {
    blocked: stats.blocked,
    review: stats.review,
    allowed: stats.allowed,
    verifyRequests: stats.verifyRequests,
    protectedEur: stats.estimatedProtectedValueEur,
  };

  const i18nJson = escapeJsonForScript(I18N);
  const plansJson = escapeJsonForScript(plansForClient);
  const ssrJson = escapeJsonForScript(ssr);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Kairos Check — OSINT fraud scoring API for indie devs</title>
  <meta name="description" content="Kairos Check: self-serve OSINT fraud scoring API for indie devs and SaaS founders. 8-layer engine, GDPR-native, zero external dependencies. Free tier included."/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="Kairos Check"/>
  <meta property="og:title" content="Kairos Check — OSINT fraud scoring API"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    :root{
      --void:#000000;--deep:#06070d;--card:#0d0e18;--lift:#14151f;
      --border:rgba(255,255,255,0.07);--border-accent:rgba(60,234,187,0.2);
      --mint:#3ceabb;--mint-dim:rgba(60,234,187,0.12);--mint-glow:rgba(60,234,187,0.25);
      --violet:#7c6ff7;--red:#ff3b30;--amber:#ff9500;
      --text:#f0f2f5;--muted:#8b929e;--dim:#4a5568;
      --font:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      --mono:"JetBrains Mono",ui-monospace,"Cascadia Code",monospace;
      --ease:cubic-bezier(0.16,1,0.3,1);
      --r:12px;--rl:20px;
    }
    html{font-size:16px;-webkit-text-size-adjust:100%;text-size-adjust:100%}
    body{
      margin:0;min-height:100vh;font-family:var(--font);font-size:1rem;
      line-height:1.6;color:var(--text);background:var(--void);overflow-x:clip;
      -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
      letter-spacing:-0.006em;
    }
    h1,h2,h3{margin:0;font-weight:800;line-height:1.08;letter-spacing:-0.04em}
    p{margin:0}
    a{color:var(--mint);text-decoration:none}
    a:hover{text-decoration:underline;text-underline-offset:3px}
    button{cursor:pointer;font-family:var(--font)}
    #kl,#kl *:not(.k-fx):not(.k-fx *){font-stretch:normal!important;font-variation-settings:normal!important}
    #kl *:not(.k-fx):not(.k-fx *){transform:none!important}
    .kn{position:sticky;top:0;z-index:100;background:rgba(0,0,0,0.82);border-bottom:1px solid var(--border);backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);transition:transform 0.3s ease}
    .kn.kn-hidden{transform:translateY(-100%)}
    .kn-i{max-width:1200px;margin:0 auto;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem;height:60px}
    .kn-brand{display:inline-flex;align-items:center;gap:.6rem;text-decoration:none}
    .kn-logo{display:block;width:32px;height:32px;flex-shrink:0}
    .kn-name{font-weight:800;font-size:1rem;letter-spacing:-0.03em;color:var(--text)}
    .kn-links{display:flex;align-items:center;gap:.1rem}
    .kn-links a{color:var(--muted);font-size:.8125rem;font-weight:500;padding:.4rem .65rem;border-radius:8px;letter-spacing:-0.01em}
    .kn-links a:hover{color:var(--text);background:rgba(255,255,255,.05);text-decoration:none}
    .kn-right{display:flex;align-items:center;gap:.5rem}
    .kn-sel{background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted);border-radius:8px;padding:.38rem .55rem;font-size:.73rem;font-family:var(--font);font-weight:500}
    .kn-badge{font-size:.625rem;font-weight:700;letter-spacing:.05em;color:var(--mint);background:var(--mint-dim);border:1px solid rgba(60,234,187,.25);border-radius:6px;padding:3px 8px}
    .kb{display:inline-flex;align-items:center;justify-content:center;padding:.58rem 1.15rem;border-radius:var(--r);font-size:.8125rem;font-weight:600;font-family:var(--font);border:1px solid transparent;text-decoration:none;letter-spacing:-0.01em;position:relative;overflow:hidden}
    .kb-mint{background:var(--mint);color:#000}
    .kb-mint:hover{background:#5af2ca;text-decoration:none}
    .kb-ghost{background:rgba(255,255,255,.05);color:var(--text);border-color:var(--border)}
    .kb-ghost:hover{border-color:rgba(255,255,255,.15);text-decoration:none}
    .kb-lg{padding:.75rem 1.5rem;font-size:.9375rem;border-radius:var(--rl)}
    .ks{max-width:1200px;margin:0 auto;padding:0 1.5rem;position:relative;z-index:1}
    .k-hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8rem 1.5rem 4rem;position:relative;overflow:hidden}
    .k-hero-grid{display:flex;flex-direction:column;align-items:center;gap:0;width:100%;max-width:900px}
    .k-hero-eyebrow{margin-bottom:1.75rem}
    .k-h1{font-size:clamp(3.5rem,8vw,7rem);font-weight:900;line-height:1.0;letter-spacing:-0.05em;margin-bottom:1.5rem;max-width:none}
    .k-hero-lead{font-size:1.125rem;max-width:36rem;margin:0 auto 2.5rem;letter-spacing:-0.008em}
    .k-hero-ctas{justify-content:center;margin-bottom:1.5rem}
    .k-hero-trust{justify-content:center}
    .k-metrics-strip{display:flex;gap:3rem;justify-content:center;margin-top:3rem;flex-wrap:wrap}
    .k-metric-card{background:none;border:none;border-radius:0;text-align:center;padding:0;backdrop-filter:none;-webkit-backdrop-filter:none}
    .k-metric-label{font-size:.625rem}
    .k-metric-val{font-size:2rem}
    .k-hero-vis{display:none}
    .k-hero-eyebrow{display:inline-flex;align-items:center;gap:.5rem;font-size:.6875rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--violet);margin-bottom:1.5rem}
    .k-hero-eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--violet);box-shadow:0 0 10px var(--violet);flex-shrink:0;animation:kPulse 2s ease-in-out infinite}
    @keyframes kPulse{0%,100%{opacity:1;box-shadow:0 0 10px var(--violet)}50%{opacity:.4;box-shadow:none}}
    .k-h1{font-size:clamp(3rem,5.5vw + .5rem,5.5rem);font-weight:900;line-height:1.02;letter-spacing:-0.05em;color:var(--text);margin-bottom:1.5rem}
    .k-h1-line2{display:block;background:linear-gradient(90deg,var(--mint) 0%,#8cf5de 50%,var(--mint) 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:kShimmer 4s linear infinite}
    @keyframes kShimmer{0%{background-position:0% center}100%{background-position:200% center}}
    .k-hero-lead{font-size:1.0625rem;color:var(--muted);line-height:1.75;letter-spacing:-0.008em;max-width:38rem;margin-bottom:2rem}
    .k-hero-ctas{display:flex;flex-wrap:wrap;gap:.65rem;margin-bottom:2.5rem}
    .k-hero-trust{display:flex;align-items:center;gap:.5rem;font-size:.75rem;color:var(--dim);letter-spacing:-0.005em}
    .k-hero-trust-dot{width:6px;height:6px;border-radius:50%;background:var(--mint);box-shadow:0 0 6px var(--mint);flex-shrink:0}
    .k-hero-vis{position:relative}
    .k-terminal{background:rgba(6,7,13,.95);border:1px solid rgba(60,234,187,.2);border-radius:var(--rl);overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.04) inset,0 32px 80px rgba(0,0,0,.8),0 0 80px rgba(60,234,187,.08)}
    .k-term-bar{display:flex;align-items:center;gap:.5rem;padding:.65rem 1rem;background:rgba(0,0,0,.5);border-bottom:1px solid rgba(255,255,255,.05);font-size:.625rem;color:var(--dim);font-family:var(--mono);letter-spacing:.04em}
    .k-term-dots{display:flex;gap:5px;margin-right:.5rem}
    .k-term-dots span{width:9px;height:9px;border-radius:50%}
    .k-term-dots span:nth-child(1){background:#ff5f57}
    .k-term-dots span:nth-child(2){background:#febc2e}
    .k-term-dots span:nth-child(3){background:#28c840}
    .k-term-body{padding:1.25rem 1.25rem 1.5rem;font-family:var(--mono);font-size:.78rem;line-height:1.65;color:#6b7280;min-height:220px;white-space:pre-wrap}
    .k-term-mint{color:var(--mint)}
    .k-term-red{color:var(--red)}
    .k-term-amber{color:var(--amber)}
    .k-term-cursor{display:inline-block;width:8px;height:1em;background:var(--mint);animation:kBlink .8s step-end infinite;vertical-align:text-bottom}
    @keyframes kBlink{0%,100%{opacity:1}50%{opacity:0}}
    .k-metrics-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin-top:2rem}
    .k-metric-card{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:var(--r);padding:1rem;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
    .k-metric-label{font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
    .k-metric-val{font-family:var(--mono);font-size:1.4rem;font-weight:700;color:var(--text);margin-top:.3rem;font-variant-numeric:tabular-nums;line-height:1.1}
    .k-sec{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6rem 1.5rem;border-top:1px solid var(--border)}
    .k-sec-eye{margin-bottom:1rem}
    .k-sec-h2{margin-bottom:1.25rem}
    .k-sec-sub{margin:0 auto 3rem;text-align:center}
    .k-sec-eye{font-size:.625rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:.75rem}
    .k-sec-h2{font-size:clamp(1.75rem,3vw + .5rem,2.5rem);letter-spacing:-0.035em;margin-bottom:1rem}
    .k-sec-sub{font-size:1rem;color:var(--muted);line-height:1.7;max-width:40rem;letter-spacing:-0.005em}
    .k-pgrid{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;max-width:720px;margin:0 auto;text-align:left}
    @media(max-width:640px){.k-pgrid{grid-template-columns:1fr}}
    .k-pitem{display:flex;align-items:flex-start;gap:.75rem;padding:1rem 1.1rem;border-radius:var(--r)}
    .k-pitem.bad{background:rgba(255,59,48,.04);border:1px solid rgba(255,59,48,.12)}
    .k-pitem.good{background:rgba(60,234,187,.04);border:1px solid rgba(60,234,187,.12)}
    .k-picon{flex-shrink:0;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:900;margin-top:1px}
    .k-picon.bad{background:rgba(255,59,48,.15);border:1px solid rgba(255,59,48,.3);color:var(--red)}
    .k-picon.good{background:rgba(60,234,187,.15);border:1px solid rgba(60,234,187,.3);color:var(--mint)}
    .k-ptext{font-size:.875rem;color:var(--muted);line-height:1.55;letter-spacing:-.005em}
    .k-layers{display:flex;flex-direction:column;gap:.4rem;max-width:600px;margin:0 auto}
    .k-layer{text-align:left}
    .k-layer{display:grid;grid-template-columns:2rem 1fr auto;gap:.75rem;align-items:center;padding:.85rem 1rem;background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:var(--r);position:relative;overflow:hidden}
    .k-layer::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,var(--mint),var(--violet));opacity:.6}
    .k-layer-num{font-family:var(--mono);font-size:.6875rem;color:var(--dim);font-weight:600}
    .k-layer-name{font-size:.875rem;color:var(--text);font-weight:500;letter-spacing:-.01em}
    .k-layer-badge{font-size:.6rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:4px;background:var(--mint-dim);color:var(--mint);border:1px solid rgba(60,234,187,.2);font-family:var(--mono)}
    .k-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--rl);overflow:hidden;margin-top:3rem}
    @media(max-width:640px){.k-stats{grid-template-columns:repeat(2,1fr)}}
    .k-stat{padding:1.75rem 1.5rem;background:rgba(255,255,255,.02)}
    .k-stat:hover{background:rgba(255,255,255,.04)}
    .k-stat-n{font-family:var(--mono);font-size:2rem;font-weight:700;color:var(--mint);line-height:1;font-variant-numeric:tabular-nums}
    .k-stat-l{font-size:.65rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);margin-top:.35rem}
    .k-net-vis{position:relative;height:320px;border-radius:var(--rl);border:1px solid var(--border);background:rgba(255,255,255,.015);overflow:hidden;margin-top:2rem}
    .k-net-vis canvas{position:absolute;inset:0;width:100%;height:100%}
    .k-net-label{position:absolute;bottom:1rem;left:1rem;right:1rem;display:flex;gap:.5rem;flex-wrap:wrap}
    .k-net-chip{font-size:.6rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:4px;font-family:var(--mono)}
    .k-net-chip.safe{background:rgba(60,234,187,.1);color:var(--mint);border:1px solid rgba(60,234,187,.2)}
    .k-net-chip.fraud{background:rgba(255,59,48,.1);color:var(--red);border:1px solid rgba(255,59,48,.2)}
    .k-net-chip.review{background:rgba(255,149,0,.1);color:var(--amber);border:1px solid rgba(255,149,0,.2)}
    .k-dash-preview{border-radius:var(--rl);border:1px solid rgba(60,234,187,.15);background:rgba(10,11,18,.98);overflow:hidden;margin-top:2rem;box-shadow:0 32px 80px rgba(0,0,0,.8),0 0 60px rgba(60,234,187,.06)}
    .k-dash-header{display:flex;align-items:center;gap:.5rem;padding:.6rem 1rem;background:rgba(0,0,0,.4);border-bottom:1px solid rgba(255,255,255,.05)}
    .k-dash-title{font-size:.6875rem;font-weight:700;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;font-family:var(--mono)}
    .k-dash-dot{width:6px;height:6px;border-radius:50%;background:var(--mint);box-shadow:0 0 6px var(--mint)}
    .k-dash-content{padding:1.25rem;display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem}
    .k-kpi{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:var(--r);padding:.85rem}
    .k-kpi-l{font-size:.6rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
    .k-kpi-v{font-family:var(--mono);font-size:1.5rem;font-weight:800;margin-top:.25rem;line-height:1;font-variant-numeric:tabular-nums}
    .k-kpi-v.red{color:var(--red);text-shadow:0 0 20px rgba(255,59,48,.3)}
    .k-kpi-v.green{color:var(--mint);text-shadow:0 0 20px rgba(60,234,187,.3)}
    .k-kpi-v.gold{color:#ffd60a}
    .k-prices{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.75rem;margin-top:2rem}
    .k-price{background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:var(--rl);padding:1.5rem;display:flex;flex-direction:column;gap:.4rem;position:relative;overflow:hidden}
    .k-price:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);box-shadow:0 16px 48px rgba(0,0,0,.5)}
    .k-price.hot{border-color:rgba(60,234,187,.4);background:rgba(60,234,187,.04);box-shadow:0 0 0 1px rgba(60,234,187,.08),0 20px 56px rgba(60,234,187,.08)}
    .k-pname{font-weight:700;font-size:.9375rem;letter-spacing:-.02em}
    .k-ptag{font-size:.8125rem;color:var(--muted);min-height:2.4em;line-height:1.5;letter-spacing:-.005em}
    .k-pamt{font-family:var(--mono);font-size:1.5rem;font-weight:700;color:var(--mint);font-variant-numeric:tabular-nums}
    .k-pmeta{font-size:.73rem;color:var(--dim)}
    .k-price .k-cta{margin-top:auto;padding-top:.75rem}
    .k-glow-ring{position:absolute;inset:-1px;border-radius:inherit;background:conic-gradient(from 0deg,var(--mint),var(--violet),var(--mint));opacity:.12;z-index:-1;animation:kSpin 4s linear infinite}
    @keyframes kSpin{to{rotate:360deg}}
    .k-urgency{display:flex;align-items:center;gap:.85rem;padding:.8rem 1.25rem;background:rgba(60,234,187,.05);border:1px solid rgba(60,234,187,.18);border-radius:var(--r);margin-bottom:2rem;flex-wrap:wrap}
    .k-urg-dot{width:7px;height:7px;border-radius:50%;background:var(--mint);box-shadow:0 0 8px var(--mint);animation:kPulse 2s ease-in-out infinite;flex-shrink:0}
    .k-urg-text{font-size:.8125rem;font-weight:600;color:var(--mint);letter-spacing:-.01em}
    .k-urg-sub{font-size:.75rem;color:var(--muted);letter-spacing:-.005em}
    .k-verify{background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:var(--rl);padding:1.5rem;margin-top:1.75rem}
    .k-verify h3{font-size:1rem;margin-bottom:.85rem;font-weight:600;letter-spacing:-.02em}
    .k-verify textarea{width:100%;min-height:110px;background:rgba(0,0,0,.5);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:var(--font);font-size:.9375rem;padding:.85rem 1rem;resize:vertical;margin-bottom:.85rem;letter-spacing:-.005em}
    .k-verify textarea:focus{outline:none;border-color:rgba(60,234,187,.35);box-shadow:0 0 0 3px rgba(60,234,187,.08)}
    .k-result{margin-top:.75rem;padding:.9rem 1rem;border-radius:var(--r);display:none;font-size:.875rem;line-height:1.55}
    .k-result.on{display:block}
    .k-result.bl{background:rgba(255,59,48,.08);border:1px solid rgba(255,59,48,.25)}
    .k-result.rv{background:rgba(255,149,0,.08);border:1px solid rgba(255,149,0,.25)}
    .k-result.al{background:rgba(60,234,187,.06);border:1px solid rgba(60,234,187,.2)}
    .k-code{background:rgba(0,0,0,.7);border:1px solid var(--border);border-radius:var(--r);padding:1.25rem;position:relative;overflow-x:auto}
    .k-code pre{margin:0;font-family:var(--mono);font-size:.78rem;line-height:1.65;color:var(--muted)}
    .k-code .k-copy{position:absolute;top:.75rem;right:.75rem}
    .k-trust-list{list-style:none;margin:0;padding:0;max-width:42rem}
    .k-trust-list li{color:var(--muted);font-size:.9375rem;padding:.65rem 0 .65rem 1.5rem;position:relative;border-bottom:1px solid rgba(255,255,255,.04);line-height:1.55;letter-spacing:-.005em}
    .k-trust-list li:last-child{border-bottom:none}
    .k-trust-list li::before{content:'—';position:absolute;left:0;color:var(--mint);font-weight:700}
    .k-cred{padding:.75rem 0;border-bottom:1px solid var(--border)}
    .k-cred-list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .65rem}
    .k-cred-list li{font-size:.6875rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--dim);padding:.3rem .7rem;border-radius:999px;border:1px solid var(--border);background:rgba(255,255,255,.02)}
    .k-final-cta{text-align:center;padding:6rem 0;border-top:1px solid var(--border)}
    .k-final-cta h2{font-size:clamp(2.5rem,5vw,4.5rem);max-width:18ch;margin:0 auto 1rem;letter-spacing:-.04em}
    .k-final-sub{color:var(--muted);font-size:1.0625rem;max-width:36rem;margin:0 auto 2rem;line-height:1.7;letter-spacing:-.005em}
    .k-final-btns{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}
    .k-final-note{margin-top:1.25rem;font-size:.8125rem;color:var(--dim);letter-spacing:-.005em}
    .k-foot{padding:3rem 0;border-top:1px solid var(--border);color:var(--dim);font-size:.8125rem;letter-spacing:-.005em}
    .k-foot-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
    @media(max-width:520px){.k-foot-grid{grid-template-columns:1fr}}
    .k-sticky{position:fixed;bottom:0;left:0;right:0;z-index:90;background:rgba(0,0,0,.92);border-top:1px solid var(--border);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);padding:.85rem 1.5rem;display:flex;align-items:center;justify-content:center;gap:1rem;opacity:0;pointer-events:none;transition:opacity .4s var(--ease)}
    .k-sticky.show{opacity:1;pointer-events:auto}
    .k-sticky-label{font-size:.8125rem;color:var(--muted)}
    @media(max-width:520px){.k-sticky-label{display:none}}
    .k-pill{display:inline-flex;align-items:center;padding:.2rem .6rem;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid var(--border);font-size:.6625rem;color:var(--muted);font-family:var(--mono)}
    .k-reveal{opacity:1;transition:opacity .7s var(--ease),transform .7s var(--ease)}
    .k-js .k-reveal{opacity:0;transform:translateY(24px)}
    .k-js .k-reveal.k-in{opacity:1;transform:translateY(0)}
    .k-js .k-reveal.d1{transition-delay:.08s}
    .k-js .k-reveal.d2{transition-delay:.16s}
    .k-js .k-reveal.d3{transition-delay:.24s}
    .k-js .k-reveal.d4{transition-delay:.32s}
    .vh{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
    @media(max-width:720px){.k-metrics-strip{grid-template-columns:1fr}.k-hero{min-height:auto;padding:4rem 0 3rem}}
    @media(max-width:480px){.kn-links{display:none}}
  </style>
</head>
<body>
  <canvas id="k-net-bg" style="position:fixed;top:0;left:0;z-index:0;pointer-events:none;opacity:.45"></canvas>

  <div id="kl">
  <nav class="kn">
    <div class="kn-i">
      <a href="/" class="kn-brand">
        <svg class="kn-logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="kLg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#3ceabb"/>
              <stop offset="100%" stop-color="#7c6ff7"/>
            </linearGradient>
          </defs>
          <path d="M16 1L31 16L16 31L1 16Z" stroke="url(#kLg)" stroke-width="1.5" fill="rgba(60,234,187,0.07)"/>
          <path d="M16 5L27 16L16 27L5 16Z" stroke="rgba(60,234,187,0.25)" stroke-width="1" fill="none"/>
          <line x1="12" y1="10" x2="12" y2="22" stroke="#3ceabb" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="16" x2="22" y2="10" stroke="#3ceabb" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="16" x2="22" y2="22" stroke="#3ceabb" stroke-width="2" stroke-linecap="round"/>
          <circle cx="16" cy="1" r="1.5" fill="#3ceabb"/>
          <circle cx="31" cy="16" r="1.5" fill="#7c6ff7" opacity="0.7"/>
          <circle cx="16" cy="31" r="1.5" fill="#3ceabb" opacity="0.4"/>
          <circle cx="1" cy="16" r="1.5" fill="#7c6ff7" opacity="0.7"/>
        </svg>
        <span class="kn-name">Kairos Check</span>
      </a>
      <div class="kn-links">
        <a href="#problem">Problema</a>
        <a href="#product">Produto</a>
        <a href="#pricing">Preços</a>
        <a href="#api">API</a>
        <a href="/dashboard">Dashboard</a>
      </div>
      <div class="kn-right">
        <label class="vh" for="lang-sel">Language</label>
        <select id="lang-sel" class="kn-sel" aria-label="Language">
          <option value="en">EN</option>
          <option value="pt">PT</option>
          <option value="es">ES</option>
          <option value="de">DE</option>
          <option value="fr">FR</option>
        </select>
        <select id="curr-sel" class="kn-sel" aria-label="Currency">
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
          <option value="BRL">BRL</option>
        </select>
        <span class="kn-badge">v7.2</span>
        <a href="#verify" class="kb kb-mint" data-i18n="navCta">Verify now</a>
      </div>
    </div>
  </nav>

  <div class="ks k-cred" role="region" aria-label="Compliance signals">
    <ul class="k-cred-list">
      <li data-i18n="trustChip1">GDPR Art.15/17</li>
      <li data-i18n="trustChip2">OSINT-only</li>
      <li data-i18n="trustChip3">Pseudonymized</li>
      <li data-i18n="trustChip4">SHA-256 audit</li>
      <li>Zero external deps</li>
      <li>AES-256-GCM vault</li>
    </ul>
  </div>

  <main>

  <section class="ks k-hero" id="top">
    <div class="k-hero-grid">
      <div>
        <div class="k-hero-eyebrow" data-i18n="heroKicker">Infrastructure, not a gimmick</div>
        <h1 class="k-h1">
          <span id="k-scramble" data-final="Stop fraud">Stop fraud</span>
          <span class="k-h1-line2" data-i18n="heroH1b">before checkout.</span>
        </h1>
        <p class="k-hero-lead" data-i18n="heroLead">A deterministic eight-layer engine, cross-tenant reputation graph, and GDPR-first OSINT architecture — exposed as a single REST API your risk team can trust.</p>
        <div class="k-hero-ctas">
          <a href="#verify" class="kb kb-mint kb-lg" data-i18n="heroCtaPrimary">Run instant check</a>
          <a href="#api" class="kb kb-ghost kb-lg" data-i18n="heroCtaSecondary">View API contract</a>
        </div>
        <div class="k-hero-trust">
          <div class="k-hero-trust-dot"></div>
          <span data-i18n="heroMicro">No account required. We never store raw PII.</span>
        </div>
        <div class="k-metrics-strip" id="live-metrics">
          <div class="k-metric-card">
            <div class="k-metric-label" data-i18n="metricsBlocked">Blocked</div>
            <div class="k-metric-val" id="m-blocked">—</div>
          </div>
          <div class="k-metric-card">
            <div class="k-metric-label" data-i18n="metricsReviews">Review</div>
            <div class="k-metric-val" id="m-review">—</div>
          </div>
          <div class="k-metric-card">
            <div class="k-metric-label" data-i18n="metricsVolume">Volume</div>
            <div class="k-metric-val" id="m-vol">—</div>
          </div>
        </div>
      </div>
      <div class="k-hero-vis">
        <div class="k-terminal">
          <div class="k-term-bar">
            <div class="k-term-dots" aria-hidden="true"><span></span><span></span><span></span></div>
            <span data-i18n="heroPanelLabel">kairos — verify · production</span>
          </div>
          <div class="k-term-body" id="k-typewriter" aria-label="Live API demo" aria-live="polite"><span class="k-term-mint">POST</span> /verify HTTP/1.1
<span class="k-term-mint">200 OK</span> · <span class="k-term-amber">43ms</span>

{
  "verdict": {
    "decision": "<span class="k-term-red">BLOCK</span>",
    "score": <span class="k-term-mint">0.91</span>,
    "layers": [
      "nlp.matrix",
      "rep.forensics",
      "graph.crossTenant"
    ]
  },
  "dna": "<span class="k-term-amber">phishing.guru.v3</span>",
  "audit_ref": "a3f9···c12"
}<span class="k-term-cursor"></span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- TERMINAL — Tesla full-height standalone -->
  <section style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 1.5rem;border-top:1px solid var(--border);position:relative;z-index:1;text-align:center">
    <p style="font-size:.625rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:1.5rem">Live API · Production</p>
    <div style="width:100%;max-width:680px">
      <div class="k-terminal">
        <div class="k-term-bar">
          <div class="k-term-dots" aria-hidden="true"><span></span><span></span><span></span></div>
          <span>kairos — verify · production</span>
        </div>
        <div class="k-term-body" style="min-height:220px"><span class="k-term-mint">POST</span> /verify HTTP/1.1
<span class="k-term-mint">200 OK</span> · <span class="k-term-amber">43ms</span>

{
  "verdict": {
    "decision": "<span class="k-term-red">BLOCK</span>",
    "score": <span class="k-term-mint">0.91</span>,
    "layers": ["nlp.matrix","rep.forensics","graph.crossTenant"]
  },
  "dna": "<span class="k-term-amber">phishing.guru.v3</span>",
  "audit_ref": "a3f9···c12"
}<span class="k-term-cursor"></span></div>
      </div>
    </div>
    <p style="margin-top:1.5rem;font-size:.8125rem;color:var(--dim);letter-spacing:-.005em">Authenticate with <code style="font-family:var(--mono);color:var(--mint)">x-api-key</code> · Same payload from server, extension or batch job</p>
  </section>

  <section class="ks k-sec" id="problem">
    <div class="k-reveal">
      <p class="k-sec-eye">00 · O Problema</p>
      <h2 class="k-sec-h2">Cada segundo sem detecção<br>é uma transação perdida.</h2>
      <p class="k-sec-sub">A fraude não anuncia a chegada. Actua antes de qualquer dashboard reagir — a menos que o motor já esteja na camada de entrada.</p>
    </div>
    <div class="k-pgrid">
      <div class="k-pitem bad k-reveal d1"><div class="k-picon bad">✕</div><div class="k-ptext">Webhooks que chegam depois do dinheiro já ter saído</div></div>
      <div class="k-pitem bad k-reveal d2"><div class="k-picon bad">✕</div><div class="k-ptext">Listas negras estáticas que não aprendem com tráfego novo</div></div>
      <div class="k-pitem bad k-reveal d3"><div class="k-picon bad">✕</div><div class="k-ptext">Falsos positivos que bloqueiam clientes legítimos</div></div>
      <div class="k-pitem bad k-reveal d4"><div class="k-picon bad">✕</div><div class="k-ptext">PII em texto claro — violação silenciosa do RGPD</div></div>
      <div class="k-pitem good k-reveal d1"><div class="k-picon good">✓</div><div class="k-ptext">Motor determinístico de 8 camadas antes do checkout</div></div>
      <div class="k-pitem good k-reveal d2"><div class="k-picon good">✓</div><div class="k-ptext">Grafo cross-tenant com decaimento temporal</div></div>
      <div class="k-pitem good k-reveal d3"><div class="k-picon good">✓</div><div class="k-ptext">Score 0–100 com DNA fingerprint reproduzível</div></div>
      <div class="k-pitem good k-reveal d4"><div class="k-picon good">✓</div><div class="k-ptext">OSINT-only + pseudonimização por arquitectura</div></div>
    </div>
  </section>

  <section class="ks k-sec" id="product">
    <div class="k-reveal">
      <p class="k-sec-eye" data-i18n="secProduct">01 · Product</p>
      <h2 class="k-sec-h2" data-i18n="bentoTitle">Eight layers. One verdict.</h2>
      <p class="k-sec-sub" data-i18n="bentoLead">Everything below is live in production — not a roadmap slide.</p>
    </div>
    <div class="k-layers k-reveal">
      <div class="k-layer"><span class="k-layer-num">01</span><span class="k-layer-name" data-i18n="layerCore">Core &amp; language risk</span><span class="k-layer-badge">ACTIVE</span></div>
      <div class="k-layer"><span class="k-layer-num">02</span><span class="k-layer-name" data-i18n="layerGuru">Guru &amp; pyramid patterns</span><span class="k-layer-badge">ACTIVE</span></div>
      <div class="k-layer"><span class="k-layer-num">03</span><span class="k-layer-name" data-i18n="layerRep">Reputation forensics</span><span class="k-layer-badge">ACTIVE</span></div>
      <div class="k-layer"><span class="k-layer-num">04</span><span class="k-layer-name" data-i18n="layerNlp">Scam-matrix NLP</span><span class="k-layer-badge">ACTIVE</span></div>
      <div class="k-layer"><span class="k-layer-num">05</span><span class="k-layer-name" data-i18n="layerLive">Complaint-evasion signals</span><span class="k-layer-badge">ACTIVE</span></div>
      <div class="k-layer"><span class="k-layer-num">06</span><span class="k-layer-name" data-i18n="layerCheckout">Links &amp; checkout DNA</span><span class="k-layer-badge">ACTIVE</span></div>
      <div class="k-layer"><span class="k-layer-num">07</span><span class="k-layer-name" data-i18n="layerNgram">Novel playbook similarity</span><span class="k-layer-badge">ACTIVE</span></div>
      <div class="k-layer"><span class="k-layer-num">08</span><span class="k-layer-name" data-i18n="layerGraph">Cross-tenant reputation graph</span><span class="k-layer-badge" style="background:rgba(124,111,247,.15);color:#7c6ff7;border-color:rgba(124,111,247,.3)">THE MOAT</span></div>
    </div>
    <div class="k-stats k-reveal">
      <div class="k-stat"><div class="k-stat-n">8</div><div class="k-stat-l">Analysis layers</div></div>
      <div class="k-stat"><div class="k-stat-n">135+</div><div class="k-stat-l">Tests in production</div></div>
      <div class="k-stat"><div class="k-stat-n">0</div><div class="k-stat-l">External deps</div></div>
      <div class="k-stat"><div class="k-stat-n">256-bit</div><div class="k-stat-l">AES-GCM vault</div></div>
    </div>
  </section>

  <section class="ks k-sec" id="network">
    <div class="k-reveal">
      <p class="k-sec-eye">Intelligence Layer</p>
      <h2 class="k-sec-h2" data-i18n="networkTitle">Network effect moat.</h2>
      <p class="k-sec-sub" data-i18n="networkBody">Every verification updates a time-decayed graph. Bad actors compound their score — good traffic does not pollute the prior.</p>
    </div>
    <div class="k-net-vis k-reveal">
      <canvas id="k-moat-canvas"></canvas>
      <div class="k-net-label">
        <span class="k-net-chip safe">● Safe entity</span>
        <span class="k-net-chip fraud">● Fraud signal</span>
        <span class="k-net-chip review">● Under review</span>
      </div>
    </div>
  </section>

  <section class="ks k-sec" id="dashboard-prev">
    <div class="k-reveal">
      <p class="k-sec-eye">CEO Intelligence</p>
      <h2 class="k-sec-h2">Real-time command center.</h2>
      <p class="k-sec-sub">Every metric live from the engine. No estimates, no marketing numbers — operational telemetry.</p>
    </div>
    <div class="k-dash-preview k-reveal">
      <div class="k-dash-header">
        <div class="k-dash-dot"></div>
        <span class="k-dash-title">KAIROS CEO Command Center · Live</span>
      </div>
      <div class="k-dash-content">
        <div class="k-kpi"><div class="k-kpi-l">Fraud Blocked</div><div class="k-kpi-v red" id="dp-blocked">—</div></div>
        <div class="k-kpi"><div class="k-kpi-l">In Review</div><div class="k-kpi-v gold" id="dp-review">—</div></div>
        <div class="k-kpi"><div class="k-kpi-l">Allowed</div><div class="k-kpi-v green" id="dp-allowed">—</div></div>
      </div>
      <div style="padding:0 1.25rem 1.25rem">
        <a href="/dashboard" class="kb kb-ghost" style="width:100%;justify-content:center">Open full dashboard →</a>
      </div>
    </div>
  </section>

  <section class="ks k-sec" id="pricing">
    <div class="k-reveal">
      <p class="k-sec-eye" data-i18n="secPricing">02 · Pricing</p>
      <h2 class="k-sec-h2" data-i18n="pricingTitle">Plans that scale with risk volume</h2>
      <p class="k-sec-sub" data-i18n="pricingLead">Prices anchor in EUR; shown currencies are indicative FX. Stripe bills in your configured region.</p>
    </div>
    <div class="k-urgency k-reveal">
      <div class="k-urg-dot"></div>
      <span class="k-urg-text">Beta access active</span>
      <span style="color:var(--border)">·</span>
      <span class="k-urg-sub">First 100 tenants get 2× rate limit on Free tier</span>
    </div>
    <div class="k-prices k-reveal" id="pricing-mount"></div>
  </section>

  <section class="ks k-sec" id="api">
    <div class="k-reveal">
      <p class="k-sec-eye" data-i18n="secApi">03 · Integration</p>
      <h2 class="k-sec-h2" data-i18n="apiTitle">Integrate in one POST</h2>
      <p class="k-sec-sub" data-i18n="apiLead">Authenticate with x-api-key. Same payload from server, extension, or batch job.</p>
    </div>
    <div class="k-code k-reveal">
      <button type="button" class="kb kb-ghost k-copy" id="copy-curl" data-i18n="apiCopy" style="font-size:.7rem;padding:.3rem .7rem">Copy</button>
      <pre id="curl-pre"></pre>
    </div>
    <div class="k-verify" id="verify">
      <h3 data-i18n="verifyTitle">Live verifier</h3>
      <textarea id="t-text" rows="4" placeholder="Paste suspicious message…"></textarea>
      <button type="button" class="kb kb-mint" id="t-run" data-i18n="verifyRun">Analyze</button>
      <div id="t-result" class="k-result"></div>
    </div>
  </section>

  <section class="ks k-sec" id="trust">
    <div class="k-reveal">
      <p class="k-sec-eye" data-i18n="secTrust">04 · Trust</p>
      <h2 class="k-sec-h2" data-i18n="trustTitle">Trust &amp; compliance</h2>
    </div>
    <ul class="k-trust-list k-reveal">
      <li data-i18n="trust1">OSINT-only: public or user-pasted content only</li>
      <li data-i18n="trust2">Salted pseudonymization before any disk write</li>
      <li data-i18n="trust3">Tamper-evident audit chain (SHA-256 linked)</li>
      <li data-i18n="trust4">GDPR Art.15 / Art.17 endpoints live</li>
    </ul>
  </section>

  <section class="ks k-final-cta k-reveal">
    <h2>Stop fraud before<br><span style="color:var(--mint)">your next checkout.</span></h2>
    <p class="k-final-sub">Deploy in one POST. No account required for the public demo. Zero external dependencies — your security team can audit every line.</p>
    <div class="k-final-btns">
      <a href="#verify" class="kb kb-mint kb-lg">Run instant check →</a>
      <a href="/api/billing/plans" class="kb kb-ghost kb-lg">View plans</a>
    </div>
    <p class="k-final-note">No account required · GDPR-compliant by design · 135+ tests green</p>
  </section>

  <footer class="ks k-foot">
    <div class="k-foot-grid">
      <div>
        <strong style="color:#e8eaed" data-i18n="footerProduct">Product</strong><br/>
        <a href="#pricing" data-i18n="navPricing">Pricing</a> ·
        <a href="/api/billing/plans">Plans API</a> ·
        <a href="/health">Status</a>
      </div>
      <div>
        <strong style="color:#e8eaed" data-i18n="footerLegal">Legal</strong><br/>
        <a href="/gdpr/export" data-i18n="footerRights">Data rights</a> ·
        <a href="/gdpr/erase">Erase</a> ·
        <a href="/docs/legal/privacy-policy.md" data-i18n="footerPrivacy">Privacy</a>
      </div>
    </div>
    <div style="margin-top:1.5rem;color:var(--dim);font-size:.73rem">
      © 2026 Kairos Check
      <span id="geo-pill" style="display:none;margin-left:.5rem" class="k-pill"></span>
    </div>
  </footer>

  </main>
  </div>

  <div class="k-sticky" id="k-sticky">
    <span class="k-sticky-label">Real-time fraud detection — no account needed</span>
    <a href="#verify" class="kb kb-mint" data-i18n="navCta">Verify now</a>
  </div>

  <script>
  (function(){
    'use strict';
    var I18N=${i18nJson};
    var PLANS=${plansJson};
    var SSR=${ssrJson};
    var FX={EUR:1,USD:1.09,GBP:0.86,BRL:5.55};
    var lang=localStorage.getItem('kairos_lang')||'en';
    var cur=localStorage.getItem('kairos_cur')||'EUR';

    function t(k){var L=I18N[lang]||I18N.en;return(L&&L[k])||(I18N.en&&I18N.en[k])||k}
    function applyI18n(){
      document.documentElement.lang=lang==='pt'?'pt':lang==='es'?'es':lang==='de'?'de':lang==='fr'?'fr':'en';
      document.querySelectorAll('[data-i18n]').forEach(function(el){
        var k=el.getAttribute('data-i18n');var v=t(k);
        if(el.hasAttribute('data-i18n-attr'))el.setAttribute(el.getAttribute('data-i18n-attr'),v);
        else if(el.tagName==='TITLE')document.title=v;
        else if(el.tagName==='TEXTAREA')el.placeholder=v;
        else el.textContent=v;
      });
    }
    function fmtMoney(eur,currency){
      if(eur===null||eur===undefined)return t('customPrice');
      var n=Number(eur)*(FX[currency]||1);
      try{return new Intl.NumberFormat(lang==='pt'?'pt-PT':lang,{style:'currency',currency:currency}).format(n);}
      catch(e){return '€'+Number(eur).toFixed(2);}
    }
    function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
    function setMetrics(d){
      var loc=lang==='pt'?'pt-PT':lang==='de'?'de-DE':lang==='fr'?'fr-FR':'en-US';
      function set(id,val){var el=document.getElementById(id);if(el)el.textContent=Number(val||0).toLocaleString(loc);}
      set('m-blocked',d.blocked);set('m-review',d.review);set('m-vol',d.verifyRequests);
      set('dp-blocked',d.blocked);set('dp-review',d.review);set('dp-allowed',d.allowed);
    }
    function renderPricing(){
      var root=document.getElementById('pricing-mount');if(!root)return;
      root.innerHTML='';
      ['kairos_free','kairos_pro','kairos_business','kairos_b2b_pilot','kairos_enterprise'].forEach(function(pid){
        var p=PLANS.filter(function(x){return x.id===pid;})[0];if(!p)return;
        var card=document.createElement('div');
        card.className='k-price'+(p.id==='kairos_pro'?' hot':'');
        var tag=t(p.labelKey||'planFree');
        var price=p.priceEurMonthly==null?t('customPrice'):fmtMoney(p.priceEurMonthly,cur);
        var suffix=p.priceEurMonthly==null?'':' <span style="font-size:.8rem;color:var(--muted)">'+t('perMonth')+'</span>';
        card.innerHTML=(p.id==='kairos_pro'?'<div class="k-glow-ring"></div>':'')+
          '<div class="k-pname">'+escHtml(p.name)+'</div>'+
          '<div class="k-ptag">'+escHtml(tag)+'</div>'+
          '<div class="k-pamt">'+price+suffix+'</div>'+
          '<div class="k-pmeta">'+p.rateLimitPerMinute+' '+t('reqMin')+'</div>'+
          '<div class="k-cta">'+(p.priceEurMonthly===0?'<a class="kb kb-ghost" href="mailto:support@kairos.local?subject=Free" style="width:100%;justify-content:center">'+t('ctaStart')+'</a>':p.priceEurMonthly==null?'<a class="kb kb-mint" href="mailto:sales@kairos.local?subject=Enterprise" style="width:100%;justify-content:center">'+t('ctaTalk')+'</a>':'<a class="kb kb-mint" href="/api/billing/plans" target="_blank" rel="noopener" style="width:100%;justify-content:center">'+t('ctaStart')+'</a>')+'</div>';
        root.appendChild(card);
      });
    }

    (function(){
      var canvas=document.getElementById('k-net-bg');if(!canvas)return;
      var ctx=canvas.getContext('2d');
      function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
      resize();window.addEventListener('resize',resize,{passive:true});
      var nodes=[];
      for(var i=0;i<55;i++){nodes.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.5+.5,type:Math.random()<.07?'fraud':Math.random()<.12?'review':'safe',pulse:Math.random()*Math.PI*2});}
      function frame(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        nodes.forEach(function(n){n.x+=n.vx;n.y+=n.vy;n.pulse+=.018;if(n.x<0||n.x>canvas.width)n.vx*=-1;if(n.y<0||n.y>canvas.height)n.vy*=-1;});
        for(var i=0;i<nodes.length;i++)for(var j=i+1;j<nodes.length;j++){var dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<140){var a=(1-d/140)*.12,isFraud=nodes[i].type==='fraud'||nodes[j].type==='fraud';ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.strokeStyle=isFraud?'rgba(255,59,48,'+a+')':'rgba(60,234,187,'+a+')';ctx.lineWidth=.6;ctx.stroke();}}
        nodes.forEach(function(n){var p=Math.sin(n.pulse)*.25+.75,c=n.type==='fraud'?'#ff3b30':n.type==='review'?'#ff9500':'#3ceabb';if(n.type==='fraud'){ctx.beginPath();ctx.arc(n.x,n.y,n.r*5*p,0,Math.PI*2);ctx.fillStyle='rgba(255,59,48,.04)';ctx.fill();}ctx.beginPath();ctx.arc(n.x,n.y,n.r*p,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();});
        requestAnimationFrame(frame);
      }
      frame();
    })();

    (function(){
      var canvas=document.getElementById('k-moat-canvas');if(!canvas)return;
      var ctx=canvas.getContext('2d');var parent=canvas.parentElement;
      function resize(){canvas.width=parent.offsetWidth;canvas.height=parent.offsetHeight;}resize();
      var nodes=[];
      for(var i=0;i<40;i++){nodes.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*3+1.5,type:Math.random()<.1?'fraud':Math.random()<.15?'review':'safe',pulse:Math.random()*Math.PI*2});}
      function frame(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        nodes.forEach(function(n){n.x+=n.vx;n.y+=n.vy;n.pulse+=.025;if(n.x<0||n.x>canvas.width)n.vx*=-1;if(n.y<0||n.y>canvas.height)n.vy*=-1;});
        for(var i=0;i<nodes.length;i++)for(var j=i+1;j<nodes.length;j++){var dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<90){var a=(1-d/90)*.25,isFraud=nodes[i].type==='fraud'||nodes[j].type==='fraud';ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.strokeStyle=isFraud?'rgba(255,59,48,'+a+')':'rgba(60,234,187,'+a+')';ctx.lineWidth=1;ctx.stroke();}}
        nodes.forEach(function(n){var p=Math.sin(n.pulse)*.3+.7,c=n.type==='fraud'?'#ff3b30':n.type==='review'?'#ff9500':'#3ceabb';if(n.type==='fraud'){ctx.beginPath();ctx.arc(n.x,n.y,n.r*6*p,0,Math.PI*2);ctx.fillStyle='rgba(255,59,48,.06)';ctx.fill();}ctx.beginPath();ctx.arc(n.x,n.y,n.r*p,0,Math.PI*2);ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=n.type!=='safe'?8:4;ctx.fill();ctx.shadowBlur=0;});
        requestAnimationFrame(frame);
      }
      frame();
    })();

    (function(){
      var el=document.getElementById('k-scramble');if(!el)return;
      var final=el.getAttribute('data-final')||el.textContent;
      var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#';
      var frame=0,total=28;
      var id=setInterval(function(){
        el.textContent=final.split('').map(function(c,i){if(c===' ')return ' ';return frame/total>i/final.length?c:chars[Math.floor(Math.random()*chars.length)];}).join('');
        if(++frame>total){el.textContent=final;clearInterval(id);}
      },40);
    })();

    (function(){
      var el=document.getElementById('k-typewriter');if(!el)return;
      var lines=[
        '<span class="k-term-mint">POST</span> /verify HTTP/1.1',
        '<span class="k-term-mint">200 OK</span> · <span class="k-term-amber">43ms</span>',
        '',
        '{',
        '  "verdict": {',
        '    "decision": "<span class="k-term-red">BLOCK</span>",',
        '    "score": <span class="k-term-mint">0.91</span>,',
        '    "layers": [',
        '      "nlp.matrix",',
        '      "rep.forensics",',
        '      "graph.crossTenant"',
        '    ]',
        '  },',
        '  "dna": "<span class="k-term-amber">phishing.guru.v3</span>",',
        '  "audit_ref": "a3f9···c12"',
        '}<span class="k-term-cursor"></span>',
      ];
      var li=0,ci=0,html='';
      function type(){
        if(li>=lines.length){setTimeout(function(){li=0;ci=0;html='';el.innerHTML='';type();},3500);return;}
        var line=lines[li];
        if(ci<=line.length){el.innerHTML=html+line.slice(0,ci)+(ci<line.length?'<span class="k-term-cursor"></span>':'');ci++;setTimeout(type,ci===1?100:22);}
        else{html+=line+'<br>';el.innerHTML=html;li++;ci=0;setTimeout(type,180);}
      }
      setTimeout(type,800);
    })();

    function wire(){
      document.body.classList.add('k-js');
      var langSel=document.getElementById('lang-sel'),currSel=document.getElementById('curr-sel');
      if(langSel){langSel.value=lang;langSel.addEventListener('change',function(){lang=langSel.value;localStorage.setItem('kairos_lang',lang);applyI18n();renderPricing();setMetrics(window.__kDash||SSR);});}
      if(currSel){currSel.value=cur;currSel.addEventListener('change',function(){cur=currSel.value;localStorage.setItem('kairos_cur',cur);localStorage.setItem('kairos_cur_explicit','1');renderPricing();});}
      applyI18n();setMetrics(SSR);window.__kDash=SSR;renderPricing();
      fetch('/api/dashboard').then(function(r){return r.json();}).then(function(d){window.__kDash=d;setMetrics(d);}).catch(function(){});
      fetch('/api/geo').then(function(r){return r.json();}).then(function(g){
        var pill=document.getElementById('geo-pill');if(!pill||!g)return;
        pill.style.display='inline-flex';
        pill.textContent=g.country?('Region: '+g.country+' · '+(g.source||'')):(g.source||'');
        if(g.currency&&!localStorage.getItem('kairos_cur_explicit')){cur=g.currency;if(currSel)currSel.value=cur;renderPricing();}
      }).catch(function(){});
      var pre=document.getElementById('curl-pre');
      if(pre){var BS=String.fromCharCode(92),NL=String.fromCharCode(10);pre.textContent=['curl -sS '+location.origin+'/verify '+BS,'  -H "Content-Type: application/json" '+BS,'  -H "x-api-key: $KAIROS_API_KEY" '+BS,'  -d \'{"text":"Suspicious payout message…"}\''].join(NL);}
      var copyBtn=document.getElementById('copy-curl');
      if(copyBtn)copyBtn.addEventListener('click',function(){navigator.clipboard.writeText(document.getElementById('curl-pre').textContent).then(function(){copyBtn.textContent=t('apiCopied');setTimeout(function(){copyBtn.textContent=t('apiCopy');},1600);});});
      var tRun=document.getElementById('t-run'),tResult=document.getElementById('t-result'),tText=document.getElementById('t-text');
      if(tRun)tRun.addEventListener('click',async function(){
        var text=(tText.value||'').trim();if(!text)return;
        tRun.disabled=true;tRun.textContent=t('verifyAnalyzing');tResult.className='k-result';
        try{
          var res=await fetch('/api/verify-public',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text.slice(0,16000)})});
          var data=await res.json();
          if(res.status===429){tResult.className='k-result rv on';tResult.textContent=t('rateLimited');}
          else{var ver=data.verdict||{};var dec=String(ver.decision||data.decision||'allow').toLowerCase();var score=ver.score!=null?ver.score:(data.score!=null?data.score:0);var cls=dec==='block'?'bl':dec==='review'?'rv':'al';tResult.className='k-result on '+cls;var label=dec==='block'?t('verdictBlock'):dec==='review'?t('verdictReview'):t('verdictAllow');tResult.innerHTML='<strong>'+escHtml(label)+'</strong> · score '+escHtml(String(score))+(dec!=='allow'?'<div style="margin-top:8px">'+t('verdictRec')+'</div>':'');}
        }catch(e){tResult.className='k-result rv on';tResult.textContent='Connection error.';}
        tRun.disabled=false;tRun.textContent=t('verifyRun');
      });
      // Tesla nav — hide on scroll down, show on scroll up
      (function(){
        var nav=document.querySelector('.kn');if(!nav)return;
        var last=0;
        window.addEventListener('scroll',function(){
          var y=window.scrollY;
          if(y>last&&y>100)nav.classList.add('kn-hidden');
          else nav.classList.remove('kn-hidden');
          last=y;
        },{passive:true});
      })();

      var revs=document.querySelectorAll('.k-reveal');
      if(revs.length&&'IntersectionObserver' in window){
        var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('k-in');io.unobserve(e.target);}});},{threshold:.08,rootMargin:'0px 0px -20px 0px'});
        revs.forEach(function(el){io.observe(el);});
      }
      var sticky=document.getElementById('k-sticky');
      if(sticky){window.addEventListener('scroll',function(){sticky.classList.toggle('show',window.scrollY>500);},{passive:true});}
      function ensureLock(){var css='#kl *:not(.k-fx):not(.k-fx *){transform:none!important;font-stretch:normal!important;font-variation-settings:normal!important}';var el=document.getElementById('kl-lock');if(!el){el=document.createElement('style');el.id='kl-lock';}el.textContent=css;document.documentElement.appendChild(el);}
      ensureLock();[50,200,600].forEach(function(ms){setTimeout(ensureLock,ms);});
      window.addEventListener('load',ensureLock);
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);
    else wire();
  })();
  </script>
</body>
</html>`;
}

module.exports = { renderLandingPage };
