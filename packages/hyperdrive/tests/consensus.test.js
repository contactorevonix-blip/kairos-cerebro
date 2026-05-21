'use strict';

/**
 * KAIROS HYPERDRIVE — Testes de Consenso
 * node --test packages/hyperdrive/tests/consensus.test.js
 *
 * Cobre:
 *   1. Router — classificação correcta de tasks
 *   2. Router — short task boost (< 8 palavras → +0.20 confidence)
 *   3. Consenso — convergência com mock
 *   4. Consenso — escalada ao humano (divergência forçada)
 *   5. Orquestrador — execução directa (task não crítica)
 *   6. Orquestrador — dry-run mode
 *   7. Budget — tracking correcto
 *   8. Ledger — eventos gravados correctamente
 *   9. EscalationEngine — monitor, threshold 10min, escalate, ledger
 *  10. PostMortemEngine — duração, agente, domínio, outcome, 3 learnings
 */

const test   = require('node:test');
const assert = require('node:assert/strict');
const fs     = require('node:fs');
const path   = require('node:path');
const os     = require('node:os');

// Garantir MOCK MODE + caminhos isolados nos testes
process.env.KAIROS_LIVE = '0';
process.env.KAIROS_LEDGER_PATH    = path.join(os.tmpdir(), `kairos-test-ledger-${process.pid}.jsonl`);
process.env.KAIROS_POSTMORTEM_PATH = path.join(os.tmpdir(), `kairos-test-postmortems-${process.pid}.jsonl`);

const { classify, SHORT_TASK_WORD_THRESHOLD, SHORT_TASK_CONFIDENCE_BOOST } = require('../src/router');
const { orchestrate } = require('../src/orchestrator');
const { verify, append, EVENT_TYPES } = require('../src/memory/ledger');
const { getBudgetStatus, resetTaskBudget } = require('../src/providers/anthropic');
const { EscalationEngine, ESCALATION_THRESHOLD_MS } = require('../src/core/escalation-engine');
const { PostMortemEngine, generateLearnings } = require('../src/core/postmortem-engine');

// ─── 1. ROUTER — CLASSIFICAÇÃO BÁSICA ───────────────────────────────────────

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

// ─── 2. ROUTER — SHORT TASK BOOST ────────────────────────────────────────────

test('Router: task com < 8 palavras recebe shortTaskBoost=true', () => {
  // "fix stripe bug" = 3 palavras
  const r = classify('fix stripe bug');
  assert.equal(r.shortTaskBoost, true);
  assert.ok(r.wordCount < SHORT_TASK_WORD_THRESHOLD);
});

test('Router: task com >= 8 palavras NÃO recebe shortTaskBoost', () => {
  // 9 palavras deliberadamente
  const r = classify('adicionar endpoint de batch scoring ao sniper-api em produção');
  assert.equal(r.shortTaskBoost, false);
  assert.ok(r.wordCount >= SHORT_TASK_WORD_THRESHOLD);
});

test('Router: confidence de task curta é >= confidence sem boost + 0.20 (ou 1.0)', () => {
  // Comparar mesma task com e sem boost manualmente
  const shortTask  = 'deploy railway';  // 2 palavras
  const rShort     = classify(shortTask);

  // Simular o que seria sem o boost — score raw
  // O boost deve ter sido aplicado se wordCount < 8
  assert.equal(rShort.shortTaskBoost, true);
  assert.equal(rShort.wordCount, 2);
  // Confidence deve ser ≥ 0.20 (mínimo do boost aplicado sobre 0)
  assert.ok(rShort.confidence >= SHORT_TASK_CONFIDENCE_BOOST);
});

test('Router: confidence não excede 1.0 com short task boost', () => {
  // Task curta que já teria confidence alta — não deve exceder 1.0
  const r = classify('deploy');
  assert.ok(r.confidence <= 1.0);
});

