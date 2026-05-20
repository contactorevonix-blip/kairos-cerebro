'use strict';

/**
 * KAIROS HYPERDRIVE — Main Orchestrator v2
 * Cognitive Intelligence System: prethink → execute → reflect
 *
 * Compatível com o CLI existente. O orchestrate() original fica disponível;
 * este index.js expõe a nova API cognitiva.
 */

const { CentralIntelligence }   = require('./core/central-intelligence');
const { ConfidenceEngine }       = require('./core/confidence-engine');
const { PerformanceManagement }  = require('./core/performance-management');
const { QualityGates }           = require('./core/quality-gates');
const { IntelligenceEngine }     = require('./core/intelligence-engine');
const { loadAgents }             = require('./loaders/agents');
const { loadLedger }             = require('./loaders/ledger');
const { loadKnowledgeGraph }     = require('./loaders/knowledge-graph');
const { loadBudget }             = require('./loaders/budget');
const { HYPERDRIVE_CONFIG }      = require('./config');

class KairosHyperdrive {
  constructor(config = {}) {
    const monthlyBudget = Number(process.env.KAIROS_MONTHLY_BUDGET_USD || config.monthly_budget || 500);

    this.agents      = loadAgents();
    this.ledger      = loadLedger();
    this.kg          = loadKnowledgeGraph();
    this.budget      = loadBudget(monthlyBudget);

    this.ceo         = new CentralIntelligence(this.agents, this.ledger, this.kg, this.budget);
    this.confidence  = new ConfidenceEngine(this.ledger);
    this.performance = new PerformanceManagement(this.ledger);
    this.gates       = new QualityGates();
    this.intelligence = new IntelligenceEngine(this.ledger, this.kg);

    if (HYPERDRIVE_CONFIG.reportStyle !== 'summary-only') {
      console.log('✅ HYPERDRIVE v2 ready');
      console.log(`   Agents: ${this.agents.length} | Ledger: ${this.ledger.length} events`);
      console.log(`   Mode: ${process.env.KAIROS_LIVE === '1' ? 'LIVE 🔴' : 'MOCK ⚪'}`);
    }
  }

  async execute(description, options = {}) {
    const taskId = `task_${Date.now()}`;
    const task   = {
      id:          taskId,
      description,
      domain:      options.domain,
      files:       options.files || [],
      phase_name:  options.phase_name,
    };

    // 1. Decomposição estratégica (CEO)
    const plan = await this.ceo.decomposeTask(description);

    // 2. Governance (Sage)
    const governance = await this.ceo.sageReview(plan);
    if (!governance.approved) {
      if (governance.veto) throw new Error(`Governance VETO: ${governance.violations?.join(', ')}`);
      console.log(`  ⚖️  Sage: ${governance.recommendations?.join('; ')}`);
    }

    // 3. Execução coordenada
    const execution = await this.ceo.coordinateExecution(plan, task);

    // 4. Post-mortem
    const postMortem = await this.ceo.conductPostMortem(task, execution);

    if (HYPERDRIVE_CONFIG.reportStyle === 'summary-only') {
      const phases   = execution.phases?.length || 0;
      const duration = Math.round((execution.duration_ms || 0) / 1000);
      const budget   = this.budget.summary();
      console.log(`\n✅ Task completa | ${phases} fase(s) | ${duration}s | $${budget.session_spend} gasto`);
    }

    return {
      success:     true,
      task_id:     taskId,
      execution,
      post_mortem: postMortem,
      plan,
      budget:      this.budget.summary(),
    };
  }

  status() {
    return {
      agents:    this.agents.length,
      ledger:    this.ledger.length,
      budget:    this.budget.summary(),
      mode:      process.env.KAIROS_LIVE === '1' ? 'LIVE' : 'MOCK',
      config:    HYPERDRIVE_CONFIG,
    };
  }
}

module.exports = { KairosHyperdrive };
