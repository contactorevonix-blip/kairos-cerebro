'use strict';

/**
 * KAIROS HYPERDRIVE — Orquestrador Principal
 * Protocolo de consenso Raft-simplificado.
 * Integração total com o Ledger (Fase 1).
 * Zero dependências externas.
 *
 * @typedef {Object} AgentContext
 * @property {string} task
 * @property {string[]} files
 * @property {object} [priorProposals]
 * @property {object} [metadata]
 *
 * @typedef {Object} OrchestratorResult
 * @property {boolean} ok
 * @property {'consensus'|'direct'|'escalated'} mode
 * @property {string} domain
 * @property {string[]} agents
 * @property {object|null} consensus
 * @property {string} ledgerEventId
 * @property {object} budget
 */

const { classify }          = require('./router');
const { HYPERDRIVE_CONFIG } = require('./config');
const { append, EVENT_TYPES, ulid } = require('./memory/ledger');
const { createSnapshot }    = require('./memory/snapshot');
const { markMilestoneStep } = require('./memory/knowledge-graph');
const {
  invoke,
  invokeWithTools,
  resetTaskBudget,
  getBudgetStatus,
  CONFIG,
} = require('./providers/anthropic');

// ─── DETECÇÃO DE TASKS OPERACIONAIS ───────────────────────────────────────────

// Keywords que indicam que o agente precisa de executar operações reais no filesystem.
// Nestes casos usa-se invokeWithTools em vez de invoke.
const OPERATIONAL_KEYWORDS = [
  // Escrita
  'produzir', 'criar ficheiro', 'escrever ficheiro', 'gerar ficheiro',
  'write_file', '.json', 'inventory', 'extractions', '.ai/', 'output:',
  // Leitura / listagem — variantes PT e EN
  'listar ficheiros', 'lista os ficheiros', 'lista ficheiros', 'listar',
  'list files', 'list_directory', 'read_file',
  'mostra os ficheiros', 'mostra ficheiros', 'ver ficheiros',
  // Pesquisa
  'scan', 'procurar em', 'grep', 'grep_files', 'pesquisar em',
  // Paths concretos — qualquer task com caminho de pacote ou extensão
  'packages/', 'src/', '.ts', '.js', '.md',
];