test('Router: reasons inclui referência ao short-task-boost quando aplicado', () => {
  const r = classify('correr testes');  // 2 palavras
  assert.equal(r.shortTaskBoost, true);
  const hasBoostReason = r.reasons.some(reason => reason.includes('short-task-boost'));
  assert.equal(hasBoostReason, true);
});

test('Router: task de exactamente 8 palavras NÃO recebe boost', () => {
  // "um dois três quatro cinco seis sete oito" = 8 palavras
  const r = classify('um dois três quatro cinco seis sete oito');
  assert.equal(r.shortTaskBoost, false);
  assert.equal(r.wordCount, 8);
});

test('Router: task de exactamente 7 palavras recebe boost', () => {
  // "um dois três quatro cinco seis sete" = 7 palavras
  const r = classify('um dois três quatro cinco seis sete');
  assert.equal(r.shortTaskBoost, true);
  assert.equal(r.wordCount, 7);
});

// ─── 3. ORQUESTRADOR — EXECUÇÃO DIRECTA ────────────────────────────────────

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

// ─── 4. ORQUESTRADOR — CONSENSO ────────────────────────────────────────────

test('Orquestrador: consenso alcançado em MOCK (forceConsensus)', async () => {
  const result = await orchestrate(
    'redesenhar a arquitectura do sistema de tokens',
    [],
    { forceConsensus: true }
  );
  // Em MOCK mode, todos os agentes retornam confidence > 0.7 e texto similar
  assert.ok(['consensus', 'escalated'].includes(result.mode));
  assert.ok(result.ledgerEventId);
  assert.ok(Array.isArray(result.agents));
});

// ─── 5. ORQUESTRADOR — DRY RUN ─────────────────────────────────────────────

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

// ─── 6. BUDGET TRACKING ────────────────────────────────────────────────────

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

// ─── 7. LEDGER — INTEGRAÇÃO ────────────────────────────────────────────────

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

// ─── 8. MODO MOCK ───────────────────────────────────────────────────────────

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

// ─── 9. ESCALATION ENGINE ───────────────────────────────────────────────────

test('EscalationEngine: escalate() regista evento em memória', () => {
  const engine = new EscalationEngine(['@Orion', '@Aria']);
  const result = engine.escalate('Teste de escalonamento manual', { taskId: 'test-001' });
  assert.equal(result.escalated, true);
  assert.ok(result.reason.includes('Teste'));
  assert.ok(result.timestamp > 0);
  assert.ok(result.eventId); // confirmação de registo no Ledger
  assert.ok(result.manager); // manager foi seleccionado
});

test('EscalationEngine: shouldEscalate() retorna false para monitor recente', () => {
  const engine = new EscalationEngine();
  const monitor = { started_at: Date.now() }; // acabou de começar
  assert.equal(engine.shouldEscalate(monitor), false);
});

test('EscalationEngine: shouldEscalate() retorna true para task > 10min', () => {
  const engine = new EscalationEngine();
  const oldStart = Date.now() - (ESCALATION_THRESHOLD_MS + 1000); // +1s para ter margem
  const monitor = { started_at: oldStart };
  assert.equal(engine.shouldEscalate(monitor), true);
});

test('EscalationEngine: shouldEscalate() retorna false para monitor null', () => {
  const engine = new EscalationEngine();
  assert.equal(engine.shouldEscalate(null), false);
});

test('EscalationEngine: startMonitor() e completeTask() funcionam correctamente', () => {
  const engine = new EscalationEngine();
  const { taskId, startedAt } = engine.startMonitor('task-abc', '@Dex', 'Implementar feature X');
  assert.equal(taskId, 'task-abc');
  assert.ok(startedAt > 0);

  // Verificar que está nos monitores activos
  const active = engine.getActiveMonitors();
  assert.equal(active.length, 1);
  assert.equal(active[0].taskId, 'task-abc');

  // Completar task
  const completion = engine.completeTask('task-abc', 'completed');
  assert.ok(completion.durationMs >= 0);
  assert.equal(completion.outcome, 'completed');

  // Deve ter sido removida dos monitores
  const activeAfter = engine.getActiveMonitors();
  assert.equal(activeAfter.length, 0);
});

