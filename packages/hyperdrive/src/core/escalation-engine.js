'use strict';

/**
 * KAIROS HYPERDRIVE — Escalation Engine
 * Detecta agentes "stuck" que excedem 5 minutos sem completar a task,
 * escala para o manager responsável e regista o evento no Ledger (hash chain).
 *
 * API pública:
 *   startMonitor(taskId, agentId, taskDescription) — inicia monitorização
 *   completeTask(taskId, outcome)                  — remove do monitor (task terminada)
 *   shouldEscalateById(taskId)                     — verifica se >5min por ID
 *   shouldEscalate(monitor)                        — verifica monitor directo (legacy)
 *   runScheduledCheck()                            — varre todos os monitores activos
 *   escalate(reason, context)                      — escala imediatamente (sem timer)
 *   startAutoPoller(intervalMs?)                   — inicia polling automático real
 *   stopAutoPoller()                               — para o polling
 *   getHistory()                                   — histórico de escaladas em memória
 *   getActiveMonitors()                            — monitores activos com durações
 *
 * Integração com Ledger:
 *   Todos os eventos de escalonamento e notificação ao manager são gravados
 *   na hash chain do ledger em .claude/memory/state-ledger.jsonl.
 */

const { append, EVENT_TYPES } = require('../memory/ledger');

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

/** Threshold de detecção: agente stuck mais de 5 minutos → escalar. */
const ESCALATION_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutos

/** Intervalo padrão do polling automático: 1 minuto. */
const DEFAULT_POLL_INTERVAL_MS = 60 * 1000; // 1 minuto

/** Tipos de evento exclusivos do EscalationEngine (não existem no ledger base). */
const ESCALATION_EVENT = 'TaskEscalated';
const MANAGER_NOTIFIED  = 'ManagerNotified';

// ─── ENGINE ──────────────────────────────────────────────────────────────────

class EscalationEngine {
  /**
   * @param {string[]} [agents]  — lista de agentIds conhecidos (opcional, para overrides futuros)
   */
  constructor(agents = []) {
    this.agents   = agents;
    this.events   = [];        // histórico em memória: todos os escalonamentos desta sessão
    this.monitors = new Map(); // taskId → MonitorEntry

    /** Handle do setInterval do auto-poller (null = parado) */
    this._pollTimer = null;
  }

  // ─── MONITOR ─────────────────────────────────────────────────────────────

  /**
   * Inicia monitorização de uma task.
   * Deve ser chamado logo após o agente começar a trabalhar.
   *
   * @param {string} taskId           — ID único da task (ex: runId do orchestrator)
   * @param {string} agentId          — ex: '@Dex', '@Aria'
   * @param {string} [taskDescription]— descrição legível (truncada a 200 chars)
   * @returns {{ taskId: string, startedAt: number }}
   */
  startMonitor(taskId, agentId, taskDescription = '') {
    const startedAt = Date.now();
    this.monitors.set(taskId, {
      taskId,
      agentId,
      taskDescription: String(taskDescription).slice(0, 200),
      startedAt,
      escalated: false,
    });
    return { taskId, startedAt };
  }

  /**
   * Marca uma task como concluída e remove o monitor.
   * Se a task tinha sido escalada, grava o encerramento no ledger (fecha o loop).
   *
   * @param {string} taskId
   * @param {'completed'|'failed'|'cancelled'} [outcome]
   * @returns {{ durationMs: number, escalated: boolean, outcome: string } | null}
   */
  completeTask(taskId, outcome = 'completed') {
    const monitor = this.monitors.get(taskId);
    if (!monitor) return null;

    const durationMs    = Date.now() - monitor.startedAt;
    const wasEscalated  = monitor.escalated;

    this.monitors.delete(taskId);

    // Registar encerramento no ledger apenas se a task tinha sido escalada
    // (serve para fechar o loop de auditoria)
    if (wasEscalated) {
      append(monitor.agentId || 'orchestrator', EVENT_TYPES.TaskCompleted, {
        taskId,
        outcome,
        durationMs,
        durationMin:  Math.round(durationMs / 60_000 * 10) / 10,
        stuckResolved: true,
        note: 'task tinha sido escalada por timeout — concluída após escalonamento',
      });
    }

    return { durationMs, escalated: wasEscalated, outcome };
  }

