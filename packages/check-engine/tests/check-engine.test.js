'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// ─── PT-BR VALIDATORS ─────────────────────────────────────────────────────────

describe('CPF Validator', () => {
  const { validate, score } = require('../src/sources/ptbr/cpf-validator');

  test('CPF válido aceite', () => {
    // CPF real gerado com algoritmo (usado em testes públicos)
    const r = validate('529.982.247-25');
    assert.equal(r.valid, true);
  });

  test('CPF com dígito errado rejeitado', () => {
    const r = validate('529.982.247-26');
    assert.equal(r.valid, false);
    assert.equal(r.reason, 'invalid_check_digit');
  });

  test('CPF trivial (111.111.111-11) rejeitado', () => {
    const r = validate('111.111.111-11');
    assert.equal(r.valid, false);
    assert.equal(r.reason, 'trivial_sequence');
  });

  test('CPF com tamanho errado rejeitado', () => {
    assert.equal(validate('123456').valid, false);
  });

  test('score() retorna risk_score=60 para CPF inválido', () => {
    const s = score('000.000.000-00');
    assert.equal(s.risk_score, 60);
    assert.ok(s.flag?.startsWith('invalid_cpf'));
  });

  test('score() retorna risk_score=0 para CPF válido', () => {
    const s = score('529.982.247-25');
    assert.equal(s.risk_score, 0);
    assert.equal(s.flag, null);
  });
});

describe('CNPJ Validator', () => {
  const { validate } = require('../src/sources/ptbr/cnpj-validator');

  test('CNPJ válido aceite', () => {
    const r = validate('11.222.333/0001-81');
    assert.equal(r.valid, true);
  });

  test('CNPJ inválido rejeitado', () => {
    const r = validate('11.222.333/0001-82');
    assert.equal(r.valid, false);
  });

  test('CNPJ trivial rejeitado', () => {
    assert.equal(validate('00000000000000').valid, false);
  });
});

// ─── EMAIL SOURCES ─────────────────────────────────────────────────────────────

describe('Disposable Email', () => {
  const { check, score } = require('../src/sources/email/disposable');

  test('mailinator.com é descartável', () => {
    const r = check('test@mailinator.com');
    assert.equal(r.disposable, true);
  });

  test('gmail.com não é descartável', () => {
    const r = check('user@gmail.com');
    assert.equal(r.disposable, false);
  });

  test('score retorna 28 para email descartável', () => {
    const s = score('x@yopmail.com');
    assert.equal(s.risk_score, 28);
    assert.equal(s.flag, 'disposable_email_domain');
  });

  test('email sem @  retorna disposable=false', () => {
    assert.equal(check('notanemail').disposable, false);
  });
});

// ─── RULES ENGINE ──────────────────────────────────────────────────────────────

describe('Rules Engine', () => {
  const { evaluate, getBand, RISK_BANDS } = require('../src/scoring/rules-engine');

  test('zero flags = score 0 (safe)', () => {
    const r = evaluate([]);
    assert.equal(r.score, 0);
    assert.equal(r.band, 'safe');
    assert.equal(r.decision, 'accept');
  });

  test('Tor + VPN = score alto (>60)', () => {
    const r = evaluate(['tor_exit_node', 'vpn_detected']);
    assert.ok(r.score > 60, `score ${r.score} deve ser >60`);
    assert.equal(r.decision, 'decline');
  });

  test('CPF inválido = score 60 (high)', () => {
    const r = evaluate(['ptbr_invalid_cpf']);
    assert.equal(r.score, 60);
    assert.ok(['high', 'medium'].includes(r.band));
  });

  test('getBand retorna safe para score 0-25', () => {
    assert.equal(getBand(0).label, 'safe');
    assert.equal(getBand(25).label, 'safe');
  });

  test('getBand retorna critical para score 86-100', () => {
    assert.equal(getBand(90).label, 'critical');
    assert.equal(getBand(100).label, 'critical');
  });

  test('score cap em 100', () => {
    const manyFlags = ['tor_exit_node','vpn_detected','proxy_detected','email_disposable','ptbr_invalid_cpf'];
    const r = evaluate(manyFlags);
    assert.ok(r.score <= 100);
  });
});

// ─── AGGREGATOR ────────────────────────────────────────────────────────────────

describe('Aggregator', () => {
  const { aggregate } = require('../src/scoring/aggregator');

  test('sem resultados = score 0', () => {
    const r = aggregate({});
    assert.equal(r.score, 0);
  });

  test('email descartável contribui ao score', () => {
    const r = aggregate({
      email: { disposable: { risk_score: 28, flag: 'disposable_email_domain' } }
    });
    assert.ok(r.score > 0);
    assert.ok(r.active_flags.includes('disposable_email_domain'));
  });

  test('múltiplas categorias somam correctamente', () => {
    const r = aggregate({
      email: { disposable: { risk_score: 28, flag: 'disposable_email_domain' } },
      ip:    { tor: { risk_score: 45, flag: 'tor_exit_node' } },
    });
    assert.ok(r.score > 50, `score ${r.score} deve ser >50`);
  });
});

