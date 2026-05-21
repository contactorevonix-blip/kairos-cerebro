'use strict';

/**
 * KAIROS HYPERDRIVE — Escalation Engine
 * Detecta tasks que excedem 10 minutos, escala para manager e regista no Ledger.
 *
 * Lógica:
 *   1. startMonitor(taskId, agentId, taskDescription) — regista início
 *   2. checkEscalation(taskId)                        — verifica se >10min
 *   3. completeTask(taskId, outcome)                  — marca como concluída
 *   4. escalate(reason, context)                      — escala imediatamente (sem timer)
 *
 * Integração com Ledger: todos os eventos críticos são gravados.
 */

const { append, EVENT_TYPES } = require('../memory/ledger');

const ESCALATION_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutos

// Tipos de evento adicionais (não existem no ledger base)
const ESCALATION_EVENT = 'TaskEscalated';
const MANAGER_NOTIFIED  = 'ManagerNotified';

class EscalationEngine {
  constructor(agents = []) {
    this.agents  = agents;
    this.events  = [];       // histórico em memória para debug
    this.monitors = new Map(); // taskId → { startedAt, agentId, taskDescription, escalated }
  }

  // ─── MONITOR ──────────────────────────────────────────────────────────────

  /**
   * Inicia monitorização de uma task.
   * @param {string} taskId
   * @param {string} agentId
   * @param {string} taskDescription
   * @returns {{ taskId: string, startedAt: number }}
   */
  startMonitor(taskId, agentId, taskDescription = '') {
    const startedAt = Date.now();
    this.monitors.set(taskId, {
      taskId,
      agentId,
      taskDescription: taskDescription.slice(0, 200),
      startedAt,
      escalated: false,
    });
    return { taskId, startedAt };
  }

  /**
   * Marca uma task como concluída — remove do monitor.
   * @param {string} taskId
   * @param {'completed'|'failed'|'cancelled'} outcome
   * @returns {{ durationMs: number, escalated: boolean } | null}
   */
  completeTask(taskId, outcome = 'completed') {
    const monitor = this.monitors.get(taskId);
    if (!monitor) return null;

    const durationMs = Date.now() - monitor.startedAt;
    const wasEscalated = monitor.escalated;

    this.monitors.delete(taskId);

    // Registar conclusão no ledger só se tarefa foi escalada (para fechar o loop)
    if (wasEscalated) {
      append(monitor.agentId || 'orchestrator', EVENT_TYPES.TaskCompleted, {
        taskId,
        outcome,
        durationMs,
        durationMin: Math.round(durationMs / 60000 * 10) / 10,
        note: 'task tinha sido escalada — concluída após escalonamento',
      });
    }

    return { durationMs, escalated: wasEscalated, outcome };
  }

  // ─── DETECÇÃO ────────────────────────────────────────────────────────────

  /**
   * Verifica se uma task específica deve ser escalada (>10min).
   * @param {string} taskId
   * @returns {boolean}
   */
  shouldEscalateById(taskId) {
    const monitor = this.monitors.get(taskId);
    if (!monitor || monitor.escalated) return false;
    return Date.now() - monitor.startedAt > ESCALATION_THRESHOLD_MS;
  }

  /**
   * API legacy — aceita objecto monitor directo.
   * @param {{ started_at?: number } | null} monitor
   * @returns {boolean}
   */
  shouldEscalate(monitor) {
    if (!monitor) return false;
    const elapsed = Date.now() - (monitor.started_at || monitor.startedAt || 0);
    return elapsed > ESCALATION_THRESHOLD_MS;
  }

  /**
   * Varre todos os monitores activos e escala os que ultrapassaram 10min.
   * Deve ser chamado periodicamente (ex: a cada minuto pelo orchestrator).
   * @returns {Array<{ taskId: string, agentId: string, durationMs: number }>} lista de escalados
   */
  runScheduledCheck() {
    const escalated = [];
    for (const [taskId, monitor] of this.monitors.entries()) {
      if (!monitor.escalated && this.shouldEscalate({ started_at: monitor.startedAt })) {
        const durationMs = Date.now() - monitor.startedAt;
        this._doEscalate(
          `Task "${monitor.taskDescription.slice(0, 60)}…" excedeu ${Math.round(durationMs / 60000)}min`,
          { taskId, agentId: monitor.agentId, durationMs, auto: true }
        );
        monitor.escalated = true;
        escalated.push({ taskId, agentId: monitor.agentId, durationMs });
      }
    }
    return escalated;
  }