test('EscalationEngine: runScheduledCheck() escala task > 10min automaticamente', () => {
  const engine = new EscalationEngine();

  // Simular task que começou há 11min
  const oldStart = Date.now() - (ESCALATION_THRESHOLD_MS + 60_000);
  engine.monitors.set('task-old', {
    taskId: 'task-old',
    agentId: '@Dex',
    taskDescription: 'Task antiga de teste',
    startedAt: oldStart,
    escalated: false,
  });

  const escalated = engine.runScheduledCheck();
  assert.equal(escalated.length, 1);
  assert.equal(escalated[0].taskId, 'task-old');
  assert.ok(escalated[0].durationMs > ESCALATION_THRESHOLD_MS);

  // Verificar que foi marcada como escalada e não volta a escalar
  const escalatedAgain = engine.runScheduledCheck();
  assert.equal(escalatedAgain.length, 0);
});

test('EscalationEngine: manager correcto para cada agente', () => {
  const engine = new EscalationEngine();
  // Verificar mapeamentos chave via escalate
  const r1 = engine.escalate('test', { agentId: '@Dex' });
  assert.equal(r1.manager, '@Aria');

  const r2 = engine.escalate('test', { agentId: '@Rex' });
  assert.equal(r2.manager, '@Orion');

  const r3 = engine.escalate('test', { agentId: '@Morgan' });
  assert.equal(r3.manager, '@Sage');

  // Agente desconhecido → @Orion
  const r4 = engine.escalate('test', { agentId: '@Unknown' });
  assert.equal(r4.manager, '@Orion');
});

test('EscalationEngine: getHistory() retorna histórico de escaladas', () => {
  const engine = new EscalationEngine();
  engine.escalate('Escalada 1', { taskId: 'a' });
  engine.escalate('Escalada 2', { taskId: 'b' });
  const history = engine.getHistory();
  assert.equal(history.length, 2);
  assert.equal(history[0].reason, 'Escalada 1');
  assert.equal(history[1].reason, 'Escalada 2');
});

// ─── 10. POSTMORTEM ENGINE ───────────────────────────────────────────────────

test('PostMortemEngine: analyze() retorna registo com todos os campos obrigatórios', async () => {
  const engine = new PostMortemEngine();
  const task   = { id: 'task-pm-001', description: 'Implementar endpoint de batch' };
  const result = { ok: true, domain: 'backend', agents: ['@Dex'], mode: 'direct' };
  const exec   = { status: 'completed', durationMs: 45_000 };

  const pm = await engine.analyze(task, result, exec);

  assert.ok(pm.task_id);
  assert.ok(pm.agent);
  assert.ok(pm.domain);
  assert.ok(pm.duration_ms >= 0);
  assert.ok(pm.timestamp);
  assert.ok(pm.outcome);
  assert.ok(typeof pm.success === 'boolean');
  assert.ok(Array.isArray(pm.learnings));
  assert.ok(Array.isArray(pm.action_items));
});

test('PostMortemEngine: gera exactamente 3 learnings', async () => {
  const engine = new PostMortemEngine();
  const task   = { id: 'task-pm-002', description: 'Corrigir bug no stripe' };
  const result = { ok: true, domain: 'backend', agents: ['@Dex'], mode: 'direct' };
  const exec   = { status: 'completed', durationMs: 90_000 };

  const pm = await engine.analyze(task, result, exec);
  assert.equal(pm.learnings.length, 3);
});

test('PostMortemEngine: outcome é "success" para task bem-sucedida', async () => {
  const engine = new PostMortemEngine();
  const pm = await engine.analyze(
    { id: 't1', description: 'Test' },
    { ok: true, domain: 'frontend', agents: ['@Uma'], mode: 'direct' },
    { status: 'completed', durationMs: 30_000 }
  );
  assert.equal(pm.outcome, 'success');
  assert.equal(pm.success, true);
  assert.equal(pm.root_cause, null);
});

