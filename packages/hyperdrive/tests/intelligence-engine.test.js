'use strict';

const { test } = require('node:test');
const assert   = require('node:assert');
const { IntelligenceEngine } = require('../src/core/intelligence-engine');

/** Helper: cria um ledger mock com runs no formato real do state-ledger. */
function mockLedger(runs) {
  const events = [];
  for (const r of runs) {
    const runId = r.runId;
    const baseTs = r.timestamp || new Date().toISOString();
    events.push({
      timestamp: baseTs,
      actor: 'orchestrator',
      type: 'TaskCreated',
      payload: { runId, task: r.description, files: [], mode: 'LIVE' },
    });
    events.push({
      timestamp: baseTs,
      actor: 'orchestrator',
      type: 'TaskStarted',
      payload: {
        runId,
        domain: r.domain,
        agents: r.agents || ['@Dex'],
        confidence: r.confidence ?? 0.8,
      },
    });
    if (r.success !== false) {
      events.push({
        timestamp: baseTs,
        actor: 'orchestrator',
        type: 'TaskCompleted',
        payload: {
          runId,
          agent: (r.agents || ['@Dex'])[0],
          costUsd: r.cost_usd ?? 0.5,
          quality_score: r.quality ?? 8,
          confidence_real: 1,
        },
      });
      events.push({
        timestamp: baseTs,
        actor: (r.agents || ['@Dex'])[0],
        type: 'PostMortemCreated',
        payload: {
          task_id: runId,
          domain: r.domain,
          outcome: 'success',
          duration_ms: r.duration_ms ?? 180_000,
          success: true,
        },
      });
    } else {
      events.push({
        timestamp: baseTs,
        actor: 'orchestrator',
        type: 'TaskFailed',
        payload: { runId },
      });
    }
  }
  return { events, length: events.length, filter: (p) => events.filter(p) };
}

test('detectPatterns: sem precedente devolve no_precedent', () => {
  const eng = new IntelligenceEngine(mockLedger([]));
  const result = eng.detectPatterns({
    description: 'implementar feature X totalmente nova',
    domain: 'frontend',
  });
  assert.strictEqual(result.similar_count, 0);
  assert.strictEqual(result.shortcut_available, false);
  const hasNoPrecedent = result.suggestions.some(s => s.type === 'no_precedent');
  assert.strictEqual(hasNoPrecedent, true);
});

test('detectPatterns: detecta padrão com tasks similares e sugere atalho', () => {
  const runs = Array.from({ length: 5 }, (_, i) => ({
    runId: `run_${i}`,
    description: 'Implementar lógica real no escalation-engine.js engine backend',
    domain: 'backend',
    agents: ['@Dex', '@Aria'],
    quality: 8,
    cost_usd: 0.45,
    duration_ms: 180_000,
  }));
  const eng = new IntelligenceEngine(mockLedger(runs));
  const result = eng.detectPatterns({
    description: 'Implementar lógica real no postmortem-engine.js engine backend',
    domain: 'backend',
  });
  assert.ok(result.similar_count >= 3, `esperava >=3, obteve ${result.similar_count}`);
  assert.strictEqual(result.shortcut_available, true);
  assert.strictEqual(result.recommended_agents[0].agent, '@Dex');
  assert.ok(result.expected_duration_ms > 0);
  assert.ok(result.expected_cost_usd > 0);
  const hasRoute = result.suggestions.some(s => s.type === 'route_to_agent');
  assert.strictEqual(hasRoute, true);
});

test('detectPatterns: não sugere atalho com qualidade baixa', () => {
  const runs = Array.from({ length: 4 }, (_, i) => ({
    runId: `run_${i}`,
    description: 'implementar engine backend lógica real similar',
    domain: 'backend',
    agents: ['@Dex'],
    quality: 4, // qualidade baixa
    cost_usd: 0.3,
  }));
  const eng = new IntelligenceEngine(mockLedger(runs));
  const result = eng.detectPatterns({
    description: 'implementar engine backend lógica real',
    domain: 'backend',
  });
  assert.ok(result.similar_count >= 3);
  assert.strictEqual(result.shortcut_available, false);
});

test('detectPatterns: ignora tasks fora da janela de 7 dias', () => {
  const oldTs = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const runs = Array.from({ length: 5 }, (_, i) => ({
    runId: `old_${i}`,
    description: 'implementar lógica real engine backend',
    domain: 'backend',
    timestamp: oldTs,
    quality: 9,
  }));
  const eng = new IntelligenceEngine(mockLedger(runs));
  const result = eng.detectPatterns({
    description: 'implementar lógica real engine backend',
    domain: 'backend',
  });
  assert.strictEqual(result.similar_count, 0);
});

test('detectPatterns: success rate calculado correctamente com falhas', () => {
  const runs = [
    ...Array.from({ length: 3 }, (_, i) => ({
      runId: `ok_${i}`,
      description: 'implementar engine backend lógica',
      domain: 'backend',
      quality: 8,
    })),
    {
      runId: 'fail_1',
      description: 'implementar engine backend lógica',
      domain: 'backend',
      success: false,
    },
  ];
  const eng = new IntelligenceEngine(mockLedger(runs));
  const result = eng.detectPatterns({
    description: 'implementar engine backend lógica',
    domain: 'backend',
  });
  assert.ok(result.similar_count >= 3);
  assert.ok(result.success_rate < 1.0);
  assert.ok(result.success_rate >= 0.7);
});

test('shouldUseConsensus: palavra "crítico" força consenso', () => {
  const eng = new IntelligenceEngine(mockLedger([]));
  assert.strictEqual(
    eng.shouldUseConsensus({ description: 'fix bug crítico em pagamentos' }, 0.95),
    true,
  );
});

test('shouldUseConsensus: confidence baixa força consenso', () => {
  const eng = new IntelligenceEngine(mockLedger([]));
  assert.strictEqual(eng.shouldUseConsensus({ description: 'task normal' }, 0.40), true);
});

test('shouldUseConsensus: confidence alta sem palavras críticas dispensa consenso', () => {
  const runs = Array.from({ length: 5 }, (_, i) => ({
    runId: `r_${i}`,
    description: 'task simples padrão',
    domain: 'frontend',
    quality: 9,
  }));
  const eng = new IntelligenceEngine(mockLedger(runs));
  assert.strictEqual(
    eng.shouldUseConsensus({ description: 'task simples padrão', domain: 'frontend' }, 0.90),
    false,
  );
});

test('shouldUseConsensus: domínio sensível sem precedente exige consenso', () => {
  const eng = new IntelligenceEngine(mockLedger([]));
  assert.strictEqual(
    eng.shouldUseConsensus({ description: 'add new feature', domain: 'security' }, 0.85),
    true,
  );
});

test('detectPatterns: aceita ledger como array directo', () => {
  const ledgerObj = mockLedger([
    { runId: 'r1', description: 'engine backend', domain: 'backend', quality: 8 },
  ]);
  const eng = new IntelligenceEngine(ledgerObj.events); // passar array directo
  const result = eng.detectPatterns({ description: 'engine backend', domain: 'backend' });
  assert.ok(result.similar_count >= 0);
  assert.ok(Array.isArray(result.suggestions));
});