  // ─── ESCALADA ────────────────────────────────────────────────────────────

  /**
   * Escala imediatamente (sem verificar timer).
   * Notifica manager, grava no ledger e no histórico em memória.
   * @param {string} reason
   * @param {object} context
   * @returns {{ escalated: boolean, reason: string, timestamp: number, eventId: string }}
   */
  escalate(reason, context = {}) {
    return this._doEscalate(reason, context);
  }

  /**
   * Implementação interna de escalonamento.
   * @private
   */
  _doEscalate(reason, context = {}) {
    const timestamp = Date.now();
    const manager   = this._selectManager(context.agentId);

    const entry = {
      escalated:  true,
      reason,
      context,
      manager,
      timestamp,
    };

    // Guardar no histórico em memória
    this.events.push(entry);

    // Notificar no console (substitui notificação externa que seria via webhook)
    console.log(`\n  🚨 ESCALATION → ${manager}`);
    console.log(`     Razão:    ${reason}`);
    if (context.taskId)    console.log(`     Task ID:  ${context.taskId}`);
    if (context.agentId)   console.log(`     Agente:   ${context.agentId}`);
    if (context.durationMs) {
      console.log(`     Duração:  ${Math.round(context.durationMs / 60000 * 10) / 10}min`);
    }

    // Gravar evento de escalonamento no Ledger (hash chain)
    const escalationEvent = append(
      context.agentId || 'orchestrator',
      ESCALATION_EVENT,
      {
        reason:     reason.slice(0, 300),
        manager,
        taskId:     context.taskId   || null,
        durationMs: context.durationMs || null,
        auto:       context.auto     || false,
        ts:         new Date().toISOString(),
      }
    );

    // Gravar notificação ao manager no Ledger
    append(manager, MANAGER_NOTIFIED, {
      escalationEventId: escalationEvent.id,
      reason: reason.slice(0, 200),
      taskId: context.taskId || null,
      ts:     new Date().toISOString(),
    });

    return {
      escalated:  true,
      reason,
      manager,
      timestamp,
      eventId:    escalationEvent.id,
    };
  }

  // ─── UTILITÁRIOS ─────────────────────────────────────────────────────────

  /**
   * Selecciona o manager mais adequado com base no agente que falhou.
   * Mapeamento: agente → manager de fallback.
   * @param {string} [agentId]
   * @returns {string}
   */
  _selectManager(agentId) {
    const managerMap = {
      '@Dex':    '@Aria',    // código → arquitectura
      '@Uma':    '@Aria',    // design → arquitectura
      '@Gage':   '@Aria',    // devops → arquitectura
      '@Quinn':  '@Orion',   // QA → sovereign
      '@Rex':    '@Orion',   // security → sovereign
      '@Morgan': '@Sage',    // growth → estratégia
      '@Hermes': '@Sage',    // sales → estratégia
      '@Oracle': '@Sage',    // analytics → estratégia
      '@Aria':   '@Orion',   // arquitectura → sovereign
      '@Sage':   '@Orion',   // estratégia → sovereign
    };
    return managerMap[agentId] || '@Orion'; // fallback: Sovereign
  }

  /**
   * Retorna histórico de escaladas (para reports e debugging).
   * @returns {Array}
   */
  getHistory() {
    return [...this.events];
  }

  /**
   * Retorna tasks actualmente em monitorização.
   * @returns {Array<{ taskId, agentId, durationMs, escalated }>}
   */
  getActiveMonitors() {
    const now = Date.now();
    return Array.from(this.monitors.values()).map(m => ({
      taskId:     m.taskId,
      agentId:    m.agentId,
      durationMs: now - m.startedAt,
      durationMin: Math.round((now - m.startedAt) / 60000 * 10) / 10,
      escalated:  m.escalated,
      description: m.taskDescription,
    }));
  }
}

module.exports = { EscalationEngine, ESCALATION_THRESHOLD_MS };