function isOperationalTask(task) {
  const lower = task.toLowerCase();
  return OPERATIONAL_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── CONFIGURAÇÃO ──────────────────────────────────────────────────────────

const CONSENSUS_QUORUM = {
  default:    ['@Sage', '@Oracle', '@Aria'],   // arquitectura/estratégia
  backend:    ['@Dex',  '@Aria',   '@Quinn'],  // técnico backend
  auditoria:  ['@Rex',  '@Aria',   '@Quinn'],  // segurança
  vendas:     ['@Hermes','@Sage',  '@Morgan'], // commercial
  crescimento:['@Morgan','@Sage',  '@Oracle'], // growth
};

const SIMILARITY_THRESHOLD  = 0.8;  // convergência mínima
const CONFIDENCE_THRESHOLD  = 0.7;  // confiança mínima por proposta
const MAX_DELIBERATION_ROUNDS = 2;

// ─── COMPRESSOR DE CONTEXTO ────────────────────────────────────────────────

/**
 * Comprime contexto para ≤30% do original.
 * Remove linhas em branco consecutivas, trunca strings longas.
 */
function pruneContext(ctx) {
  const str = JSON.stringify(ctx);
  if (str.length < 2000) return ctx; // já pequeno o suficiente

  const pruned = {};
  for (const [k, v] of Object.entries(ctx)) {
    if (typeof v === 'string' && v.length > 500) {
      pruned[k] = v.slice(0, 500) + '…[truncado]';
    } else if (Array.isArray(v) && v.length > 10) {
      pruned[k] = v.slice(0, 10).concat([`…+${v.length - 10} mais`]);
    } else {
      pruned[k] = v;
    }
  }
  return pruned;
}

// ─── SIMILARIDADE DE PROPOSTAS ─────────────────────────────────────────────

/**
 * Similaridade simplificada entre duas strings (word overlap).
 * @param {string} a
 * @param {string} b
 * @returns {number} 0..1
 */
function similarity(a, b) {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;
  return intersection / Math.max(setA.size, setB.size);
}

// ─── PROTOCOLO DE CONSENSO ─────────────────────────────────────────────────

/**
 * Corre o protocolo de consenso Raft-simplificado.
 * @param {string} task
 * @param {string} domain
 * @param {object} ctx
 * @returns {Promise<{reached: boolean, proposals: object[], finalApproach: string|null}>}
 */
async function runConsensus(task, domain, ctx) {
  const quorum = CONSENSUS_QUORUM[domain] || CONSENSUS_QUORUM.default;
  const prunedCtx = pruneContext(ctx);

  append('orchestrator', EVENT_TYPES.ProposalRequested, {
    task: task.slice(0, 200),
    domain,
    quorum,
    mode: CONFIG.isLive ? 'LIVE' : 'MOCK',
  });

  let proposals = [];

  for (let round = 0; round <= MAX_DELIBERATION_ROUNDS; round++) {
    // Fase paralela — cada agente do quórum propõe
    const roundCtx = round === 0 ? prunedCtx : { ...prunedCtx, priorProposals: proposals };

    const responses = await Promise.all(
      quorum.map(agentId => invoke(agentId, task, 'consensus', roundCtx)
        .catch(err => ({ agentId, approach: `ERROR: ${err.message}`, risks: '', confidence: 0 }))
      )
    );

    proposals = responses;

    // Registar votos no Ledger
    for (const p of proposals) {
      append(p.agentId, EVENT_TYPES.ProposalSubmitted, {
        approach:   p.approach?.slice(0, 300),
        risks:      p.risks?.slice(0, 200),
        confidence: p.confidence,
        round,
        costUsd:    p.costUsd || 0,
      });
    }

    // Verificar convergência
    const validProposals = proposals.filter(p => p.confidence >= CONFIDENCE_THRESHOLD);
    const avgConfidence  = proposals.reduce((s, p) => s + p.confidence, 0) / proposals.length;

    if (validProposals.length >= 2) {
      // Verificar similaridade entre as propostas válidas
      let converged = false;
      let finalApproach = null;

      for (let i = 0; i < validProposals.length - 1; i++) {
        for (let j = i + 1; j < validProposals.length; j++) {
          const sim = similarity(validProposals[i].approach, validProposals[j].approach);
          if (sim >= SIMILARITY_THRESHOLD && avgConfidence >= CONFIDENCE_THRESHOLD) {
            converged = true;
            finalApproach = validProposals[i].approach; // proposta com maior confiança
            break;
          }
        }
        if (converged) break;
      }

      if (converged) {
        append('orchestrator', EVENT_TYPES.ConsensusReached, {
          approach:   finalApproach?.slice(0, 300),
          round,
          avgConfidence: Math.round(avgConfidence * 100) / 100,
          quorum,
        });
        return { reached: true, proposals, finalApproach, round, avgConfidence };
      }
    }

    if (round < MAX_DELIBERATION_ROUNDS) {
      console.log(`  ↻ Ronda ${round + 1} de deliberação (sem convergência)`);
    }
  }

  // Sem convergência → escalar ao humano
  append('orchestrator', EVENT_TYPES.ConsensusEscalated, {
    task: task.slice(0, 200),
    proposals: proposals.map(p => ({ agentId: p.agentId, confidence: p.confidence })),
  });

  return { reached: false, proposals, finalApproach: null, round: MAX_DELIBERATION_ROUNDS };
}

// ─── ORQUESTRADOR PRINCIPAL ────────────────────────────────────────────────

/**
 * Ponto de entrada principal do HYPERDRIVE.
 * @param {string} task              - Descrição da tarefa
 * @param {string[]} [files=[]]      - Ficheiros envolvidos
 * @param {object}  [options={}]     - { forceConsensus, forceAdversarial, dryRun }
 * @returns {Promise<OrchestratorResult>}
 */
async function orchestrate(task, files = [], options = {}) {
  resetTaskBudget();
  const runId = ulid();

  append('orchestrator', EVENT_TYPES.TaskCreated, {
    runId,
    task: task.slice(0, 300),
    files: files.slice(0, 20),
    options,
    mode: CONFIG.isLive ? 'LIVE' : 'MOCK',
  });

  // 1. Classificar
  const route = classify(task, files);
  console.log(`\n[HYPERDRIVE] Task: "${task.slice(0, 80)}"`);
  console.log(`  Domain: ${route.domain} | Critical: ${route.critical} | Confidence: ${route.confidence}`);
  console.log(`  Mode: ${CONFIG.isLive ? 'LIVE' : 'MOCK'} | Agents: ${route.agents.join(', ')}`);

  append('orchestrator', EVENT_TYPES.TaskStarted, {
    runId,
    domain:   route.domain,
    critical: route.critical,
    agents:   route.agents,
    confidence: route.confidence,
  });

  const ctx = pruneContext({ task, files, route, options });
  let result;

  // 2. Roteamento: consenso ou execução directa
  const needsConsensus = route.critical || options.forceConsensus;

  if (options.dryRun) {
    // Dry run — só planeia, não executa
    result = {
      ok:      true,
      mode:    'dry-run',
      domain:  route.domain,
      agents:  route.agents,
      plan:    `[DRY RUN] Seria executado por ${route.agents[0]} ${needsConsensus ? 'com consenso' : 'directamente'}`,
      consensus: null,
      ledgerEventId: runId,
      budget:  getBudgetStatus(),
    };
  } else if (needsConsensus) {
    // 3a. Protocolo de consenso
    console.log(`  → Consenso obrigatório (quórum: ${(CONSENSUS_QUORUM[route.domain] || CONSENSUS_QUORUM.default).join(', ')})`);
    const consensus = await runConsensus(task, route.domain, ctx);

    if (!consensus.reached) {
      // Escalada ao humano
      const proposals3 = consensus.proposals.slice(0, 3);
      console.log('\n⚠️  ESCALADA AO HUMANO — sem convergência após deliberação');
      for (const p of proposals3) {
        console.log(`\n  ${p.agentId} (confidence: ${p.confidence}):\n  ${p.approach?.slice(0, 200)}`);
      }
      result = {
        ok:      false,
        mode:    'escalated',
        domain:  route.domain,
        agents:  route.agents,
        consensus,
        ledgerEventId: runId,
        budget:  getBudgetStatus(),
        message: 'Sem convergência — decisão requer intervenção do CEO.',
      };
    } else {
      // Consenso alcançado → executar com o agente principal
      console.log(`  ✅ Consenso alcançado (ronda ${consensus.round}, avg confidence ${consensus.avgConfidence})`);
      const leadAgent = route.agents[0];
      const execCtx   = { ...ctx, consensusApproach: consensus.finalApproach };
      const useTools  = isOperationalTask(task);
      if (useTools) console.log(`  [TOOLS] Task operacional → invokeWithTools`);
      const execution = useTools
        ? await invokeWithTools(leadAgent, task, files, { domain: route.domain })
        : await invoke(leadAgent, task, 'execute', execCtx);

      append('orchestrator', EVENT_TYPES.TaskCompleted, {
        runId,
        ledger:    'integrated',
        agent:     leadAgent,
        consensusRound: consensus.round,
        costUsd:   getBudgetStatus().taskCostUsd,
      });

      result = {
        ok:      true,
        mode:    'consensus',
        domain:  route.domain,
        agents:  route.agents,
        consensus,
        execution,
        ledgerEventId: runId,
        budget:  getBudgetStatus(),
      };
    }
  } else {
    // 3b. Execução directa
    const leadAgent = route.agents[0];
    const useTools  = isOperationalTask(task);
    console.log(`  → Execução directa por ${leadAgent}${useTools ? ' [com tools]' : ''}`);
    const execution = useTools
      ? await invokeWithTools(leadAgent, task, files, { domain: route.domain })
      : await invoke(leadAgent, task, 'execute', ctx);

    append('orchestrator', EVENT_TYPES.TaskCompleted, {
      runId,
      agent:  leadAgent,
      costUsd: getBudgetStatus().taskCostUsd,
    });

    result = {
      ok:      true,
      mode:    'direct',
      domain:  route.domain,
      agents:  route.agents,
      consensus: null,
      execution,
      ledgerEventId: runId,
      budget:  getBudgetStatus(),
    };
  }

  // 4. Snapshot se task crítica
  if (needsConsensus) {
    createSnapshot({ lastTask: task, lastResult: result.ok }, [], { runId });
  }

  // 5. Relatório de budget
  const budget = getBudgetStatus();
  console.log(`\n  Budget: $${budget.taskCostUsd} / $${budget.hardStop} (sessão: $${budget.sessionCostUsd})`);

  return result;
}

module.exports = { orchestrate, runConsensus, classify };
