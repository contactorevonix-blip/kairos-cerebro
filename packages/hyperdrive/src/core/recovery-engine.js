'use strict';

/**
 * KAIROS HYPERDRIVE — Recovery Engine
 *
 * Classifica erros e sugere estratégia de recuperação.
 * NÃO executa recovery por si — retorna plano para o orchestrator.
 * NÃO recebe anthropic nem orchestrator como dependência.
 *
 * Integração:
 *   - append() de '../memory/ledger' com assinatura append(actor, type, payload)
 *   - Zero dependências externas
 */

const { append } = require('../memory/ledger');

const STRATEGIES = {
  timeout: {
    description: 'Task demorou demasiado — dividir em partes',
    action:      'split_task',
    max_attempts: 2,
  },
  token_limit: {
    description: 'Contexto muito grande — comprimir e tentar',
    action:      'compress_context',
    max_attempts: 2,
  },
  api_error: {
    description: 'Erro da API — aguardar e repetir',
    action:      'retry_with_backoff',
    max_attempts: 3,
  },
  json_parse: {
    description: 'Resposta mal formatada — simplificar prompt',
    action:      'simplify_prompt',
    max_attempts: 2,
  },
  tool_failure: {
    description: 'Ferramenta falhou — abordagem alternativa',
    action:      'alternative_approach',
    max_attempts: 2,
  },
  unknown: {
    description: 'Erro desconhecido — escalar ao CEO',
    action:      'escalate',
    max_attempts: 1,
  },
};

class RecoveryEngine {
  constructor() {
    // taskId → número de tentativas por tipo de erro
    this._attempts = new Map();
  }

  /**
   * Classifica o tipo de erro a partir da mensagem.
   * @param {Error} error
   * @returns {string} errorType
   */
  classifyError(error) {
    const msg = (error?.message || '').toLowerCase();
    if (msg.includes('timeout') || msg.includes('timed out'))         return 'timeout';
    if (msg.includes('token')   || msg.includes('context length'))    return 'token_limit';
    if (msg.includes('429')     || msg.includes('rate limit'))        return 'api_error';
    if (msg.includes('json')    || msg.includes('parse') || msg.includes('syntax')) return 'json_parse';
    if (msg.includes('tool')    || msg.includes('function'))          return 'tool_failure';
    return 'unknown';
  }

  /**
   * Devolve o plano de recovery para um erro.
   * O orchestrator decide o que fazer com o plano.
   *
   * @param {string} errorType    - resultado de classifyError()
   * @param {object} task         - { id, description }
   * @param {number} attemptCount - quantas vezes já tentámos este tipo de erro
   * @returns {{ action: string, description: string, modified_task?: string }}
   */
  buildRecoveryPlan(errorType, task, attemptCount) {
    const strategy = STRATEGIES[errorType] || STRATEGIES.unknown;

    // Limite de tentativas atingido → escalar
    if (attemptCount >= strategy.max_attempts) {
      return {
        action:      'escalate',
        description: `Limite de ${strategy.max_attempts} tentativa(s) para "${errorType}" atingido.`,
      };
    }

    // Plano específico por tipo
    if (errorType === 'token_limit') {
      return {
        action:        strategy.action,
        description:   strategy.description,
        modified_task: task.description
          ? task.description.slice(0, 300) + ' [contexto comprimido pelo recovery]'
          : task.description,
      };
    }

    if (errorType === 'json_parse') {
      return {
        action:        strategy.action,
        description:   strategy.description,
        modified_task: task.description
          ? task.description + ' Responde em texto simples, sem JSON.'
          : task.description,
      };
    }

    return {
      action:      strategy.action,
      description: strategy.description,
    };
  }

  /**
   * Regista tentativa no ledger e actualiza contador.
   * @param {string} taskId
   * @param {string} errorType
   * @param {string} strategy
   */
  recordAttempt(taskId, errorType, strategy) {
    const key  = `${taskId}:${errorType}`;
    const prev = this._attempts.get(key) || 0;
    this._attempts.set(key, prev + 1);

    append('recovery-engine', 'RecoveryAttempt', {
      taskId,
      errorType,
      strategy,
      attempt:   prev + 1,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Quantas vezes já tentámos este tipo de erro para esta task.
   * @param {string} taskId
   * @param {string} errorType
   * @returns {number}
   */
  getAttemptCount(taskId, errorType) {
    return this._attempts.get(`${taskId}:${errorType}`) || 0;
  }

  /**
   * Limpa estado de uma task concluída.
   * @param {string} taskId
   */
  clearTask(taskId) {
    for (const key of this._attempts.keys()) {
      if (key.startsWith(`${taskId}:`)) {
        this._attempts.delete(key);
      }
    }
  }
}

module.exports = { RecoveryEngine, STRATEGIES };
