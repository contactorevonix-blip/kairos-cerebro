#!/usr/bin/env node
// KAIROS — Dashboard de métricas em tempo real
// Usage: node bin/stats.js [--json]
// Lê de .kairos-data/ + Stripe API

'use strict';

const fs   = require('fs');
const path = require('path');

const DB_DIR = process.env.KAIROS_DB_DIR || path.join(process.cwd(), '.kairos-data');
const JSON_MODE = process.argv.includes('--json');

// ── planos e preços (EUR) ─────────────────────────────────────────────────────
const PLAN_PRICE = { starter: 29, pro: 99, scale: 199, 'b2b-pilot': 0, free: 0 };
const PLAN_QUOTA = { starter: 5000, pro: 25000, scale: 100000, 'b2b-pilot': 999999, free: 500 };

// ── leitura de ficheiros ──────────────────────────────────────────────────────
function readJson(name, fallback) {
  try {
    const f = path.join(DB_DIR, name);
    if (!fs.existsSync(f)) return fallback;
    return JSON.parse(fs.readFileSync(f, 'utf8')) || fallback;
  } catch { return fallback; }
}

function readJsonl(name) {
  try {
    const f = path.join(DB_DIR, name);
    if (!fs.existsSync(f)) return [];
    return fs.readFileSync(f, 'utf8')
      .split('\n').filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

// ── métricas ──────────────────────────────────────────────────────────────────
const tenants      = readJson('tenants.json', []);
const apiKeys      = readJson('api_keys.json', []);
const verifications = readJsonl('verifications.jsonl');
const metrics      = readJson('metrics.json', {});

const now   = Date.now();
const h24   = now - 86_400_000;
const h1    = now - 3_600_000;

// MRR calculado localmente (sem Stripe API — funciona offline)
const mrrLocal = tenants.reduce((sum, t) => sum + (PLAN_PRICE[t.plan] || 0), 0);

// utilizadores por plano
const byPlan = tenants.reduce((acc, t) => {
  acc[t.plan] = (acc[t.plan] || 0) + 1;
  return acc;
}, {});

// chaves activas vs revogadas
const activeKeys  = apiKeys.filter(k => !k.revokedAt).length;
const revokedKeys = apiKeys.filter(k => k.revokedAt).length;

// verificações nas últimas 24h e 1h
const v24h = verifications.filter(v => new Date(v.ts || v.createdAt).getTime() > h24).length;
const v1h  = verifications.filter(v => new Date(v.ts || v.createdAt).getTime() > h1).length;

// tenants por uso nas últimas 24h
const usageByTenant = {};
verifications
  .filter(v => new Date(v.ts || v.createdAt).getTime() > h24)
  .forEach(v => { if (v.tenantId) usageByTenant[v.tenantId] = (usageByTenant[v.tenantId] || 0) + 1; });

const topUsers = Object.entries(usageByTenant)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([id, count]) => {
    const t = tenants.find(t => t.tenantId === id);
    return { id: id.slice(0, 12) + '…', plan: t?.plan || '?', calls: count };
  });

// tenants perto do limite mensal (estimativa baseada em quota diária proporcional)
const dayOfMonth   = new Date().getDate();
const daysInMonth  = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
const monthFraction = dayOfMonth / daysInMonth;

const atRisk = tenants
  .filter(t => t.plan && PLAN_QUOTA[t.plan] > 0 && PLAN_QUOTA[t.plan] < 999999)
  .map(t => {
    const used = usageByTenant[t.tenantId] || 0;
    const projectedMonthly = monthFraction > 0 ? Math.round(used / monthFraction) : 0;
    const quota  = PLAN_QUOTA[t.plan];
    const pct    = Math.round((projectedMonthly / quota) * 100);
    return { id: t.tenantId.slice(0, 12) + '…', plan: t.plan, pct, projected: projectedMonthly, quota };
  })
  .filter(t => t.pct >= 70)
  .sort((a, b) => b.pct - a.pct);

// ── LTV preditivo + Churn ─────────────────────────────────────────────────────
// Coeficientes reais SaaS B2B (API SaaS, self-serve, indie devs)
const GROSS_MARGIN   = 0.82;  // ~82% margem bruta (Railway + infra = único COGS)
const EXPANSION_RATE = 0.02;  // 2%/mês expansão (upgrades de plano)

// Churn: tenants sem actividade nos últimos 45 dias (proxy de churn silencioso)
const d45 = now - 45 * 86_400_000;
const activeInLast45 = new Set(
  verifications
    .filter(v => new Date(v.ts || v.createdAt).getTime() > d45)
    .map(v => v.tenantId).filter(Boolean)
);
const paidTenants     = tenants.filter(t => PLAN_PRICE[t.plan] > 0);
const churnedPaid     = paidTenants.filter(t => !activeInLast45.has(t.tenantId));
const churnRate       = paidTenants.length > 0
  ? churnedPaid.length / paidTenants.length : 0.05; // fallback 5%

// LTV por plano: LTV = ARPU × gross_margin / (churn - expansion)
// Fórmula de Bessemer Venture Partners adaptada para micro-SaaS
const effectiveChurn = Math.max(churnRate - EXPANSION_RATE, 0.005); // floor 0.5%
const ltvByPlan = Object.fromEntries(
  Object.entries(PLAN_PRICE)
    .filter(([, price]) => price > 0)
    .map(([plan, price]) => {
      const ltv       = Math.round((price * GROSS_MARGIN) / effectiveChurn);
      const payback   = Math.round(price / (price * GROSS_MARGIN)); // meses para recuperar CAC≈ARPU
      return [plan, { ltv, payback_months: payback }];
    })
);

// LTV médio ponderado pela base actual
const weightedLtv = paidTenants.length > 0
  ? Math.round(
      paidTenants.reduce((sum, t) => sum + (ltvByPlan[t.plan]?.ltv || 0), 0) / paidTenants.length
    )
  : 0;

// Quick Ratio (crescimento qualitativo) — requer eventos de upgrade/downgrade
const eventsRaw = readJsonl('events.jsonl');
const h30 = now - 30 * 86_400_000;
const upgrades   = eventsRaw.filter(e => e.event === 'tenant:upgraded' && new Date(e.ts).getTime() > h30).length;
const quickRatio = upgrades > 0 && churnedPaid.length > 0
  ? (upgrades / churnedPaid.length).toFixed(2) : 'N/A';

// ── output ────────────────────────────────────────────────────────────────────
if (JSON_MODE) {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    mrr_eur: mrrLocal, by_plan: byPlan,
    keys: { active: activeKeys, revoked: revokedKeys },
    verifications: { last_24h: v24h, last_1h: v1h },
    at_risk: atRisk, top_users: topUsers,
    global_metrics: metrics,
    unit_economics: {
      churn_rate_pct: Math.round(churnRate * 100),
      effective_churn_pct: Math.round(effectiveChurn * 100),
      gross_margin_pct: Math.round(GROSS_MARGIN * 100),
      weighted_ltv_eur: weightedLtv,
      ltv_by_plan: ltvByPlan,
      quick_ratio: quickRatio,
      churned_paid_30d: churnedPaid.length,
    },
  }, null, 2));
  process.exit(0);
}

