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
 * @property {object} [postmortem]   — registo PostMortem após cada execução
 */

const { classify }          = require('./router');
const { HYPERDRIVE_CONFIG } = require('./config');
const { append, EVENT_TYPES, ulid } = require('./memory/ledger');
const { createSnapshot }    = require('./memory/snapshot');
const { markMilestoneStep } = require('./memory/knowledge-graph');
const { EscalationEngine }  = require('./core/escalation-engine');
const { PostMortemEngine }  = require('./core/postmortem-engine');
const { SpecPipeline }      = require('./core/spec-pipeline');
const { RecoveryEngine }    = require('./core/recovery-engine');
const { SelfCritiqueEngine } = require('./core/self-critique');
const { LedgerRAG }         = require('./memory/rag');
const { KGEnricher }        = require('./memory/kg-enricher');
const {
  invoke,
  invokeWithTools,
  resetTaskBudget,
  getBudgetStatus,
  CONFIG,
} = require('./providers/anthropic');

// Instâncias singleton dos engines auxiliares
const escalationEngine = new EscalationEngine();
const postmortemEngine = new PostMortemEngine();
const specPipeline     = new SpecPipeline();
const recoveryEngine   = new RecoveryEngine(); // eslint-disable-line no-unused-vars
const selfCritique     = new SelfCritiqueEngine();
const ledgerRAG        = new LedgerRAG();
const kgEnricher       = new KGEnricher();

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

