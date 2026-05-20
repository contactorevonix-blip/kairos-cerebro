'use strict';

/**
 * HYPERDRIVE — CognitiveAgent
 * Base class para todos os agentes. Três fases obrigatórias:
 *   1. prethink() — PENSAR antes de agir (análise estruturada)
 *   2. executeTask() — AGIR com monitorização e checkpoints
 *   3. reflect() — APRENDER após completar
 *
 * Usa o provider Anthropic existente (invoke/invokeWithTools) —
 * zero novas dependências, prompt caching mantido.
 */

const { invoke, invokeWithTools, getBudgetStatus } = require('../providers/anthropic');
const { QualityGates } = require('./quality-gates');

const PRETHINK_TIMEOUT_MS = 60_000;

class CognitiveAgent {
  constructor(profile, ledger, knowledgeGraph) {
    this.profile = profile;
    this.ledger  = ledger;
    this.kg      = knowledgeGraph;
    this.gates   = new QualityGates();
  }

  // ═══════════════════════════════════════════════════════════
  // FASE 1 — PRE-THINKING
  // ═══════════════════════════════════════════════════════════

  async prethink(task) {
    if (process.env.KAIROS_LIVE !== '1') {
      // Mock: prethink instantâneo
      return {
        ready:      true,
        thinking:   this._mockThinking(task),
        confidence: this.profile.baseConfidence || 0.75,
      };
    }

    const prompt = this._buildPrethinkPrompt(task);

    let text;
    try {
      const res = await Promise.race([
        invoke(this.profile.id, prompt, 'prethink', { task: task.description }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('prethink timeout')), PRETHINK_TIMEOUT_MS)),
      ]);
      text = res.text || '';
    } catch (err) {
      console.warn(`  [PRETHINK] ${this.profile.id} timeout/error — usando fallback`);
      return { ready: true, thinking: this._mockThinking(task), confidence: 0.65 };
    }

    const thinking = this._parseJSON(text) || this._mockThinking(task);

    // Confidence suficiente?
    const confidence = Number(thinking.confidence) || 0.65;

    if (confidence < 0.50) {
      console.log(`  ⚠️  [${this.profile.id}] Confidence muito baixa (${confidence}) — escalando`);
      return { ready: false, reason: 'low_confidence', confidence, thinking };
    }

    return { ready: true, thinking, confidence };
  }

  _buildPrethinkPrompt(task) {
    return `Tarefa: "${task.description}"

Como ${this.profile.id} (${this.profile.role || ''}), analisa esta tarefa brevemente e responde em JSON:

{
  "understanding": "O que está a ser pedido",
  "approach": "Como vou abordar",
  "risks": ["risco 1", "risco 2"],
  "plan": {
    "steps": ["step 1", "step 2", "step 3"],
    "duration_estimate": "30min",
    "rollback": "Como reverter se falhar"
  },
  "confidence": 0.85
}

Sê conciso. Foca em acção.`;
  }

  // ═══════════════════════════════════════════════════════════
  // FASE 2 — EXECUTION com monitoring
  // ═══════════════════════════════════════════════════════════

  async executeTask(task, files = []) {
    const startTime = Date.now();
    const monitor   = {
      started_at:      startTime,
      task_id:         task.id || `task_${startTime}`,
      agent_id:        this.profile.id,
      checkpoints:     [],
      deviations:      [],
      confidence:      this.profile.baseConfidence || 0.75,
    };

    console.log(`\n⚡ [${this.profile.id}] Executing: "${task.description.slice(0, 60)}..."`);

    let result;
    try {
      result = await invokeWithTools(this.profile.id, task.description, files, {
        domain: task.domain || 'backend',
      });
    } catch (err) {
      const duration = Date.now() - startTime;
      this.ledger.append(this.profile.id, 'TaskFailed', {
        task: task.description.slice(0, 200),
        error: err.message,
        duration_ms: duration,
      });
      throw err;
    }

    const duration = Date.now() - startTime;
    monitor.duration_ms = duration;

    console.log(`  ✅ [${this.profile.id}] Done (${duration}ms, ${result.toolCalls?.length || 0} tool calls)`);

    this.ledger.append(this.profile.id, 'TaskCompleted', {
      task:       task.description.slice(0, 200),
      domain:     task.domain || 'backend',
      duration_ms: duration,
      costUsd:    result.costUsd || 0,
      toolCalls:  result.toolCalls?.length || 0,
    });

    return { success: true, result, monitor };
  }

  // ═══════════════════════════════════════════════════════════
  // FASE 3 — REFLECTION
  // ═══════════════════════════════════════════════════════════

  async reflect(execution, task) {
    if (process.env.KAIROS_LIVE !== '1') {
      return this._mockReflection(execution, task);
    }

    const prompt = `
Acabaste de executar: "${task.description}"
Duração: ${execution.monitor.duration_ms}ms
Tool calls: ${execution.result.toolCalls?.length || 0}

Responde em JSON com 3 campos:
{
  "learnings": ["o que aprendi que não sabia"],
  "improvements": ["o que faria diferente na próxima vez"],
  "handoff": "Resumo em 2 frases do que foi feito e o que monitorizar"
}`;

    let text;
    try {
      const res = await invoke(this.profile.id, prompt, 'reflection', {});
      text = res.text || '';
    } catch {
      return this._mockReflection(execution, task);
    }

    const reflection = this._parseJSON(text) || this._mockReflection(execution, task);

    this.kg.recordReflection({
      agent:      this.profile.id,
      task_id:    task.id,
      reflection,
      timestamp:  Date.now(),
    });

    return reflection;
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  _parseJSON(text) {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try { return JSON.parse(m[0]); } catch { return null; }
  }

  _mockThinking(task) {
    return {
      understanding: task.description,
      approach: `Executar directamente com ferramentas disponíveis`,
      risks: [],
      plan: {
        steps: ['Analisar contexto', 'Executar', 'Validar resultado'],
        duration_estimate: '15min',
        rollback: 'Restaurar ficheiros anteriores',
      },
      confidence: this.profile.baseConfidence || 0.75,
    };
  }

  _mockReflection(execution, task) {
    return {
      learnings: [],
      improvements: [`Optimizar tempo de execução (actual: ${execution.monitor.duration_ms}ms)`],
      handoff: `Task "${task.description.slice(0, 60)}" completada. ${execution.result.toolCalls?.length || 0} operações executadas.`,
    };
  }
}

module.exports = { CognitiveAgent };
