'use strict';

/**
 * KAIROS HYPERDRIVE — Post-Mortem Engine
 * Após cada task, grava no Ledger: duração, agente, domínio, outcome,
 * e gera 3 learnings automáticos baseados no resultado.
 *
 * Schema do registo:
 *   task_id      — identificador único da task
 *   agent        — agente responsável
 *   domain       — domínio classificado pelo router
 *   duration_ms  — tempo de execução em ms
 *   outcome      — 'success' | 'failure' | 'escalated' | 'timeout'
 *   success      — boolean
 *   root_cause   — causa raiz (null se sucesso)
 *   learnings    — array de 3 strings geradas automaticamente
 *   action_items — acções concretas de melhoria
 *   timestamp    — ISO8601
 */

const fs   = require('node:fs');
const path = require('node:path');
const { append, EVENT_TYPES } = require('../memory/ledger');

// Ficheiro de persistência de postmortems (separado do ledger para query fácil)
const POSTMORTEM_PATH = process.env.KAIROS_POSTMORTEM_PATH
  || path.join(__dirname, '..', '..', '..', '..', '.claude', 'memory', 'postmortems.jsonl');

// Tipo de evento no ledger
const POSTMORTEM_EVENT = 'PostMortemCreated';

// ─── GERAÇÃO AUTOMÁTICA DE LEARNINGS ──────────────────────────────────────

/**
 * Gera 3 learnings automáticos com base no contexto da task.
 * Regras heurísticas — sem LLM, sem dependências externas.
 *
 * @param {object} params
 * @param {boolean} params.success
 * @param {string}  params.domain
 * @param {string}  params.agentId
 * @param {number}  params.durationMs
 * @param {string}  params.outcome
 * @param {object}  [params.execution]  — resultado da execução
 * @returns {string[]} — exactamente 3 learnings
 */
function generateLearnings({ success, domain, agentId, durationMs, outcome, execution }) {
  const learnings = [];
  const durationMin = durationMs / 60000;

  // ─── Learning 1: sobre eficiência temporal ────────────────────────────

  if (durationMs < 30_000) {
    learnings.push(
      `Task de ${domain} concluída em ${Math.round(durationMs / 1000)}s — ` +
      `operações rápidas neste domínio indicam boa preparação do contexto.`
    );
  } else if (durationMs < 5 * 60_000) {
    learnings.push(
      `Duração de ${Math.round(durationMin * 10) / 10}min para task de ${domain} ` +
      `está dentro do baseline esperado (< 5min). Sem optimizações necessárias.`
    );
  } else if (durationMs < 10 * 60_000) {
    learnings.push(
      `Task de ${domain} levou ${Math.round(durationMin * 10) / 10}min (> 5min). ` +
      `Considerar dividir tarefas similares em sub-tasks de < 5min no futuro.`
    );
  } else {
    learnings.push(
      `Task de ${domain} excedeu 10min (${Math.round(durationMin * 10) / 10}min total). ` +
      `Rever decomposição da task — escalonamento foi/deveria ter sido activado.`
    );
  }

  // ─── Learning 2: sobre sucesso/falha e domínio ────────────────────────

  if (success) {
    const domainInsights = {
      backend:    `Backend entregue com sucesso por ${agentId}. Verificar que testes cobrem os novos caminhos.`,
      frontend:   `Componente frontend entregue. Confirmar responsividade e acessibilidade com @Uma/@Quinn.`,
      infra:      `Infra alterada com sucesso. Validar que rollback está documentado e testado.`,
      auditoria:  `Auditoria concluída. Findings devem ser convertidos em action items com owner e prazo.`,
      refactor:   `Refactor aprovado. Assegurar que 0 regressões foram introduzidas (npm test obrigatório).`,
      docs:       `Documentação actualizada. Rever se reflecte estado actual do código — docs desactualizada é dívida.`,
      estrategia: `Decisão estratégica registada. Garantir que ADR foi criado em KAIROS/03-ENGENHARIA/specs/.`,
      crescimento:`Acção de crescimento implementada. Medir impacto em 7 dias (métrica específica).`,
      vendas:     `Acção de vendas executada. Registar no pipeline e fazer follow-up em ≤ 48h.`,
      navegacao:  `Navegação/análise concluída. Output deve estar em ficheiro, não apenas em resposta de chat.`,
    };
    learnings.push(
      domainInsights[domain] ||
      `Task de ${domain} concluída com sucesso por ${agentId}. Padrão de execução pode ser reutilizado.`
    );
  } else {
    const failureInsights = {
      backend:    `Falha em backend (${agentId}). Verificar se o erro foi de lógica, IO ou dependência externa.`,
      frontend:   `Falha em frontend. Confirmar que o ambiente Next.js está correcto (versão, node_modules).`,
      infra:      `Falha em infra — CRÍTICO. Verificar logs Railway/Vercel imediatamente. Rollback se necessário.`,
      auditoria:  `Falha em auditoria. Re-run com mais contexto. @Rex deve investigar causa raiz.`,
      refactor:   `Refactor falhou. Reverter para estado anterior — "funcionar" tem prioridade sobre "organizado".`,
      docs:       `Falha em docs — incomum. Verificar acesso de escrita ao ficheiro e path correcto.`,
      estrategia: `Decisão estratégica sem conclusão. Marcar como BLOQUEADA e escalar ao CEO.`,
      crescimento:`Acção de crescimento falhou. Investigar causa — usuário? produto? canal?`,
      vendas:     `Lead/deal perdido. Registar motivo de perda — dados de no-deal são tão valiosos quanto deals ganhos.`,
      navegacao:  `Análise incompleta. Verificar se as ferramentas necessárias estão disponíveis e os paths correctos.`,
    };
    learnings.push(
      failureInsights[domain] ||
      `Falha em ${domain} (${agentId}). Investigar causa raiz antes de retry.`
    );
  }

  // ─── Learning 3: sobre o outcome específico ──────────────────────────

  if (outcome === 'timeout') {
    learnings.push(
      `Timeout detectado — task ultrapassou o threshold de 10min. ` +
      `Padrão para ${domain}: decompor em sub-tasks de ≤ 3min. ` +
      `Adicionar checkpoint explícito a cada passo de longa duração.`
    );
  } else if (outcome === 'escalated') {
    learnings.push(
      `Task escalada para manager (${domain}). ` +
      `Escalonamentos repetidos no mesmo domínio indicam necessidade de melhor spec ou mais contexto inicial. ` +
      `Registar este padrão em KAIROS/11-CONHECIMENTO/postmortems/.`
    );
  } else if (outcome === 'failure') {
    const errorHint = execution?.error
      ? `Erro: "${String(execution.error).slice(0, 100)}". `
      : '';
    learnings.push(
      `${errorHint}Regra de prevenção: antes de re-executar, ` +
      `verificar (1) inputs válidos, (2) ficheiros existem, (3) permissões OK. ` +
      `Criar teste de regressão que falhe se este bug reaparecer.`
    );
  } else {
    // success
    learnings.push(
      `Task bem-sucedida em ${domain}. ` +
      `Verificar se este padrão deve ser documentado como template em ` +
      `KAIROS/11-CONHECIMENTO/ para reutilização futura por outros agentes.`
    );
  }

  return learnings.slice(0, 3); // garantia: exactamente 3
}