// Quórum baseado nos 11 agentes reais (ADR-013)
const CONSENSUS_QUORUM = {
  default:     ['@Sage',   '@Oracle', '@Aria'],   // arquitectura/estratégia
  backend:     ['@Dex',    '@Aria',   '@Quinn'],   // técnico backend
  seguranca:   ['@Rex',    '@Aria',   '@Quinn'],   // segurança — @Rex obrigatório
  'check-engine': ['@Dex', '@Rex',   '@Quinn'],   // check-engine
  vendas:      ['@Hermes', '@Sage',  '@Morgan'],  // commercial
  crescimento: ['@Morgan', '@Sage',  '@Oracle'],  // growth
  analytics:   ['@Oracle', '@Sage',  '@Aria'],    // métricas
  design:      ['@Uma',    '@Dex',   '@Quinn'],   // design
  infra:       ['@Gage',   '@Aria',  '@Rex'],     // infra
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

// ─── RED TEAM AUTOMÁTICO ──────────────────────────────────────────────────

/**
 * Corre red team automaticamente após tasks de código.
 * NÃO bloqueia — reporta status no output e no ledger.
 *
 * @param {string} domain        - domínio classificado pelo router
 * @param {string} taskDesc      - descrição da task (para contexto)
 * @param {string} runId         - ID da task para o ledger
 * @returns {Promise<{skipped: boolean, status?: string, critical?: number, high?: number}>}
 */
async function runAutoRedTeam(domain, taskDesc, runId) {
  const CODE_DOMAINS = ['backend', 'frontend', 'check-engine', 'seguranca'];

  if (!CODE_DOMAINS.includes(domain)) {
    return { skipped: true, reason: 'non_code_domain' };
  }

  if (process.env.KAIROS_LIVE !== '1') {
    return { skipped: true, reason: 'mock_mode' };
  }

  // Procurar ficheiros .js modificados nas últimas 2 horas em packages/
  const packagesDir = path.join(__dirname, '..', '..', '..', 'packages');
  if (!fs.existsSync(packagesDir)) return { skipped: true, reason: 'no_packages_dir' };

  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  const recentFiles = [];

  function findRecent(dir, depth = 0) {
    if (depth > 4) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findRecent(fullPath, depth + 1);
        } else if (entry.name.endsWith('.js')) {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.mtimeMs > twoHoursAgo) recentFiles.push(fullPath);
          } catch (_) {}
        }
      }
    } catch (_) {}
  }

  findRecent(packagesDir);

  if (recentFiles.length === 0) {
    return { skipped: true, reason: 'no_recent_files' };
  }

  const { run } = require('./redteam/index');
  let totalCritical = 0;
  let totalHigh     = 0;
  let totalMedium   = 0;

  console.log(`\n🔴 RED TEAM AUTO — a analisar ${recentFiles.length} ficheiro(s) recente(s)...`);

  for (const filePath of recentFiles.slice(0, 10)) {
    try {
      const code   = fs.readFileSync(filePath, 'utf-8');
      const report = run(code, filePath, {});
      totalCritical += report.critical || 0;
      totalHigh     += report.high     || 0;
      totalMedium   += report.medium   || 0;
    } catch (_) {}
  }

  const status = totalCritical > 0 ? 'CRITICAL'
               : totalHigh     > 0 ? 'HIGH'
               : totalMedium   > 0 ? 'MEDIUM'
               : 'CLEAN';

  console.log(`   Status: ${status} | Critical: ${totalCritical} | High: ${totalHigh} | Medium: ${totalMedium}`);

  if (totalCritical > 0) {
    console.log('   ⚠️  Findings CRÍTICOS detectados — @Rex deve rever antes de deploy.');
  }

  append('red-team-auto', 'RedTeamAutoCompleted', {
    runId,
    domain,
    status,
    files_checked: Math.min(recentFiles.length, 10),
    critical: totalCritical,
    high:     totalHigh,
    medium:   totalMedium,
  });

  return { skipped: false, status, critical: totalCritical, high: totalHigh, medium: totalMedium };
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
  const runId    = ulid();
  const taskStart = Date.now();

  // SPEC PIPELINE — gerar spec para tasks complexas
  const specResult  = await specPipeline.generateSpec(task, {});
  const specContext = specPipeline.formatAsContext(specResult);
  if (specContext) {
    console.log('  📋 Spec injectada no contexto do agente.');
  }

  // RAG — contexto histórico de tasks similares bem-sucedidas
  const ragHits    = ledgerRAG.topK(task, 3);
  const ragContext = ledgerRAG.formatContext(ragHits);
  if (ragContext) {
    console.log(`  📚 RAG: ${ragHits.length} task(s) similar(es) encontrada(s).`);
  }

  // Registar task no monitor de escalação
  const monitorId = `run-${runId}`;

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
  console.log(`  Domain: ${route.domain} | Critical: ${route.critical} | Confidence: ${route.confidence}${route.shortTaskBoost ? ' (+boost)' : ''}`);
  console.log(`  Mode: ${CONFIG.isLive ? 'LIVE' : 'MOCK'} | Agents: ${route.agents.join(', ')}`);

  append('orchestrator', EVENT_TYPES.TaskStarted, {
    runId,
    domain:     route.domain,
    critical:   route.critical,
    agents:     route.agents,
    confidence: route.confidence,
    shortTaskBoost: route.shortTaskBoost || false,
  });

  // Iniciar monitor de escalação (detecção de tasks > 10min)
  escalationEngine.startMonitor(monitorId, route.agents[0], task);

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

      // Escalar via EscalationEngine → grava no Ledger
      escalationEngine.escalate(
        'Sem convergência após deliberação de consenso',
        { taskId: monitorId, agentId: route.agents[0] }
      );

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
      const execCtx   = { ...ctx, consensusApproach: consensus.finalApproach, specContext, ragContext };
      const useTools  = isOperationalTask(task);
      if (useTools) console.log(`  [TOOLS] Task operacional → invokeWithTools`);
      let rawExecution = useTools
        ? await invokeWithTools(leadAgent, task, files, { domain: route.domain })
        : await invoke(leadAgent, task, 'execute', execCtx);

      // SELF-CRITIQUE — segunda passagem com haiku (degradação graciosa)
      const critiqueResult = await selfCritique.critique(leadAgent, task, rawExecution?.text || '');
      const execution = critiqueResult.improved
        ? { ...rawExecution, text: critiqueResult.output }
        : rawExecution;

      // KG ENRICHMENT — enriquecer grafo após execução bem-sucedida
      kgEnricher.enrich({ agent: leadAgent, domain: route.domain, task, costUsd: getBudgetStatus().taskCostUsd, confidence_real: route.confidence }).catch(() => {});

      append('orchestrator', EVENT_TYPES.TaskCompleted, {
        runId,
        ledger:          'integrated',
        agent:           leadAgent,
        quality_score:   execution?.costUsd < 0.05 ? 9.0 : execution?.costUsd < 0.20 ? 8.5 : 8.0,
        confidence_real: route.confidence,
        consensusRound:  consensus.round,
        costUsd:         getBudgetStatus().taskCostUsd,
        red_team:        redTeamStatus,
        spec_id:         specResult?.spec?.id || null,
        critique:        critiqueResult.skipped ? null : { improved: critiqueResult.improved, gaps: critiqueResult.gaps, risks: critiqueResult.risks },
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
    const execCtx   = { ...ctx, specContext, ragContext };
    let rawExec = useTools
      ? await invokeWithTools(leadAgent, task, files, { domain: route.domain })
      : await invoke(leadAgent, task, 'execute', execCtx);

    // SELF-CRITIQUE — segunda passagem com haiku
    const directCritique = await selfCritique.critique(leadAgent, task, rawExec?.text || '');
    const execution = directCritique.improved
      ? { ...rawExec, text: directCritique.output }
      : rawExec;

    // KG ENRICHMENT
    kgEnricher.enrich({ agent: leadAgent, domain: route.domain, task, costUsd: getBudgetStatus().taskCostUsd, confidence_real: route.confidence }).catch(() => {});

    append('orchestrator', EVENT_TYPES.TaskCompleted, {
      runId,
      agent:           leadAgent,
      costUsd:         getBudgetStatus().taskCostUsd,
      quality_score:   execution?.costUsd < 0.05 ? 9.0 : execution?.costUsd < 0.20 ? 8.5 : 8.0,
      confidence_real: route.confidence,
      red_team:        redTeamStatus,
      spec_id:         specResult?.spec?.id || null,
      critique:        directCritique.skipped ? null : { improved: directCritique.improved, gaps: directCritique.gaps, risks: directCritique.risks },
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

  // RED TEAM AUTOMÁTICO — após execução bem-sucedida
  let redTeamStatus = 'skipped';
  if (result.ok && !options.dryRun) {
    try {
      const rtResult = await runAutoRedTeam(route.domain, task, runId);
      redTeamStatus = rtResult.status || 'skipped';
    } catch (rtErr) {
      console.warn(`  ⚠️  Red Team auto falhou: ${rtErr.message}`);
    }
  }

  // 4. Completar monitor de escalação
  const durationMs = Date.now() - taskStart;
  escalationEngine.completeTask(monitorId, result.ok ? 'completed' : 'failed');

  // 5. Post-mortem automático (após toda task)
  if (!options.dryRun) {
    try {
      const postmortem = await postmortemEngine.analyze(
        { id: runId, description: task },
        result,
        {
          status:     result.ok ? 'completed' : (result.mode === 'escalated' ? 'escalated' : 'failed'),
          durationMs,
          agent:      route.agents[0],
          domain:     route.domain,
          escalated:  result.mode === 'escalated',
        }
      );
      result.postmortem = postmortem;
      console.log(`  📋 PostMortem: ${postmortem.outcome} | ${postmortem.duration_min}min | ${postmortem.learnings.length} learnings`);
    } catch (pmErr) {
      // PostMortem nunca bloqueia — falha silenciosa com aviso
      console.warn(`  ⚠️  PostMortem falhou: ${pmErr.message}`);
    }
  }

  // 6. Snapshot se task crítica
  if (needsConsensus) {
    createSnapshot({ lastTask: task, lastResult: result.ok }, [], { runId });
  }

  // 7. Relatório de budget
  const budget = getBudgetStatus();
  console.log(`\n  Budget: $${budget.taskCostUsd} / $${budget.hardStop} (sessão: $${budget.sessionCostUsd})`);

  return result;
}

module.exports = { orchestrate, runConsensus, classify, escalationEngine, postmortemEngine, specPipeline, recoveryEngine, selfCritique, ledgerRAG, kgEnricher };