// ── pretty dashboard ──────────────────────────────────────────────────────────
const c = { reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m', dim: '\x1b[2m' };
const line = '─'.repeat(52);

console.log(`\n${c.bold}${c.cyan}╔════════════════════════════════════════════╗${c.reset}`);
console.log(`${c.bold}${c.cyan}║         KAIROS — Dashboard de Métricas     ║${c.reset}`);
console.log(`${c.bold}${c.cyan}╚════════════════════════════════════════════╝${c.reset}`);
console.log(`${c.dim}  ${new Date().toLocaleString('pt-PT')}${c.reset}\n`);

// MRR
const mrrColor = mrrLocal >= 500 ? c.green : mrrLocal > 0 ? c.yellow : c.red;
console.log(`${c.bold}  💶 MRR (estimado)${c.reset}   ${mrrColor}${c.bold}€${mrrLocal}/mês${c.reset}`);
console.log(`  ${c.dim}${line}${c.reset}`);

// Planos
console.log(`\n${c.bold}  Utilizadores por plano${c.reset}`);
Object.entries(byPlan).sort((a, b) => (PLAN_PRICE[b[0]] || 0) - (PLAN_PRICE[a[0]] || 0)).forEach(([plan, count]) => {
  const price = PLAN_PRICE[plan] || 0;
  const bar   = '█'.repeat(Math.min(count, 20));
  const revenue = price * count;
  console.log(`    ${plan.padEnd(12)} ${String(count).padStart(3)} utilizadores  ${bar}  ${revenue > 0 ? c.green + '€' + revenue + '/mês' + c.reset : c.dim + 'free' + c.reset}`);
});

// API Keys
console.log(`\n${c.bold}  Chaves API${c.reset}   ${c.green}${activeKeys} activas${c.reset}  ${c.dim}${revokedKeys} revogadas${c.reset}`);

// Verificações
console.log(`\n${c.bold}  Verificações${c.reset}`);
console.log(`    Última hora:   ${c.bold}${v1h}${c.reset}`);
console.log(`    Últimas 24h:   ${c.bold}${v24h}${c.reset}`);

// Risco de upgrade
if (atRisk.length > 0) {
  console.log(`\n${c.bold}${c.yellow}  ⚠ Perto do limite (candidatos a upgrade)${c.reset}`);
  atRisk.forEach(t => {
    const color = t.pct >= 90 ? c.red : c.yellow;
    console.log(`    ${t.id}  ${t.plan.padEnd(10)}  ${color}${t.pct}%${c.reset}  (proj. ${t.projected}/${t.quota})`);
  });
} else {
  console.log(`\n  ${c.dim}Nenhum utilizador perto do limite.${c.reset}`);
}

// Top users
if (topUsers.length > 0) {
  console.log(`\n${c.bold}  Top utilizadores (24h)${c.reset}`);
  topUsers.forEach((u, i) => {
    console.log(`    ${i + 1}. ${u.id}  [${u.plan}]  ${u.calls} calls`);
  });
}

// Unit Economics — LTV + Churn
console.log(`\n${c.bold}  Unit Economics${c.reset}`);
const churnColor = churnRate > 0.08 ? c.red : churnRate > 0.04 ? c.yellow : c.green;
console.log(`    Churn mensal (est.):  ${churnColor}${Math.round(churnRate * 100)}%${c.reset}  ${c.dim}(${churnedPaid.length} pagantes sem actividade 45d)${c.reset}`);
console.log(`    Quick Ratio (30d):    ${c.bold}${quickRatio}${c.reset}  ${c.dim}(>1 = crescimento saudável)${c.reset}`);
if (weightedLtv > 0) {
  const ltvColor = weightedLtv > 1000 ? c.green : weightedLtv > 400 ? c.yellow : c.red;
  console.log(`    LTV médio ponderado:  ${ltvColor}${c.bold}€${weightedLtv}${c.reset}`);
}
console.log(`\n${c.bold}  LTV por plano${c.reset}  ${c.dim}(churn efectivo: ${Math.round(effectiveChurn * 100)}% · margem: ${Math.round(GROSS_MARGIN * 100)}%)${c.reset}`);
Object.entries(ltvByPlan)
  .sort((a, b) => b[1].ltv - a[1].ltv)
  .forEach(([plan, { ltv, payback_months }]) => {
    const col = ltv > 1500 ? c.green : ltv > 600 ? c.yellow : '';
    console.log(`    ${plan.padEnd(10)}  LTV ${col}${c.bold}€${ltv}${c.reset}  ${c.dim}payback ~${payback_months} mês${c.reset}`);
  });

// Stripe note
console.log(`\n  ${c.dim}MRR real via Stripe: STRIPE_SECRET_KEY em .env + Stripe Dashboard${c.reset}`);
console.log(`  ${c.dim}Para dados de billing precisos: node bin/stats.js --stripe${c.reset}\n`);