// ─── ENGINE PRINCIPAL ─────────────────────────────────────────────────────

class PostMortemEngine {

  /**
   * Analisa resultado de uma task e grava postmortem completo.
   *
   * @param {object} task       — { id, description }
   * @param {object} result     — { ok, mode, domain, agents, ... }
   * @param {object} execution  — { status, durationMs, error?, ... }
   * @returns {Promise<object>} — registo completo do postmortem
   */
  async analyze(task, result, execution = {}) {
    const taskId    = task?.id || `task-${Date.now()}`;
    const agentId   = (result?.agents || [])[0] || execution?.agent || 'unknown';
    const domain    = result?.domain || execution?.domain || 'backend';
    const success   = result?.ok ?? (execution?.status === 'completed') ?? false;
    const durationMs = execution?.durationMs
      || (execution?.endedAt && execution?.startedAt
          ? execution.endedAt - execution.startedAt
          : 0);

    // Determinar outcome
    let outcome;
    if (execution?.status === 'timeout' || outcome === 'timeout') {
      outcome = 'timeout';
    } else if (result?.mode === 'escalated' || execution?.escalated) {
      outcome = 'escalated';
    } else if (success) {
      outcome = 'success';
    } else {
      outcome = 'failure';
    }

    // Causa raiz (heurística — sem LLM)
    let rootCause = null;
    if (!success) {
      if (execution?.error) {
        rootCause = String(execution.error).slice(0, 300);
      } else if (outcome === 'timeout') {
        rootCause = 'Task excedeu threshold de 10min — possível loop, operação I/O lenta, ou task sub-especificada.';
      } else if (outcome === 'escalated') {
        rootCause = 'Sem convergência de consenso — agentes com visões divergentes ou task demasiado ambígua.';
      } else {
        rootCause = 'Análise manual necessária — sem informação de erro disponível.';
      }
    }

    // Gerar 3 learnings automáticos
    const learnings = generateLearnings({
      success,
      domain,
      agentId,
      durationMs,
      outcome,
      execution,
    });

    // Action items concretos
    const actionItems = success
      ? this._successActionItems(domain, durationMs)
      : this._failureActionItems(outcome, domain, rootCause);

    // Montar registo completo
    const record = {
      task_id:      taskId,
      task_desc:    (task?.description || '').slice(0, 200),
      agent:        agentId,
      domain,
      duration_ms:  durationMs,
      duration_min: Math.round(durationMs / 60000 * 10) / 10,
      outcome,
      success,
      root_cause:   rootCause,
      learnings,
      action_items: actionItems,
      timestamp:    new Date().toISOString(),
    };

    // Persistir no ficheiro de postmortems
    this._persistRecord(record);

    // Registar no Ledger (hash chain auditável)
    append(agentId, POSTMORTEM_EVENT, {
      task_id:      record.task_id,
      domain:       record.domain,
      outcome:      record.outcome,
      duration_ms:  record.duration_ms,
      learning_count: learnings.length,
      success:      record.success,
    });

    return record;
  }