  // ─── DETECÇÃO ────────────────────────────────────────────────────────────

  /**
   * Verifica se uma task específica deve ser escalada (stuck > 5min, ainda não escalada).
   *
   * @param {string} taskId
   * @returns {boolean}
   */
  shouldEscalateById(taskId) {
    const monitor = this.monitors.get(taskId);
    if (!monitor || monitor.escalated) return false;
    return Date.now() - monitor.startedAt > ESCALATION_THRESHOLD_MS;
  }

  /**
   * API legacy — aceita objecto monitor directo (sem taskId).
   * Útil para verificações pontuais sem registar no mapa de monitores.
   *
   * @param {{ started_at?: number, startedAt?: number } | null} monitor
   * @returns {boolean}
   */
  shouldEscalate(monitor) {
    if (!monitor) return false;
    const elapsed = Date.now() - (monitor.started_at || monitor.startedAt || 0);
    return elapsed > ESCALATION_THRESHOLD_MS;
  }

  /**
   * Varre todos os monitores activos e escala imediatamente os que ultrapassaram 5min.
   * Garante idempotência: tasks já escaladas não voltam a ser escaladas.
   *
   * Deve ser chamado periodicamente — ou via startAutoPoller().
   *
   * @returns {Array<{ taskId: string, agentId: string, durationMs: number }>}
   */
  runScheduledCheck() {
    const escalated = [];

    for (const [taskId, monitor] of this.monitors.entries()) {
      if (monitor.escalated) continue;

      const durationMs = Date.now() - monitor.startedAt;
      if (durationMs <= ESCALATION_THRESHOLD_MS) continue;

      const stuckMinutes = Math.round(durationMs / 60_000 * 10) / 10;
      const reason = `Agente ${monitor.agentId} stuck há ${stuckMinutes}min` +
        (monitor.taskDescription
          ? ` na task "${monitor.taskDescription.slice(0, 60)}"`
          : '');

      this._doEscalate(reason, {
        taskId,
        agentId:   monitor.agentId,
        durationMs,
        stuckMinutes,
        auto:      true,
      });

      monitor.escalated = true;
      escalated.push({ taskId, agentId: monitor.agentId, durationMs });
    }

    return escalated;
  }

  // ─── AUTO-POLLER ─────────────────────────────────────────────────────────

  /**
   * Inicia o polling automático que chama runScheduledCheck() a cada intervalMs.
   * Seguro chamar múltiplas vezes — não duplica o timer.
   *
   * @param {number} [intervalMs]  — default: 60_000 (1 minuto)
   * @returns {this}
   */
  startAutoPoller(intervalMs = DEFAULT_POLL_INTERVAL_MS) {
    if (this._pollTimer) return this; // já está a correr

    this._pollTimer = setInterval(() => {
      const escalated = this.runScheduledCheck();
      if (escalated.length > 0) {
        console.log(
          `  [EscalationEngine] Auto-poll: ${escalated.length} agente(s) escalado(s) ` +
          `— ${escalated.map(e => e.agentId).join(', ')}`
        );
      }
    }, intervalMs);

    // Não bloquear o processo Node.js (permite que testes e scripts terminem)
    if (this._pollTimer.unref) this._pollTimer.unref();

    console.log(
      `  [EscalationEngine] Auto-poller iniciado ` +
      `(threshold: ${ESCALATION_THRESHOLD_MS / 60_000}min, ` +
      `intervalo: ${intervalMs / 60_000}min)`
    );

    return this;
  }

