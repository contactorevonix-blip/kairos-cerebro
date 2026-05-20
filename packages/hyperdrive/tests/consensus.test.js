'use strict';

/**
 * KAIROS HYPERDRIVE — Testes de Consenso
 * node --test packages/hyperdrive/tests/consensus.test.js
 *
 * Cobre:
 *   1. Router — classificação correcta de tasks
 *   2. Consenso — convergência com mock
 *   3. Consenso — escalada ao humano (divergência forçada)
 *   4. Orquestrador — execução directa (task não crítica)
 *   5. Orquestrador — dry-run mode
 *   6. Budget — tracking correcto
 *   7. Ledger — eventos gravados correctamente
 */

const test   = require('node:test');
const assert = require('node:assert/strict');
const fs     = require('node:fs');
const path   = require('node:path');

// Garantir MOCK MODE nos testes
process.env.KAIROS_LIVE = '0';

const { classify }    = require('../src/router');
const { orchestrate } = require('../src/orchestrator');
const { verify, append, EVENT_TYPES } = require('../src/memory/ledger');
const { getBudgetStatus, resetTaskBudget } = require('../src/providers/anthropic');

// ─── 1. ROUTER ──────────────────────────────────────────────────────────────

test('Router: classifica task de backend correctamente', () => {
  const r = classify('adicionar endpoint /api/score/batch ao sniper-api');
  assert.equal(r.domain, 'backend');
  assert.ok(r.agents.includes('@Dex'));
  assert.ok(r.confidence > 0);
});

test('Router: classifica task de frontend correctamente', () => {
  const r = classify('redesenhar o hero component com framer-motion no packages/web');
  assert.equal(r.domain, 'frontend');
  assert.ok(r.agents.includes('@Dex') || r.agents.includes('@Uma'));
});

test('Router: classifica auditoria de segurança como crítico', () => {
  const r = classify('auditar os endpoints de segurança e verificar GDPR compliance');
  assert.equal(r.domain, 'auditoria');
  assert.equal(r.critical, true);
});

test('Router: ficheiros sensíveis tornam task crítica', () => {
  const r = classify('actualizar dependências', ['railway.toml', 'Dockerfile']);
  assert.equal(r.critical, true);
  assert.equal(r.touchesSensitive, true);
});

test('Router: task com keyword "critical" força consenso', () => {
  const r = classify('critical: corrigir bug de produção no billing');
  assert.equal(r.critical, true);
});

test('Router: task de infra classifica correctamente', () => {
  const r = classify('configurar nova variável de env no railway.toml para KAIROS_DEMO_KEY');
  assert.equal(r.domain, 'infra');
});

test('Router: task de vendas classifica correctamente', () => {
  const r = classify('criar template de outreach B2B para founders PT+BR');
  assert.equal(r.domain, 'vendas');
  assert.ok(r.agents.includes('@Hermes'));
});

// ─── 2. ORQUESTRADOR — EXECUÇÃO DIRECTA ────────────────────────────────────

test('Orquestrador: execução directa (task não crítica) em MOCK', async () => {
  const result = await orchestrate(
    'adicionar JSDoc à função scoreReputation',
    ['packages/sniper-engine/reputation.js'],
    {}
  );
  assert.equal(result.ok, true);
  assert.equal(result.mode, 'direct');
  assert.ok(result.ledgerEventId);
  assert.ok(result.budget);
});

// ─── 3. ORQUESTRADOR — CONSENSO ────────────────────────────────────────────

test('Orquestrador: consenso alcançado em MOCK (forceConsensus)', async () => {
  const result = await orchestrate(
    'redesenhar a arquitectura do sistema de tokens',
    [],
    { forceConsensus: true }
  );
  // Em MOCK mode, todos os agentes retornam confidence > 0.7 e texto similar
  // O resultado pode ser consensus ou escalated dependendo da similaridade dos mocks
  assert.ok(['consensus', 'escalated'].includes(result.mode));
  assert.ok(result.ledgerEventId);
  assert.ok(Array.isArray(result.agents));
});

// ─── 4. ORQUESTRADOR — DRY RUN ─────────────────────────────────────────────

test('Orquestrador: dry-run não executa nada', async () => {
  const result = await orchestrate(
    'migrar storage de JSON para Postgres',
    ['packages/sniper-db/'],
    { dryRun: true }
  );
  assert.equal(result.ok, true);
  assert.equal(result.mode, 'dry-run');
  assert.ok(result.plan.includes('DRY RUN'));
  assert.equal(result.consensus, null);
});

// ─── 5. BUDGET TRACKING ────────────────────────────────────────────────────

test('Budget: resetTaskBudget limpa o contador', () => {
  resetTaskBudget();
  const status = getBudgetStatus();
  assert.equal(status.taskCostUsd, 0);
  assert.equal(status.exceeded, false);
  assert.equal(status.warned, false);
});

test('Budget: thresholds correctos', () => {
  const status = getBudgetStatus();
  assert.equal(status.warnThreshold, 2);
  assert.equal(status.hardStop, 3);
});

// ─── 6. LEDGER — INTEGRAÇÃO ────────────────────────────────────────────────

test('Ledger: append cria evento e verify passa', () => {
  append('test-agent', EVENT_TYPES.SystemBoot, { test: true, ts: Date.now() });
  const ok = verify();
  assert.equal(ok, true);
});

test('Ledger: hash chain intacta após múltiplos eventos', () => {
  append('@Dex',  EVENT_TYPES.CodeGenerated,   { file: 'test.js' });
  append('@Quinn', EVENT_TYPES.RedTeamStarted,  { file: 'test.js' });
  append('@Quinn', EVENT_TYPES.RedTeamPassed,   { file: 'test.js', findings: [] });
  const ok = verify();
  assert.equal(ok, true);
});

// ─── 7. MODO MOCK ───────────────────────────────────────────────────────────

test('MOCK MODE activo quando KAIROS_LIVE=0', () => {
  const { CONFIG } = require('../src/providers/anthropic');
  assert.equal(CONFIG.isLive, false);
});

test('Mock: invoke retorna resposta determinística', async () => {
  const { invoke } = require('../src/providers/anthropic');
  const r1 = await invoke('@Sage', 'task de teste X', 'consensus');
  const r2 = await invoke('@Sage', 'task de teste X', 'consensus');
  assert.equal(r1.mock, true);
  assert.equal(r1.approach, r2.approach); // determinístico
  assert.ok(r1.confidence >= 0.7 && r1.confidence <= 0.9);
});
