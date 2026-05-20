'use strict';

/**
 * KAIROS HYPERDRIVE — Testes Fase 7
 * Selecção automática de modelo + prompt caching + budget.
 */

const test   = require('node:test');
const assert = require('node:assert/strict');

process.env.KAIROS_LIVE = '0'; // sempre mock nos testes

const { analyze, explain, MODELS } = require('../src/providers/complexity');
const { buildCachedSystem, estimateSavings } = require('../src/providers/cache-warmer');
const { getBudgetStatus, resetTaskBudget }   = require('../src/providers/anthropic');

// ─── COMPLEXIDADE ────────────────────────────────────────────────────────────

test('Complexity: auditoria → score alto → Opus', () => {
  const r = analyze('auditar segurança GDPR dos endpoints de billing', [], 'auditoria');
  assert.ok(r.score >= 8, `Score devia ser ≥8, foi ${r.score}`);
  assert.equal(r.tier, 'senior');
  assert.equal(r.modelLabel, 'Opus');
});

test('Complexity: task de docs → score baixo → Haiku', () => {
  const r = analyze('adicionar comentário JSDoc à função getVersion', [], 'docs');
  assert.ok(r.score <= 3, `Score devia ser ≤3, foi ${r.score}`);
  assert.equal(r.tier, 'utility');
  assert.equal(r.modelLabel, 'Haiku');
});

test('Complexity: backend endpoint → score médio → Sonnet', () => {
  const r = analyze('adicionar endpoint /api/stats ao servidor', [], 'backend');
  assert.ok(r.score >= 4 && r.score <= 7, `Score devia ser 4-7, foi ${r.score}`);
  assert.equal(r.tier, 'executor');
  assert.equal(r.modelLabel, 'Sonnet');
});

test('Complexity: keyword "critical" força score alto', () => {
  const r = analyze('critical: corrigir bug no billing', [], 'backend');
  assert.ok(r.score >= 7, `Score devia ser ≥7 com "critical", foi ${r.score}`);
});

test('Complexity: ficheiros sensíveis aumentam score', () => {
  const rSem  = analyze('actualizar função', [], 'backend');
  const rCom  = analyze('actualizar função', ['packages/billing/stripe.js'], 'backend');
  assert.ok(rCom.score > rSem.score, 'Ficheiros sensíveis deviam aumentar o score');
});

test('Complexity: keyword "stripe" aumenta score', () => {
  const r = analyze('corrigir webhook Stripe para billing', [], 'backend');
  assert.ok(r.score >= 6, `Score devia ser ≥6 com stripe, foi ${r.score}`);
});

test('Complexity: keyword "simple" reduz score', () => {
  const rNormal = analyze('actualizar a função de validação', [], 'navegacao');
  const rSimple = analyze('simple: actualizar a função de validação', [], 'navegacao');
  assert.ok(rSimple.score <= rNormal.score, 'Keyword "simple" devia reduzir ou manter score');
});

test('Complexity: forceOpus → score 10 → Opus', () => {
  const r = analyze('task simples', [], 'docs', { forceOpus: true });
  assert.equal(r.score, 10);
  assert.equal(r.tier, 'senior');
});

test('Complexity: forceHaiku → score 2 → Haiku', () => {
  const r = analyze('auditoria crítica', [], 'auditoria', { forceHaiku: true });
  assert.equal(r.score, 2);
  assert.equal(r.tier, 'utility');
});

test('Complexity: explain() retorna string legível', () => {
  const r = analyze('redesenhar arquitectura do scoring engine', [], 'backend');
  const e = explain(r);
  assert.ok(typeof e === 'string');
  assert.ok(e.includes('Score:'));
  assert.ok(e.includes('Factores:'));
});

test('Complexity: score está sempre entre 0-10', () => {
  const tasks = [
    ['', [], 'navegacao'],
    ['a'.repeat(500), ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'], 'auditoria'],
    ['critical security billing stripe vault gdpr', [], 'auditoria'],
    ['simple rename typo comment doc', [], 'docs'],
  ];
  for (const [task, files, domain] of tasks) {
    const r = analyze(task, files, domain);
    assert.ok(r.score >= 0 && r.score <= 10, `Score ${r.score} fora de range para task "${task.slice(0,30)}"`);
  }
});

// ─── MODELOS ─────────────────────────────────────────────────────────────────

test('Models: Haiku é o mais barato', () => {
  assert.ok(MODELS.utility.priceIn < MODELS.executor.priceIn);
  assert.ok(MODELS.executor.priceIn < MODELS.senior.priceIn);
});

test('Models: Opus é o mais caro', () => {
  assert.ok(MODELS.senior.priceOut > MODELS.executor.priceOut);
  assert.ok(MODELS.executor.priceOut > MODELS.utility.priceOut);
});

// ─── PROMPT CACHING ─────────────────────────────────────────────────────────

test('Cache: buildCachedSystem retorna array de blocos', () => {
  const blocks = buildCachedSystem('@Dex', 'contexto de teste');
  assert.ok(Array.isArray(blocks));
  assert.ok(blocks.length >= 2);
});

test('Cache: blocos 1 e 2 têm cache_control', () => {
  const blocks = buildCachedSystem('@Aria', '');
  // Block 1: constitution
  assert.equal(blocks[0].cache_control?.type, 'ephemeral');
  // Block 2: skill
  assert.equal(blocks[1].cache_control?.type, 'ephemeral');
});

test('Cache: bloco de contexto dinâmico não tem cache_control', () => {
  const blocks = buildCachedSystem('@Quinn', 'contexto dinâmico aqui');
  const dynamicBlock = blocks[blocks.length - 1];
  // O último bloco (contexto) não deve ter cache_control
  if (blocks.length > 2) {
    assert.equal(dynamicBlock.cache_control, undefined);
  }
});

test('Cache: estimateSavings calcula correctamente', () => {
  const s = estimateSavings(20, 4000);
  assert.ok(s.costWithCache < s.costWithoutCache, 'Com cache deve ser mais barato');
  assert.ok(s.savingsPct > 0 && s.savingsPct <= 100);
  assert.ok(s.savedUsd > 0);
});

test('Cache: diferentes agentes têm system prompts diferentes', () => {
  const blocksDex  = buildCachedSystem('@Dex', '');
  const blocksArmy = buildCachedSystem('@Aria', '');
  // Block 2 (skill) deve ser diferente entre agentes
  assert.notEqual(blocksDex[1].text, blocksArmy[1].text);
});

// ─── BUDGET ──────────────────────────────────────────────────────────────────

test('Budget: reset funciona correctamente', () => {
  resetTaskBudget();
  const s = getBudgetStatus();
  assert.equal(s.taskCostUsd, 0);
  assert.equal(s.exceeded, false);
  assert.equal(s.warned, false);
});

test('Budget: thresholds correctos (warn=$2, stop=$3)', () => {
  const s = getBudgetStatus();
  assert.equal(s.warnThreshold, 2);
  assert.equal(s.hardStop, 3);
});
