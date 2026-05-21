'use strict';

/**
 * KAIROS HYPERDRIVE — Spec Pipeline
 *
 * @Oracle analisa tasks complexas antes de executar.
 * Tasks simples (<15 palavras sem verb trigger) → execução directa.
 * Tasks complexas → spec estruturada injectada no contexto do agente.
 *
 * Integração:
 *   - invoke() importado de '../providers/anthropic' (não instanciado)
 *   - append() de '../memory/ledger' com assinatura append(actor, type, payload)
 *   - Zero dependências externas
 */

const fs     = require('node:fs');
const path   = require('node:path');
const crypto = require('node:crypto');

const { invoke }  = require('../providers/anthropic');
const { append }  = require('../memory/ledger');

const SPECS_DIR = path.join(
  __dirname, '..', '..', '..', '..', '.claude', 'memory', 'specs'
);

// Tasks com menos de 15 palavras sem verb trigger → execução directa
const WORD_THRESHOLD = 15;

// Verbos que forçam spec independentemente do tamanho
const TRIGGER_VERBS_PT = [
  'criar', 'implementar', 'construir', 'desenvolver', 'arquitectar',
  'migrar', 'refactorizar', 'redesenhar', 'integrar', 'optimizar',
  'reescrever', 'configurar', 'instalar', 'deployer', 'adicionar',
];

const TRIGGER_VERBS_EN = [
  'create', 'implement', 'build', 'develop', 'architect',
  'migrate', 'refactor', 'redesign', 'integrate', 'optimize',
  'rewrite', 'configure', 'install', 'deploy', 'add',
];

const ALL_TRIGGER_VERBS = [...TRIGGER_VERBS_PT, ...TRIGGER_VERBS_EN];

class SpecPipeline {
  constructor() {
    this._ensureSpecsDir();
  }

  _ensureSpecsDir() {
    if (!fs.existsSync(SPECS_DIR)) {
      fs.mkdirSync(SPECS_DIR, { recursive: true });
    }
  }

  /**
   * Decide se task precisa de spec.
   * @param {string} taskDescription
   * @returns {boolean}
   */
  needsSpec(taskDescription) {
    const lower     = taskDescription.toLowerCase();
    const wordCount = taskDescription.trim().split(/\s+/).length;
    const hasVerb   = ALL_TRIGGER_VERBS.some(v => lower.includes(v));
    return wordCount >= WORD_THRESHOLD || hasVerb;
  }

