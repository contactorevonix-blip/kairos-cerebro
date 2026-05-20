'use strict';

/**
 * HYPERDRIVE — Central Intelligence (CEO Virtual)
 *
 * Responsabilidades:
 *   1. Decomposição estratégica de tasks complexas
 *   2. Resource allocation (right agent, right task)
 *   3. Continuous risk monitoring
 *   4. Performance management
 *   5. Knowledge synthesis pós-execução
 *
 * Usa Claude Opus para decomposição (decisões críticas de arquitectura).
 * Delega execução para agentes especializados via CognitiveAgent.
 */

const { invoke }           = require('../providers/anthropic');
const { CognitiveAgent }  = require('./cognitive-agent');
const { ConfidenceEngine } = require('./confidence-engine');
const { QualityGates }     = require('./quality-gates');
const { getAgent }         = require('../loaders/agents');

class CentralIntelligence extends CognitiveAgent {
  constructor(agents, ledger, knowledgeGraph, budget) {
    super(
      { id: '@CEO', role: 'Central Intelligence', tier: 'c_suite', baseConfidence: 0.90 },
      ledger,
      knowledgeGraph
    );
    this.agents     = agents;
    this.budget     = budget;
    this.confidence = new ConfidenceEngine(ledger);
    this.gates      = new QualityGates();
  }

  // ═══════════════════════════════════════════════════════════
  // 1. STRATEGIC DECOMPOSITION
  // ═══════════════════════════════════════════════════════════

  async decomposeTask(description) {
    if (process.env.KAIROS_LIVE !== '1') {
      return this._mockDecompose(description);
    }

    const agentList = this.agents.map(a => `${a.id} (${a.role}): ${a.specialty}`).join('\n');

    const prompt = `
Tarefa de Pedro: "${description}"

Agentes disponíveis:
${agentList}

Decompõe em fases executáveis. Responde em JSON:
{
  "strategy": "waterfall|parallel",
  "rationale": "porquê",
  "phases": [
    {
      "id": 1,
      "name": "nome",
      "owner": "@Dex",
      "deliverable": "o que produz",
      "success_criteria": "como validar",
      "duration_estimate": "15min",
      "cost_estimate": "$0.20",
      "dependencies": []
    }
  ],
  "total_estimate": { "duration": "45min", "cost": "$0.80", "confidence": 0.85 },
  "risks": [{ "risk": "...", "impact": "high|medium|low", "mitigation": "..." }]
}`;

    let text;
    try {
      // CEO usa senior model (Opus)
      const res = await invoke('@CEO', prompt, 'consensus', { forceOpus: true });
      text = res.approach || '';
    } catch {
      return this._mockDecompose(description);
    }

    const plan = this._parseJSON(text) || this._mockDecompose(description);
    return plan;
  }

  // ═══════════════════════════════════════════════════════════
  // 2. RESOURCE ALLOCATION
  // ═══════════════════════════════════════════════════════════

  allocateAgent(phase) {
    // Encontrar owner
    const owner = getAgent(this.agents, phase.owner) || this.agents[0];

    // Verificar se está benched
    const recentRate = this.ledger.agentSuccessRate(owner.id);
    if (recentRate !== null && recentRate < 0.40) {
      console.log(`  ⚠️  @CEO: ${owner.id} benched (${(recentRate * 100).toFixed(0)}% success) — procurando backup`);
      const backup = this._findBackup(owner);
      if (backup) {
        console.log(`  🔄 Reassigned: ${owner.id} → ${backup.id}`);
        return backup;
      }
    }

    return owner;
  }

  _findBackup(agent) {
    // Procurar agente do mesmo tier com success rate >= 60%
    return this.agents.find(a =>
      a.id !== agent.id &&
      a.tier === agent.tier &&
      (this.ledger.agentSuccessRate(a.id) ?? 0.75) >= 0.60
    ) || null;
  }

  // ═══════════════════════════════════════════════════════════
  // 3. COORDINATED EXECUTION
  // ═══════════════════════════════════════════════════════════