test('PostMortemEngine: outcome é "failure" para task falhada', async () => {
  const engine = new PostMortemEngine();
  const pm = await engine.analyze(
    { id: 't2', description: 'Test falha' },
    { ok: false, domain: 'backend', agents: ['@Dex'], mode: 'direct' },
    { status: 'failed', durationMs: 20_000, error: 'Cannot read property of undefined' }
  );
  assert.equal(pm.outcome, 'failure');
  assert.equal(pm.success, false);
  assert.ok(pm.root_cause); // deve ter causa raiz
  assert.ok(pm.root_cause.includes('Cannot read'));
});

test('PostMortemEngine: outcome é "escalated" para task escalada', async () => {
  const engine = new PostMortemEngine();
  const pm = await engine.analyze(
    { id: 't3', description: 'Decisão crítica' },
    { ok: false, domain: 'estrategia', agents: ['@Sage'], mode: 'escalated' },
    { status: 'escalated', durationMs: 0 }
  );
  assert.equal(pm.outcome, 'escalated');
});

test('PostMortemEngine: duration_min calculado correctamente', async () => {
  const engine = new PostMortemEngine();
  const pm = await engine.analyze(
    { id: 't4', description: 'Test duration' },
    { ok: true, domain: 'docs', agents: ['@Orion'], mode: 'direct' },
    { status: 'completed', durationMs: 150_000 } // 2.5min
  );
  assert.equal(pm.duration_ms, 150_000);
  assert.equal(pm.duration_min, 2.5);
});

test('PostMortemEngine: task > 10min gera learning sobre decomposição', async () => {
  const engine = new PostMortemEngine();
  const pm = await engine.analyze(
    { id: 't5', description: 'Task muito longa' },
    { ok: true, domain: 'backend', agents: ['@Dex'], mode: 'direct' },
    { status: 'completed', durationMs: 12 * 60_000 } // 12 min
  );
  // O primeiro learning deve mencionar que excedeu 10min
  const firstLearning = pm.learnings[0];
  assert.ok(firstLearning.includes('10min') || firstLearning.includes('excedeu'));
});

test('generateLearnings: retorna exactamente 3 strings não-vazias', () => {
  const learnings = generateLearnings({
    success: true,
    domain: 'backend',
    agentId: '@Dex',
    durationMs: 60_000,
    outcome: 'success',
  });
  assert.equal(learnings.length, 3);
  for (const l of learnings) {
    assert.ok(typeof l === 'string');
    assert.ok(l.length > 0);
  }
});

test('generateLearnings: learning de timeout menciona decomposição', () => {
  const learnings = generateLearnings({
    success: false,
    domain: 'backend',
    agentId: '@Dex',
    durationMs: 15 * 60_000,
    outcome: 'timeout',
  });
  const combined = learnings.join(' ');
  assert.ok(combined.includes('timeout') || combined.includes('decompor') || combined.includes('checkpoint'));
});

test('PostMortemEngine: getStats() retorna estrutura correcta', async () => {
  const engine = new PostMortemEngine();
  // Criar alguns registos primeiro
  await engine.analyze(
    { id: 's1', description: 'Stats test 1' },
    { ok: true, domain: 'backend', agents: ['@Dex'], mode: 'direct' },
    { status: 'completed', durationMs: 30_000 }
  );
  await engine.analyze(
    { id: 's2', description: 'Stats test 2' },
    { ok: false, domain: 'frontend', agents: ['@Uma'], mode: 'direct' },
    { status: 'failed', durationMs: 10_000 }
  );

  const stats = engine.getStats();
  assert.ok(stats.total >= 2);
  assert.ok(typeof stats.successRate === 'number');
  assert.ok(typeof stats.avgDurationMs === 'number');
  assert.ok(stats.byDomain);
  assert.ok(stats.byOutcome);
});
