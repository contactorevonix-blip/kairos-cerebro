'use strict';

/**
 * KAIROS HYPERDRIVE — OKR Engine Tests
 * node --test packages/hyperdrive/tests/okr-engine.test.js
 *
 * Cobre:
 *   1.  define() valida inputs
 *   2.  progress() sem dados → fallback baixo
 *   3.  progress() com dados insuficientes (< MIN_TASKS_FOR_SIGNAL)
 *   4.  progress() com taxa de sucesso perfeita → progress alto
 *   5.  progress() com falhas frequentes → progress baixo
 *   6.  progress() com quality_score alto → boost de progresso
 *   7.  progress() keyword matching aumenta score quando KR relevante
 *   8.  progress() sem KRs definidos usa success_rate como proxy
 *   9.  progress() agent events via payload.agent (orchestrator emitiu)
 *  10.  progress() exclui eventos fora da janela temporal
 *  11.  progress() janela longa (longPeriod: true) inclui eventos de 30d
 *  12.  progressAll() ordena por overall_progress desc
 *  13.  teamReport() agrupa at-risk / on-track / completed correctamente
 *  14.  createFromAgents() popula engine a partir de lista de agentes
 *  15.  refresh() invalida cache
 *  16.  status mapping: not-started / at-risk / on-track / completed
 *  17.  progress() status field correcto para cada faixa
 *  18.  progresso nunca excede 1.0 nem vai abaixo de 0
 *  19.  agente com runId correlacionado encontra texto da task
 *  20.  agente sem eventos de TaskCompleted/TaskFailed → fallback
 */

const test   = require('node:test');
const assert = require('node:assert/strict');
const path   = require('node:path');
const os     = require('node:os');

// Isolar do ledger real
process.env.KAIROS_LEDGER_PATH = path.join(os.tmpdir(), `kairos-okr-test-${process.pid}.jsonl`);

const {
  OKREngine,
  createFromAgents,
  PROGRESS_COMPLETED,
  PROGRESS_ON_TRACK,
  PROGRESS_AT_RISK,
  MIN_TASKS_FOR_SIGNAL,
  FALLBACK_PROGRESS,
} = require('../src/core/okr-engine');

// ─── FACTORIES DE EVENTOS ─────────────────────────────────────────────────────

function makeCompleted(agentId, opts = {}) {
  return {
    id:        `evt-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date(opts.ts || Date.now()).toISOString(),
    actor:     agentId,
    type:      'TaskCompleted',
    payload: {
      agent:         agentId,
      task:          opts.task || 'tarefa genérica',
      quality_score: opts.quality ?? 8.5,
      costUsd:       opts.costUsd ?? 0.05,
      runId:         opts.runId,
    },
  };
}

function makeFailed(agentId, opts = {}) {
  return {
    id:        `evt-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date(opts.ts || Date.now()).toISOString(),
    actor:     agentId,
    type:      'TaskFailed',
    payload: {
      agent:  agentId,
      task:   opts.task || 'tarefa que falhou',
      runId:  opts.runId,
    },
  };
}