// ─── EXPLAINER ─────────────────────────────────────────────────────────────────

describe('Explainer', () => {
  const { explain } = require('../src/scoring/explainer');

  test('score 0 retorna sumário positivo', () => {
    const r = explain(0, [], {});
    assert.ok(r.summary.toLowerCase().includes('nenhum'));
  });

  test('tor_exit_node gera factor com weight=45', () => {
    const r = explain(45, ['tor_exit_node'], {});
    assert.equal(r.top_factors[0].flag, 'tor_exit_node');
    assert.equal(r.top_factors[0].weight, 45);
  });

  test('score >=86 gera recomendação de bloqueio', () => {
    const r = explain(90, ['tor_exit_node', 'vpn_detected'], {});
    assert.ok(r.recommendations.some(rec => rec.toLowerCase().includes('bloqu')));
  });
});

// ─── ORCHESTRATION ─────────────────────────────────────────────────────────────

describe('Circuit Breaker', () => {
  const { CircuitBreaker } = require('../src/orchestration/circuit-breaker');

  test('circuito começa fechado', () => {
    const cb = new CircuitBreaker();
    assert.equal(cb.isOpen('test-source'), false);
  });

  test('3 falhas abre circuito', () => {
    const cb = new CircuitBreaker();
    cb.recordFailure('src');
    cb.recordFailure('src');
    cb.recordFailure('src');
    assert.equal(cb.isOpen('src'), true);
  });

  test('sucesso após abertura fecha circuito', () => {
    const cb = new CircuitBreaker();
    cb.recordFailure('src');
    cb.recordFailure('src');
    cb.recordFailure('src');
    // half-open: forçar com hack
    cb._state.get('src').last_fail -= 35000; // simular 35s depois
    cb.isOpen('src'); // transição para half-open
    cb.recordSuccess('src');
    assert.equal(cb.isOpen('src'), false);
  });
});

describe('Cache', () => {
  const { Cache } = require('../src/orchestration/cache');

  test('get retorna null para key inexistente', () => {
    const c = new Cache();
    assert.equal(c.get('missing'), null);
  });

  test('set + get roundtrip', () => {
    const c = new Cache();
    c.set('k1', { data: 42 }, 5000);
    assert.deepEqual(c.get('k1'), { data: 42 });
  });

  test('entry expirada retorna null', () => {
    const c = new Cache();
    c.set('k2', 'value', -1); // TTL no passado
    assert.equal(c.get('k2'), null);
  });
});

// ─── HYPERDRIVE COGNITIVE ──────────────────────────────────────────────────────

describe('HYPERDRIVE Cognitive Layer', () => {
  const { KairosHyperdrive } = require('../../hyperdrive/src/index');

  test('KairosHyperdrive inicializa sem erros', () => {
    const hd = new KairosHyperdrive();
    assert.ok(hd.agents.length > 0);
    assert.ok(hd.ceo);
  });

  test('status() retorna estrutura esperada', () => {
    const hd     = new KairosHyperdrive();
    const status = hd.status();
    assert.ok('agents' in status);
    assert.ok('ledger' in status);
    assert.ok('budget' in status);
  });
});

describe('Loaders', () => {
  test('loadAgents retorna 11 agentes', () => {
    const { loadAgents } = require('../../hyperdrive/src/loaders/agents');
    const agents = loadAgents();
    assert.ok(agents.length >= 11, `Expected >=11 agents, got ${agents.length}`);
  });

  test('loadBudget retorna estrutura correcta', () => {
    const { loadBudget } = require('../../hyperdrive/src/loaders/budget');
    const b = loadBudget(100);
    assert.equal(b.monthly, 100);
    assert.equal(b.session, 0);
  });
});

describe('Core Engines', () => {
  const { QualityGates }    = require('../../hyperdrive/src/core/quality-gates');
  const { PerformanceManagement } = require('../../hyperdrive/src/core/performance-management');

  test('QualityGates.evaluate passa com testes 100% e sem vulns', () => {
    const gates = new QualityGates();
    const r = gates.evaluate({ testsPassed: 47, testsTotal: 47, qualityScore: 9.0, securityVulns: 0 }, 'code');
    assert.equal(r.pass, true);
    assert.ok(r.score >= 8.5);
  });

  test('QualityGates.evaluate falha com testes 90%', () => {
    const gates = new QualityGates();
    const r = gates.evaluate({ testsPassed: 45, testsTotal: 50, qualityScore: 9.0, securityVulns: 0 }, 'code');
    assert.equal(r.pass, false);
    assert.ok(r.issues.length > 0);
  });

  test('QualityGates.evaluate falha com vuln crítica', () => {
    const gates = new QualityGates();
    const r = gates.evaluate({ testsPassed: 50, testsTotal: 50, qualityScore: 9.5, securityVulns: 1 }, 'code');
    assert.equal(r.pass, false);
  });

  test('PerformanceManagement inicializa sem erros', () => {
    const { loadLedger } = require('../../hyperdrive/src/loaders/ledger');
    const pm = new PerformanceManagement(loadLedger());
    assert.ok(pm);
  });
});