  /**
   * Para o polling automático.
   * Idempotente — seguro chamar mesmo que o poller não esteja activo.
   *
   * @returns {this}
   */
  stopAutoPoller() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
      console.log('  [EscalationEngine] Auto-poller parado.');
    }
    return this;
  }

  /**
   * Indica se o auto-poller está activo.
   * @returns {boolean}
   */
  get isPolling() {
    return this._pollTimer !== null;
  }

  // ─── ESCALADA ────────────────────────────────────────────────────────────

  /**
   * Escala imediatamente (sem verificar timer).
   * Notifica o manager, grava dois eventos no ledger (TaskEscalated + ManagerNotified)
   * e persiste no histórico em memória.
   *
   * @param {string} reason    — motivo legível (ex: "sem convergência após deliberação")
   * @param {object} [context] — { taskId?, agentId?, durationMs?, stuckMinutes?, auto? }
   * @returns {{ escalated: true, reason: string, manager: string, timestamp: number, eventId: string }}
   */
  escalate(reason, context = {}) {
    return this._doEscalate(reason, context);
  }

  /**
   * Implementação interna de escalonamento.
   * Centraliza toda a lógica para que runScheduledCheck() e escalate() sejam consistentes.
   *
   * @private
   */
  _doEscalate(reason, context = {}) {
    const timestamp    = Date.now();
    const manager      = this._selectManager(context.agentId);
    const stuckMinutes = context.stuckMinutes
      || (context.durationMs ? Math.round(context.durationMs / 60_000 * 10) / 10 : null);

    // ── 1. Guardar no histórico em memória ────────────────────────────────
    const entry = {
      escalated:    true,
      reason,
      context,
      manager,
      timestamp,
      stuckMinutes,
    };
    this.events.push(entry);

    // ── 2. Log imediato no console ────────────────────────────────────────
    console.log(`\n  🚨 ESCALATION → ${manager}`);
    console.log(`     Razão:    ${reason}`);
    if (context.taskId)      console.log(`     Task ID:  ${context.taskId}`);
    if (context.agentId)     console.log(`     Agente:   ${context.agentId}`);
    if (stuckMinutes !== null) {
      console.log(`     Stuck há: ${stuckMinutes}min (threshold: ${ESCALATION_THRESHOLD_MS / 60_000}min)`);
    }
    console.log(`     Manager:  ${manager} notificado\n`);

    // ── 3. Gravar evento TaskEscalated no Ledger (hash chain) ─────────────
    const escalationEvent = append(
      context.agentId || 'orchestrator',
      ESCALATION_EVENT,
      {
        reason:       reason.slice(0, 300),
        manager,
        taskId:       context.taskId    || null,
        agentId:      context.agentId   || null,
        durationMs:   context.durationMs || null,
        stuckMinutes: stuckMinutes,
        threshold:    ESCALATION_THRESHOLD_MS,
        auto:         context.auto      || false,
        ts:           new Date().toISOString(),
      }
    );

    // ── 4. Gravar evento ManagerNotified no Ledger ────────────────────────
    //      (actor = manager para facilitar queries por agente)
    append(manager, MANAGER_NOTIFIED, {
      escalationEventId: escalationEvent.id,
      reason:       reason.slice(0, 200),
      taskId:       context.taskId  || null,
      agentId:      context.agentId || null,
      stuckMinutes: stuckMinutes,
      ts:           new Date().toISOString(),
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
   * Selecciona o manager mais adequado para o agente que ficou stuck.
   * Hierarquia de escalação definida na Kairos Constitution.
   *
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
   * Retorna histórico completo de escaladas desta sessão (imutável).
   * @returns {ReadonlyArray<object>}
   */
  getHistory() {
    return [...this.events];
  }

  /**
   * Retorna lista de tasks actualmente em monitorização com durações calculadas.
   * @returns {Array<{ taskId, agentId, durationMs, durationMin, escalated, description }>}
   */
  getActiveMonitors() {
    const now = Date.now();
    return Array.from(this.monitors.values()).map(m => ({
      taskId:      m.taskId,
      agentId:     m.agentId,
      durationMs:  now - m.startedAt,
      durationMin: Math.round((now - m.startedAt) / 60_000 * 10) / 10,
      escalated:   m.escalated,
      description: m.taskDescription,
    }));
  }
}

module.exports = { EscalationEngine, ESCALATION_THRESHOLD_MS, DEFAULT_POLL_INTERVAL_MS };