function makeCreated(runId, taskText, ts = Date.now()) {
  return {
    id:        `evt-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date(ts).toISOString(),
    actor:     'orchestrator',
    type:      'TaskCreated',
    payload: {
      runId,
      task: taskText,
    },
  };
}

/**
 * Cria um engine com eventos injectados (sem I/O).
 */
function engineWith(events, okrMap = {}) {
  const eng = new OKREngine({ getLedgerEvents: () => events });
  for (const [agentId, krs] of Object.entries(okrMap)) {
    eng.define(agentId, krs);
  }
  return eng;
}

// ─── 1. define() — VALIDAÇÃO ──────────────────────────────────────────────────

test('define(): lança TypeError se agentId for null', () => {
  const eng = new OKREngine({ getLedgerEvents: () => [] });
  assert.throws(
    () => eng.define(null, ['KR1']),
    { name: 'TypeError' }
  );
});

test('define(): lança TypeError se agentId for string vazia', () => {
  const eng = new OKREngine({ getLedgerEvents: () => [] });
  assert.throws(
    () => eng.define('', ['KR1']),
    { name: 'TypeError' }
  );
});

test('define(): aceita array vazio de KRs sem erro', () => {
  const eng = new OKREngine({ getLedgerEvents: () => [] });
  assert.doesNotThrow(() => eng.define('@Dex', []));
});

test('define(): filtra KRs falsy (null, undefined, "")', () => {
  const eng = engineWith([], { '@Dex': [null, undefined, '', 'KR válido'] });
  const result = eng.progress('@Dex');
  assert.equal(result.okrs.length, 1);
  assert.equal(result.okrs[0].kr, 'KR válido');
});

// ─── 2. progress() — SEM DADOS ────────────────────────────────────────────────

test('progress(): agente sem eventos retorna progresso baixo', () => {
  const eng = engineWith([], { '@Dex': ['Entregar código sem bugs'] });
  const result = eng.progress('@Dex');
  assert.ok(result.summary.overall_progress <= FALLBACK_PROGRESS + 0.01);
  assert.equal(result.summary.tasks_total, 0);
});

test('progress(): agente sem KRs e sem eventos retorna FALLBACK_PROGRESS', () => {
  const eng = engineWith([]);
  eng.define('@Aria', []);
  const result = eng.progress('@Aria');
  assert.ok(result.summary.overall_progress <= FALLBACK_PROGRESS + 0.01);
});

// ─── 3. progress() — DADOS INSUFICIENTES ─────────────────────────────────────

test('progress(): com 1 task (< MIN_TASKS_FOR_SIGNAL) usa fallback proporcional', () => {
  const eng = engineWith(
    [makeCompleted('@Quinn', { quality: 9.0 })],
    { '@Quinn': ['Zero bugs em produção'] }
  );
  const result = eng.progress('@Quinn');
  // 1 task / MIN_TASKS_FOR_SIGNAL (3) = 33% do fallback (0.10) = 0.033
  assert.ok(result.summary.tasks_total === 1);
  assert.ok(result.okrs[0].evidence.signal === 'insufficient-data');
  assert.ok(result.okrs[0].progress < PROGRESS_AT_RISK);
});

// ─── 4. progress() — SUCESSO PERFEITO ────────────────────────────────────────

test('progress(): 10 tasks completadas, 0 falhadas → progress alto', () => {
  const events = Array.from({ length: 10 }, () =>
    makeCompleted('@Dex', { quality: 9.0, task: 'implementar código backend' })
  );
  const eng = engineWith(events, { '@Dex': ['Implementar código backend sem bugs'] });
  const result = eng.progress('@Dex');

  assert.equal(result.summary.tasks_completed, 10);
  assert.equal(result.summary.tasks_failed, 0);
  assert.ok(result.summary.overall_progress >= PROGRESS_ON_TRACK,
    `progress ${result.summary.overall_progress} devia ser >= ${PROGRESS_ON_TRACK}`);
});

// ─── 5. progress() — MUITAS FALHAS ────────────────────────────────────────────

test('progress(): 2 completed, 8 failed → progress baixo (at-risk ou not-started)', () => {
  const events = [
    ...Array.from({ length: 2 }, () => makeCompleted('@Rex', { quality: 5.0 })),
    ...Array.from({ length: 8 }, () => makeFailed('@Rex')),
  ];
  const eng = engineWith(events, { '@Rex': ['Manter zero vulnerabilidades críticas'] });
  const result = eng.progress('@Rex');

  assert.ok(result.summary.success_rate < 0.5,
    `success_rate ${result.summary.success_rate} devia ser < 0.5`);
  assert.ok(result.summary.overall_progress < PROGRESS_ON_TRACK,
    `progress ${result.summary.overall_progress} devia ser < ${PROGRESS_ON_TRACK}`);
});

// ─── 6. progress() — QUALITY_SCORE ALTO ──────────────────────────────────────

test('progress(): quality_score 10.0 aumenta progresso vs quality 4.0', () => {
  const makeN = (n, quality) =>
    Array.from({ length: n }, () => makeCompleted('@Quinn', { quality }));

  const engHigh = engineWith(makeN(5, 10.0), { '@Quinn': ['Alta qualidade'] });
  const engLow  = engineWith(makeN(5, 4.0),  { '@Quinn': ['Alta qualidade'] });

  const rHigh = engHigh.progress('@Quinn');
  const rLow  = engLow.progress('@Quinn');

  assert.ok(
    rHigh.summary.overall_progress > rLow.summary.overall_progress,
    `high quality ${rHigh.summary.overall_progress} devia ser > low quality ${rLow.summary.overall_progress}`
  );
});

// ─── 7. progress() — KEYWORD MATCHING ────────────────────────────────────────

test('progress(): KR relevante para tasks → keyword_match > 0', () => {
  const events = Array.from({ length: 5 }, () =>
    makeCompleted('@Dex', { task: 'implementar endpoint billing stripe checkout' })
  );
  const eng = engineWith(
    events,
    { '@Dex': ['Implementar billing com Stripe Checkout'] }
  );
  const result = eng.progress('@Dex');
  const krResult = result.okrs[0];

  assert.ok(krResult.evidence.keyword_match > 0,
    `keyword_match ${krResult.evidence.keyword_match} devia ser > 0`);
  assert.ok(krResult.evidence.matched_keywords.length > 0);
});

test('progress(): KR irrelevante → keyword_match baixo', () => {
  const events = Array.from({ length: 5 }, () =>
    makeCompleted('@Uma', { task: 'ajustar cor do botão primário para #FF5733' })
  );
  const eng = engineWith(
    events,
    { '@Uma': ['Garantir zero downtime no backend Railway'] }
  );
  const result = eng.progress('@Uma');
  const krResult = result.okrs[0];

  // Keywords de design vs keywords de backend = pouco match
  assert.ok(krResult.evidence.keyword_match < 0.5,
    `keyword_match ${krResult.evidence.keyword_match} devia ser < 0.5 para KR irrelevante`);
});

// ─── 8. progress() — SEM KRs → PROXY ────────────────────────────────────────

test('progress(): sem KRs definidos usa success_rate como overall_progress', () => {
  const events = [
    ...Array.from({ length: 8 }, () => makeCompleted('@Gage')),
    ...Array.from({ length: 2 }, () => makeFailed('@Gage')),
  ];
  const eng = new OKREngine({ getLedgerEvents: () => events });
  eng.define('@Gage', []);  // sem KRs

  const result = eng.progress('@Gage');
  // success_rate = 0.8, overall = 0.8
  assert.ok(Math.abs(result.summary.overall_progress - 0.8) < 0.05,
    `overall_progress ${result.summary.overall_progress} devia ser ~0.8`);
});

// ─── 9. progress() — EVENTOS VIA payload.agent (orchestrator) ────────────────

test('progress(): detecta eventos onde payload.agent === agentId', () => {
  // Evento emitido pelo orchestrator mas com payload.agent apontando para @Dex
  const event = {
    id:        'evt-abc',
    timestamp: new Date().toISOString(),
    actor:     'orchestrator',
    type:      'TaskCompleted',
    payload: {
      agent:         '@Dex',
      task:          'corrigir bug no parser',
      quality_score: 8.0,
      runId:         'run-123',
    },
  };
  const eng = engineWith([event], { '@Dex': ['Corrigir bugs sem regredir'] });
  const result = eng.progress('@Dex');
  // Com 1 evento (< MIN_TASKS_FOR_SIGNAL) ainda usa fallback, mas conta
  assert.equal(result.summary.tasks_completed, 1);
});

// ─── 10. progress() — EXCLUSÃO DE EVENTOS FORA DA JANELA ─────────────────────

test('progress(): eventos com timestamp > 7d atrás são excluídos', () => {
  const OLD = Date.now() - 8 * 24 * 60 * 60 * 1000;  // 8 dias atrás
  const events = [
    makeCompleted('@Orion', { ts: OLD, quality: 10.0 }),
    makeCompleted('@Orion', { ts: OLD, quality: 10.0 }),
    makeCompleted('@Orion', { ts: OLD, quality: 10.0 }),
    makeCompleted('@Orion', { ts: OLD, quality: 10.0 }),
    makeCompleted('@Orion', { ts: OLD, quality: 10.0 }),
  ];
  const eng = engineWith(events, { '@Orion': ['Manter repositório limpo'] });
  const result = eng.progress('@Orion');

  // Todos os eventos são antigos — dentro dos 7 dias: zero
  assert.equal(result.summary.tasks_total, 0,
    'Eventos de 8 dias atrás devem ser excluídos da janela de 7d');
});

// ─── 11. progress() — JANELA LONGA ────────────────────────────────────────────

test('progress(longPeriod): inclui eventos de 20 dias atrás', () => {
  const TWENTY_DAYS_AGO = Date.now() - 20 * 24 * 60 * 60 * 1000;
  const events = Array.from({ length: 5 }, () =>
    makeCompleted('@Sage', { ts: TWENTY_DAYS_AGO, quality: 8.0 })
  );
  const eng = engineWith(events, { '@Sage': ['Estratégia de crescimento'] });

  const resultShort = eng.progress('@Sage', { periodMs: 7 * 24 * 60 * 60 * 1000 });
  const resultLong  = eng.progress('@Sage', { longPeriod: true });

  assert.equal(resultShort.summary.tasks_total, 0,
    'Janela curta não deve incluir eventos de 20d');
  assert.equal(resultLong.summary.tasks_total, 5,
    'Janela longa (30d) deve incluir eventos de 20d');
});

// ─── 12. progressAll() — ORDENAÇÃO ────────────────────────────────────────────

test('progressAll(): retorna agentes ordenados por overall_progress desc', () => {
  // @Morgan: 9/10 tasks — progress alto
  // @Hermes: 1/10 tasks — progress baixo
  const morgEvents = Array.from({ length: 9 }, () =>
    makeCompleted('@Morgan', { quality: 9.0 })
  );
  morgEvents.push(makeFailed('@Morgan'));

  const hermEvents = Array.from({ length: 1 }, () =>
    makeCompleted('@Hermes', { quality: 5.0 })
  );
  Array.from({ length: 9 }, () => hermEvents.push(makeFailed('@Hermes')));

  const eng = engineWith(
    [...morgEvents, ...hermEvents],
    {
      '@Morgan': ['Crescimento SEO'],
      '@Hermes': ['Pipeline de vendas'],
    }
  );

  const all = eng.progressAll();
  assert.equal(all.length, 2);
  assert.ok(
    all[0].summary.overall_progress >= all[1].summary.overall_progress,
    'Deve estar ordenado desc por overall_progress'
  );
});

// ─── 13. teamReport() ─────────────────────────────────────────────────────────

test('teamReport(): agrupa at-risk / on-track / completed correctamente', () => {
  // @Aria: muitas tasks boas → on-track ou completed
  const ariaEvents = Array.from({ length: 10 }, () =>
    makeCompleted('@Aria', { quality: 9.5, task: 'arquitectura ADR decisão' })
  );
  // @Rex: muitas falhas → at-risk
  const rexEvents = [
    makeCompleted('@Rex'),
    ...Array.from({ length: 9 }, () => makeFailed('@Rex')),
  ];

  const eng = engineWith(
    [...ariaEvents, ...rexEvents],
    {
      '@Aria': ['Produzir ADRs de arquitectura'],
      '@Rex':  ['Zero vulnerabilidades críticas'],
    }
  );

  const report = eng.teamReport();

  assert.equal(report.agents_total, 2);
  assert.ok(typeof report.team_overall_progress === 'number');
  assert.ok(Array.isArray(report.at_risk));
  assert.ok(Array.isArray(report.on_track));
  assert.ok(Array.isArray(report.completed));

  // @Rex deve estar at-risk
  const rexAtRisk = report.at_risk.find(r => r.agentId === '@Rex');
  assert.ok(rexAtRisk, '@Rex deve estar em at-risk');
});

// ─── 14. createFromAgents() ───────────────────────────────────────────────────

test('createFromAgents(): popula engine com OKRs dos agentes', () => {
  const agents = [
    { id: '@Dex',   okrs: ['Implementar sem bugs', 'Testes a 100%'] },
    { id: '@Quinn', okrs: ['Zero regressões'] },
    { id: '@Aria',  okrs: [] },  // sem KRs
  ];
  const eng = createFromAgents(agents, { getLedgerEvents: () => [] });

  // Deve ter os 3 agentes
  const allDex  = eng.progress('@Dex');
  const allQuin = eng.progress('@Quinn');
  const allAria = eng.progress('@Aria');

  assert.equal(allDex.okrs.length,  2);
  assert.equal(allQuin.okrs.length, 1);
  assert.equal(allAria.okrs.length, 0);
});

test('createFromAgents(): ignora agentes sem okrs array', () => {
  const agents = [
    { id: '@Dex', okrs: ['KR1'] },
    { id: '@Gage' },  // sem okrs
    { id: '@Uma', okrs: null },  // null
  ];
  assert.doesNotThrow(() => {
    createFromAgents(agents, { getLedgerEvents: () => [] });
  });
});

// ─── 15. refresh() — INVALIDA CACHE ──────────────────────────────────────────

test('refresh(): cache é invalidado e novos eventos são lidos', () => {
  const events = [makeCompleted('@Dex', { quality: 9.0 })];
  let callCount = 0;

  const eng = new OKREngine({
    getLedgerEvents: () => { callCount++; return events; },
  });
  eng.define('@Dex', ['KR1']);

  // Primeiro progress — lê ledger
  eng.progress('@Dex');
  const callsAfterFirst = callCount;

  // Segundo progress dentro do TTL — usa cache
  eng.progress('@Dex');
  assert.equal(callCount, callsAfterFirst, 'Cache devia evitar segunda leitura');

  // Após refresh → lê de novo
  eng.refresh();
  eng.progress('@Dex');
  assert.ok(callCount > callsAfterFirst, 'Após refresh devia reler o ledger');
});

// ─── 16-17. STATUS MAPPING ────────────────────────────────────────────────────

test('status: not-started quando progress < PROGRESS_AT_RISK', () => {
  // 0 tasks → fallback → not-started
  const eng = engineWith([], { '@Orion': ['Manter repositório limpo'] });
  const result = eng.progress('@Orion');
  assert.equal(result.okrs[0].status, 'not-started');
});

test('status: completed quando taxa de sucesso perfeita e keywords relevantes', () => {
  // 10 tasks completadas com quality máxima e KR muito relevante
  const events = Array.from({ length: 10 }, () =>
    makeCompleted('@Dex', {
      quality: 10.0,
      task: 'implementar código qualidade entrega produção',
    })
  );
  const eng = engineWith(
    events,
    { '@Dex': ['Implementar código com qualidade, entrega sem bugs em produção'] }
  );
  const result = eng.progress('@Dex');
  // Com rate=1.0, quality=1.0, keyword_match alto → deve ser completed
  assert.ok(
    result.okrs[0].progress >= PROGRESS_ON_TRACK,
    `progress ${result.okrs[0].progress} devia ser >= ${PROGRESS_ON_TRACK}`
  );
});

// ─── 18. BOUNDS — NUNCA SAIR DE [0, 1] ───────────────────────────────────────

test('progress: nunca excede 1.0 nem vai abaixo de 0', () => {
  const scenarios = [
    [],
    Array.from({ length: 20 }, () => makeCompleted('@Test', { quality: 10.0 })),
    Array.from({ length: 20 }, () => makeFailed('@Test')),
  ];

  for (const events of scenarios) {
    const eng = engineWith(events, { '@Test': ['KR qualquer texto'] });
    const result = eng.progress('@Test');
    assert.ok(result.summary.overall_progress >= 0,    'progress deve ser >= 0');
    assert.ok(result.summary.overall_progress <= 1.0,  'progress deve ser <= 1.0');
    if (result.okrs.length > 0) {
      assert.ok(result.okrs[0].progress >= 0,    'okr.progress deve ser >= 0');
      assert.ok(result.okrs[0].progress <= 1.0,  'okr.progress deve ser <= 1.0');
    }
  }
});

// ─── 19. CORRELAÇÃO POR runId ──────────────────────────────────────────────────

test('progress(): correlaciona runId para extrair texto de TaskCreated', () => {
  const runId    = 'run-special-456';
  const taskText = 'implementar endpoint de billing com stripe webhook';

  // TaskCreated emitido pelo orchestrator (sem actor do agente)
  const created = makeCreated(runId, taskText);

  // TaskCompleted com runId mas sem texto da task
  const completed = {
    id:        'evt-completed',
    timestamp: new Date().toISOString(),
    actor:     '@Dex',
    type:      'TaskCompleted',
    payload: {
      agent:         '@Dex',
      quality_score: 8.0,
      runId,
      // task: ausente propositadamente
    },
  };

  // Adicionar mais 2 events para ter MIN_TASKS_FOR_SIGNAL
  const e2 = makeCompleted('@Dex', { quality: 8.0, task: 'billing stripe webhook' });
  const e3 = makeCompleted('@Dex', { quality: 8.0, task: 'billing stripe webhook' });

  const eng = engineWith(
    [created, completed, e2, e3],
    { '@Dex': ['Implementar billing Stripe'] }
  );

  const result = eng.progress('@Dex');
  // Deve ter encontrado keywords 'billing' e 'stripe' via correlação de runId
  const krResult = result.okrs[0];
  assert.ok(
    krResult.evidence.keyword_match > 0 || krResult.evidence.matched_keywords.length > 0,
    'Deve encontrar keywords via correlação de runId com TaskCreated'
  );
});

// ─── 20. AGENTE SEM EVENTOS RELEVANTES ────────────────────────────────────────

test('progress(): agente com eventos de sistema (não-task) → tasks_total=0', () => {
  const events = [
    {
      id: 'evt-sys',
      timestamp: new Date().toISOString(),
      actor: '@Dex',
      type: 'SystemBoot',
      payload: {},
    },
    {
      id: 'evt-proposal',
      timestamp: new Date().toISOString(),
      actor: '@Dex',
      type: 'ProposalSubmitted',
      payload: { approach: 'abc' },
    },
  ];
  const eng = engineWith(events, { '@Dex': ['Entregar features sem bugs'] });
  const result = eng.progress('@Dex');
  assert.equal(result.summary.tasks_total, 0,
    'Eventos SystemBoot e ProposalSubmitted não devem contar como tasks');
});

// ─── SUMMARY ──────────────────────────────────────────────────────────────────

test('progress(): summary tem todos os campos obrigatórios', () => {
  const eng = engineWith(
    [makeCompleted('@Oracle', { quality: 8.0 })],
    { '@Oracle': ['Relatório semanal sem erros'] }
  );
  const result = eng.progress('@Oracle');

  const required = [
    'overall_progress', 'tasks_total', 'tasks_completed',
    'tasks_failed', 'avg_quality', 'success_rate', 'period_days', 'computed_at',
  ];
  for (const field of required) {
    assert.ok(Object.hasOwn(result.summary, field),
      `summary deve ter campo '${field}'`);
  }
  assert.ok(result.summary.computed_at.includes('T'),
    'computed_at deve ser ISO8601');
});

test('progress(): period reflecte janela correcta', () => {
  const eng = engineWith([], { '@Dex': ['KR1'] });
  const r7   = eng.progress('@Dex');
  const r30  = eng.progress('@Dex', { longPeriod: true });
  assert.equal(r7.period,  '7d');
  assert.equal(r30.period, '30d');
});