  /**
   * Gera spec via @Oracle e guarda em .claude/memory/specs/.
   * Em MOCK mode ou task simples → skip.
   *
   * @param {string} taskDescription
   * @param {object} [context={}] - { domain, agents }
   * @returns {Promise<{skipped: boolean, reason?: string, spec?: object}>}
   */
  async generateSpec(taskDescription, context = {}) {
    // Skip em mock mode
    if (process.env.KAIROS_LIVE !== '1') {
      return { skipped: true, reason: 'mock_mode' };
    }

    // Skip em task simples
    if (!this.needsSpec(taskDescription)) {
      return { skipped: true, reason: 'task_simple' };
    }

    console.log('\n📋 SPEC PIPELINE — @Oracle a analisar...');

    const specPrompt = `Analisa esta task e cria uma spec executável.

TASK: "${taskDescription}"

PRODUTO: KairosCheck — API fraud detection PT-BR, €100M MRR é o destino.
DOMÍNIO: ${context.domain || 'não especificado'}
AGENTE EXECUTOR: ${context.agents?.[0] || 'não especificado'}

Standard de qualidade: "Um engenheiro da Stripe ficaria envergonhado?"

Responde APENAS em JSON válido sem markdown, sem texto fora do JSON:

{
  "o_que": "output final em 1-2 frases específicas",
  "porque": "ligação directa ao €100M MRR em 1 frase",
  "como": ["passo 1 verificável", "passo 2 verificável", "passo 3 verificável"],
  "criterio_sucesso": "como sabemos que está 100% feito — mensurável",
  "riscos": [{"risco": "descrição", "probabilidade": "alta|media|baixa", "mitigacao": "acção"}],
  "agente_recomendado": "qual agente e porquê",
  "estimativa": {"duracao": "X minutos", "custo_usd": "0.XX", "complexidade": "simples|media|alta|critica"},
  "perguntas_ceo": ["pergunta que só Pedro pode responder — ou array vazio"]
}`;

    try {
      const response = await invoke(
        '@Oracle',
        specPrompt,
        'spec',
        { domain: context.domain }
      );

      // Extrair texto da resposta
      const rawText = typeof response === 'string'
        ? response
        : response?.text || response?.content || JSON.stringify(response);

      // Extrair JSON — pode vir com ou sem markdown
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Resposta não contém JSON');

      const specData = JSON.parse(jsonMatch[0]);

      const spec = {
        id:         `spec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        task:       taskDescription,
        created_at: new Date().toISOString(),
        created_by: '@Oracle',
        domain:     context.domain || 'unknown',
        ...specData,
      };

      // Guardar spec em disco
      const specPath = path.join(SPECS_DIR, `${spec.id}.json`);
      fs.writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf-8');

      // Gravar no ledger com assinatura correcta
      append('@Oracle', 'SpecCreated', {
        spec_id:     spec.id,
        task:        taskDescription.slice(0, 100),
        domain:      spec.domain,
        complexidade: spec.estimativa?.complexidade,
        agente:      spec.agente_recomendado,
      });

      // Mostrar spec formatada
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 SPEC — @Oracle');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`O QUÊ:    ${spec.o_que}`);
      console.log(`PORQUÊ:   ${spec.porque}`);
      console.log('COMO:');
      (spec.como || []).forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
      console.log(`SUCESSO:  ${spec.criterio_sucesso}`);
      console.log(`AGENTE:   ${spec.agente_recomendado}`);
      console.log(`ESTIMA:   ${spec.estimativa?.duracao} | ${spec.estimativa?.custo_usd} | ${spec.estimativa?.complexidade}`);

      const pergCeo = (spec.perguntas_ceo || []).filter(Boolean);
      if (pergCeo.length > 0) {
        console.log('❓ PERGUNTAS CEO:');
        pergCeo.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
      }

      const altosRiscos = (spec.riscos || []).filter(r => r.probabilidade === 'alta');
      if (altosRiscos.length > 0) {
        console.log('⚠️  RISCOS ALTOS:');
        altosRiscos.forEach(r => console.log(`  - ${r.risco} → ${r.mitigacao}`));
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return { skipped: false, spec };

    } catch (err) {
      console.log(`⚠️  Spec pipeline falhou (${err.message}) — execução directa`);
      return { skipped: true, reason: 'spec_failed', error: err.message };
    }
  }

  /**
   * Formata spec como contexto adicional para injectar no system prompt.
   * @param {object} specResult - resultado de generateSpec()
   * @returns {string}
   */
  formatAsContext(specResult) {
    if (!specResult || specResult.skipped || !specResult.spec) return '';

    const s = specResult.spec;
    return `
━━━ SPEC PRÉ-APROVADA PELO @ORACLE ━━━
O QUÊ: ${s.o_que}
PORQUÊ: ${s.porque}

COMO EXECUTAR:
${(s.como || []).map((p, i) => `${i + 1}. ${p}`).join('\n')}

CRITÉRIO DE SUCESSO: ${s.criterio_sucesso}
COMPLEXIDADE: ${s.estimativa?.complexidade || 'não definida'}

RISCOS:
${(s.riscos || []).map(r => `- [${r.probabilidade?.toUpperCase()}] ${r.risco} → ${r.mitigacao}`).join('\n') || '- Nenhum identificado'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
  }
}

module.exports = { SpecPipeline };
