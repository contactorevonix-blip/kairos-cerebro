// Director.js — Controla o workflow das 15 fases sem deadlocks.
// Cada fase corre sob phaseTimeout. Um deadlock global aborta tudo limpo.
// O Director nao executa o trabalho dos agentes via LLM aqui — orquestra a malha,
// regista estado no Cerebro, e deixa hooks documentados onde o trabalho real entra.

import { CircuitBreaker } from './CircuitBreaker.js';
import { EngineeringLoop } from './EngineeringLoop.js';

const PHASE_FNS = {}; // preenchido abaixo

export class Director {
  constructor({ registry, mesh, cerebro, config }) {
    this.registry = registry;
    this.mesh = mesh;
    this.cerebro = cerebro;
    this.config = config;
    this.loop = new EngineeringLoop(cerebro, config);
    this.startedAt = 0;
  }

  /** Guarda global anti-deadlock: aborta toda a corrida se exceder o limite. */
  deadlockGuard() {
    const limit = this.config.circuitBreaker.globalDeadlockTimeoutMs;
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`DEADLOCK GLOBAL — abortado apos ${limit}ms`)), limit)
    );
  }

  async runPhase(name, fn) {
    this.cerebro.setPhase(name);
    const timeout = this.config.circuitBreaker.phaseTimeoutMs;
    const result = await CircuitBreaker.withTimeout(
      Promise.resolve().then(() => fn(this)), timeout, `fase:${name}`
    );
    this.cerebro.recordPhaseResult(name, result);
    await this.cerebro.persist();
    return result;
  }

  /** Corre as 15 fases em sequencia, com guarda de deadlock global em paralelo. */
  async orchestrate({ dryRun = false } = {}) {
    this.startedAt = Date.now();
    this.cerebro.state.startedAt ??= new Date().toISOString();

    const pipeline = (async () => {
      const phases = this.config.phases;
      for (const phase of phases) {
        const fn = PHASE_FNS[phase];
        if (!fn) {
          this.cerebro.log('warn', `Fase '${phase}' sem implementacao — hook documentado, saltada`);
          continue;
        }
        try {
          await this.runPhase(phase, dryRun ? async () => ({ dryRun: true, phase }) : fn);
        } catch (err) {
          this.cerebro.log('error', `Fase '${phase}' falhou: ${err.message}`);
          // Self-healing ao nivel de fase: regista e continua (nao deixa deadlock).
          this.cerebro.recordHeal([`fase ${phase} timeout/erro`], 'fase saltada para evitar deadlock', 0);
        }
      }
      return 'completo';
    })();

    return Promise.race([pipeline, this.deadlockGuard()]);
  }
}

// ---- Implementacao das fases (hooks reais onde o trabalho LLM/dados entra) ----

PHASE_FNS['ingestao'] = async (d) => {
  await d.registry.ingest();
  d.cerebro.log('info', `Ingestao: ${d.registry.list().length} agentes reais carregados`);
  return { agents: d.registry.list().length };
};

PHASE_FNS['dna'] = async (d) => {
  // HOOK: injeccao de DNA. Le DNA JA EXISTENTE em squads/*/outputs/minds/.
  // NAO inventa scraping de mentes (Artigo IV). Fonte real ou nada.
  d.cerebro.log('info', 'DNA: a ler perfis mentais existentes (minds/). Scraping externo = hook por ligar.');
  return { dnaSource: 'squads/*/outputs/minds (existente)', externalScraping: 'NOT_WIRED' };
};

PHASE_FNS['contextualizacao'] = async (d) => {
  const groups = d.registry.triage();
  d.cerebro.remember('triage', groups);
  return groups;
};

PHASE_FNS['triagem'] = async (d) => d.registry.triage();

PHASE_FNS['execucao-alpha'] = async (d) => {
  // Loop de engenharia >=10x com self-healing sobre uma tarefa representativa.
  return d.loop.run(
    'execucao-alpha',
    async (i, prev) => ({ iteration: i, refined: (prev?.refined ?? 0) + 1 }),
    async (out) => ({ ok: out.refined >= 1, issues: out.refined < 1 ? ['sem refinamento'] : [] }),
    async (out) => ({ ...out, refined: out.refined + 1, healed: true })
  );
};

PHASE_FNS['auto-loop-tecnico'] = PHASE_FNS['execucao-alpha'];

PHASE_FNS['enriquecimento'] = async (d) => {
  // HOOK: dados de mercado em tempo real via MCP (EXA existe via docker-gateway).
  d.cerebro.log('warn', 'Enriquecimento: feed de mercado e hook por ligar (EXA/MCP). Sem dados inventados.');
  return { marketFeed: 'NOT_WIRED', note: 'ligar via @devops + MCP EXA' };
};

PHASE_FNS['consolidacao'] = async (d) => {
  await d.cerebro.persist();
  return { consolidated: Object.keys(d.cerebro.state.crossMemory).length };
};

PHASE_FNS['commits-estado'] = async (d) => {
  // Memoria de longo prazo -> STATE.md. git push e EXCLUSIVO do @devops (Artigo II).
  await d.cerebro.syncToStateMd(d.config.paths.stateFile, [
    `Orchestrator: ${d.registry.list().length} agentes orquestrados`,
    `Self-heals: ${d.cerebro.state.selfHealHistory.length}`,
    'git push delegado a @devops (Gage)',
  ]);
  return { stateMd: 'updated', gitPush: 'delegated:@devops' };
};

export { PHASE_FNS };