  // ─── ACTION ITEMS ───────────────────────────────────────────────────────

  _successActionItems(domain, durationMs) {
    const items = [];
    if (durationMs > 5 * 60_000) {
      items.push('Rever decomposição de tasks similares — duração > 5min sugere task demasiado grande');
    }
    if (domain === 'auditoria' || domain === 'backend') {
      items.push('Confirmar que testes de regressão foram adicionados/actualizados');
    }
    if (domain === 'infra') {
      items.push('Verificar que rollback está documentado no ADR ou no DAILY_BRIEF');
    }
    if (items.length === 0) {
      items.push('Nenhuma acção necessária — task executada dentro dos parâmetros normais');
    }
    return items;
  }

  _failureActionItems(outcome, domain, rootCause) {
    const items = [];
    if (outcome === 'timeout') {
      items.push('Decompor task em sub-tasks de ≤ 3min');
      items.push('Adicionar checkpoint explícito após cada operação longa');
    }
    if (outcome === 'escalated') {
      items.push('Melhorar spec da task antes de re-executar');
      items.push('Fornecer mais contexto no prompt inicial');
    }
    if (outcome === 'failure') {
      items.push('Investigar causa raiz antes de retry');
      items.push('Criar teste de regressão que detecte este tipo de falha');
    }
    if (domain === 'infra') {
      items.push('Verificar logs Railway/Vercel e considerar rollback imediato');
    }
    return items;
  }

  // ─── PERSISTÊNCIA ────────────────────────────────────────────────────────

  /**
   * Persiste registo em ficheiro JSONL (append-only).
   * @param {object} record
   */
  _persistRecord(record) {
    try {
      fs.mkdirSync(path.dirname(POSTMORTEM_PATH), { recursive: true });
      fs.appendFileSync(POSTMORTEM_PATH, JSON.stringify(record) + '\n', 'utf8');
    } catch (err) {
      // Não rebentar se o filesystem falhar — avisar apenas
      console.warn(`[PostMortemEngine] Não foi possível persistir: ${err.message}`);
    }
  }

  /**
   * Lê os últimos N postmortems.
   * @param {number} [n=10]
   * @returns {object[]}
   */
  getRecent(n = 10) {
    try {
      const content = fs.readFileSync(POSTMORTEM_PATH, 'utf8').trim();
      if (!content) return [];
      return content
        .split('\n')
        .filter(Boolean)
        .map(l => JSON.parse(l))
        .slice(-n);
    } catch {
      return [];
    }
  }

  /**
   * Estatísticas agregadas para o Weekly Report de @Oracle.
   * @returns {object}
   */
  getStats() {
    const records = this.getRecent(100);
    if (records.length === 0) return { total: 0 };

    const successes = records.filter(r => r.success).length;
    const avgDuration = records.reduce((s, r) => s + (r.duration_ms || 0), 0) / records.length;
    const byDomain = {};
    for (const r of records) {
      byDomain[r.domain] = (byDomain[r.domain] || 0) + 1;
    }

    return {
      total:        records.length,
      successRate:  Math.round((successes / records.length) * 100),
      avgDurationMs: Math.round(avgDuration),
      avgDurationMin: Math.round(avgDuration / 60000 * 10) / 10,
      byDomain,
      byOutcome: {
        success:   records.filter(r => r.outcome === 'success').length,
        failure:   records.filter(r => r.outcome === 'failure').length,
        escalated: records.filter(r => r.outcome === 'escalated').length,
        timeout:   records.filter(r => r.outcome === 'timeout').length,
      },
    };
  }
}

module.exports = { PostMortemEngine, generateLearnings, POSTMORTEM_PATH };