  async coordinateExecution(plan, task) {
    console.log(`\n🎯 @CEO: Coordenando ${plan.phases?.length || 1} fase(s)...`);

    const execution = {
      task,
      plan,
      status:      'in_progress',
      started_at:  Date.now(),
      phases:      [],
    };

    const phases = plan.phases || [{ id: 1, name: 'Execute', owner: plan.agents?.[0] || '@Dex', deliverable: 'result' }];

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      console.log(`\n━━━ PHASE ${i + 1}/${phases.length}: ${phase.name} ━━━`);

      const owner = this.allocateAgent(phase);
      const agent = new CognitiveAgent(owner, this.ledger, this.kg);

      // Prethink
      const prethink = await agent.prethink({ description: phase.deliverable || task.description });
      if (!prethink.ready) {
        console.log(`  ⚠️  Phase ${i + 1} escalated — baixa confidence`);
        continue;
      }

      // Execute
      const result = await agent.executeTask({
        id:          `${task.id || 'task'}_phase${i + 1}`,
        description: task.description,
        domain:      task.domain || 'backend',
      }, task.files || []);

      // Reflect
      await agent.reflect(result, { id: task.id, description: task.description });

      execution.phases.push({
        ...phase,
        status:    'completed',
        result,
        timestamp: Date.now(),
      });

      this.kg.recordPhaseCompletion(phase, {
        duration:      result.monitor.duration_ms,
        quality_score: 8.5, // heurístico quando sem avaliação humana
        deliverable:   phase.deliverable,
      });
    }

    execution.status       = 'completed';
    execution.completed_at = Date.now();
    execution.duration_ms  = execution.completed_at - execution.started_at;

    return execution;
  }

  // ═══════════════════════════════════════════════════════════
  // 4. SAGE GOVERNANCE REVIEW
  // ═══════════════════════════════════════════════════════════

  async sageReview(plan) {
    // Sage verifica: violações de valores, budget, scope creep
    const budgetOk  = !this.budget.isExceeded(this.budget.monthly * 0.8);
    const phasesOk  = (plan.phases?.length || 0) <= 20;

    if (!budgetOk) {
      return { approved: false, veto: true, violations: ['Budget >80% utilizado'] };
    }

    if (!phasesOk) {
      return {
        approved:       false,
        veto:           false,
        recommendations: ['Dividir plano em tasks mais pequenas (>20 fases é muito)'],
      };
    }

    return { approved: true };
  }

  // ═══════════════════════════════════════════════════════════
  // 5. POST-MORTEM
  // ═══════════════════════════════════════════════════════════

  async conductPostMortem(task, execution) {
    const duration = execution.duration_ms || 0;
    const phases   = execution.phases || [];
    const success  = execution.status === 'completed';

    const summary = {
      task_id:      task.id,
      success,
      phases_total: phases.length,
      duration_ms:  duration,
      budget:       this.budget.summary(),
      learnings:    [],
      next_steps:   [],
    };

    if (!success) {
      summary.learnings.push('Execução falhou — investigar root cause');
    }

    this.ledger.append('@CEO', 'PostMortemCompleted', summary);
    return summary;
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  _mockDecompose(description) {
    const domain = this._guessDomain(description);
    const owner  = this._bestAgentForDomain(domain);
    return {
      strategy: 'waterfall',
      rationale: 'Single-phase task',
      phases: [{
        id:               1,
        name:             'Execute',
        owner:            owner?.id || '@Dex',
        deliverable:      description,
        success_criteria: 'Task completada com output esperado',
        duration_estimate: '15min',
        cost_estimate:    '$0.10',
        dependencies:     [],
      }],
      total_estimate: { duration: '15min', cost: '$0.10', confidence: 0.80 },
      risks: [],
    };
  }

  _guessDomain(description) {
    const lower = description.toLowerCase();
    if (lower.match(/security|segurança|gdpr|vault/)) return 'auditoria';
    if (lower.match(/deploy|railway|vercel|docker/))  return 'infra';
    if (lower.match(/design|ui|css|component|react/)) return 'frontend';
    if (lower.match(/api|endpoint|backend|stripe/))   return 'backend';
    return 'backend';
  }

  _bestAgentForDomain(domain) {
    const domainMap = {
      frontend:  '@Dex',
      backend:   '@Dex',
      infra:     '@Gage',
      auditoria: '@Rex',
      design:    '@Uma',
    };
    const id = domainMap[domain] || '@Dex';
    return getAgent(this.agents, id) || this.agents[0];
  }
}

module.exports = { CentralIntelligence };
