'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const { SpecPipeline } = require('../src/core/spec-pipeline');
const pipeline = new SpecPipeline();

describe('SpecPipeline — needsSpec()', () => {
  test('Task simples sem verb trigger → false', () => {
    assert.equal(pipeline.needsSpec('listar ficheiros em packages/'), false);
  });

  test('Task com verb trigger → true', () => {
    assert.equal(pipeline.needsSpec('implementar endpoint de billing com Stripe e webhooks'), true);
  });

  test('"criar" força spec mesmo em task curta', () => {
    assert.equal(pipeline.needsSpec('criar auth com JWT'), true);
  });

  test('Verb trigger EN → true', () => {
    assert.equal(pipeline.needsSpec('build new referral system with Stripe coupons'), true);
  });

  test('Task >= 15 palavras → true (mesmo sem verbo)', () => {
    const longTask = 'este é um texto bastante longo sem nenhum verbo de trigger mas tem muitas palavras aqui';
    assert.ok(longTask.split(/\s+/).length >= 15);
    assert.equal(pipeline.needsSpec(longTask), true);
  });
});

describe('SpecPipeline — formatAsContext()', () => {
  test('formatAsContext com skipped → string vazia', () => {
    assert.equal(pipeline.formatAsContext({ skipped: true }), '');
  });

  test('formatAsContext com null → string vazia', () => {
    assert.equal(pipeline.formatAsContext(null), '');
  });

  test('formatAsContext com spec válida → contém campos', () => {
    const fakeSpec = {
      skipped: false,
      spec: {
        o_que: 'Implementar endpoint',
        porque: 'Aumenta MRR',
        como: ['passo 1', 'passo 2'],
        criterio_sucesso: 'Testes passam',
        riscos: [{ risco: 'timeout', probabilidade: 'baixa', mitigacao: 'retry' }],
        agente_recomendado: '@Dex',
        estimativa: { duracao: '30min', custo_usd: '0.50', complexidade: 'media' },
      }
    };
    const ctx = pipeline.formatAsContext(fakeSpec);
    assert.ok(ctx.includes('Implementar endpoint'), 'inclui o_que');
    assert.ok(ctx.includes('passo 1'),              'inclui passos');
    assert.ok(ctx.includes('Aumenta MRR'),          'inclui porque');
    assert.ok(ctx.includes('Testes passam'),        'inclui criterio_sucesso');
  });

  test('formatAsContext sem spec → string vazia', () => {
    assert.equal(pipeline.formatAsContext({ skipped: false, spec: null }), '');
  });
});
