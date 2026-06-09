#!/usr/bin/env node
'use strict';

/**
 * agent-activation-tracker.cjs
 *
 * Rastreia quando um agente é ativado (@agent invocação) e popula
 * session.active_agent.id em hook-metrics.json para permitir que
 * SYNAPSE Layers 2-7 carregues com as regras corretas.
 *
 * Fluxo:
 * 1. Lê stdin (hook input com session + prompt)
 * 2. Detecta se há um agente ativo no prompt (@sm, @dev, @qa, etc.)
 * 3. Popula hook-metrics.json com session.active_agent.id
 * 4. SYNAPSE engine (próximo na cadeia) lê isto e carrega L2+ layers
 *
 * Nunca bloqueia — graceful degradation em caso de erro.
 */

const fs = require('fs');
const path = require('path');

/** Agentes conhecidos do AIOX */
const KNOWN_AGENTS = [
  'sm', 'dev', 'qa', 'architect', 'pm', 'po', 'analyst',
  'data-engineer', 'ux-design-expert', 'devops', 'aiox-master',
  'business-chief', 'claude-mastery-chief'
];

/** Padrão para detectar invocação de agente: @agent ou /AIOX:agents:agent */
const AGENT_ACTIVATION_PATTERN = /(?:@|\/AIOX:agents:)([a-z\-]+)/g;

/**
 * Detecta agentes ativados no prompt do utilizador.
 * @param {string} prompt - User message
 * @returns {string|null} Agent ID se detectado, null caso contrário
 */
function detectActiveAgent(prompt) {
  if (!prompt) return null;

  // Reset lastIndex: regex has the global flag, so state persists between calls.
  AGENT_ACTIVATION_PATTERN.lastIndex = 0;

  let match;
  while ((match = AGENT_ACTIVATION_PATTERN.exec(prompt)) !== null) {
    const agentId = match[1];
    if (KNOWN_AGENTS.includes(agentId)) {
      return agentId;
    }
  }
  return null;
}

/**
 * Lê hook-metrics.json do sistema.
 * @param {string} metricsPath - Path to hook-metrics.json
 * @returns {object} Parsed metrics ou {}
 */
function readMetrics(metricsPath) {
  try {
    if (fs.existsSync(metricsPath)) {
      const content = fs.readFileSync(metricsPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (_) {
    // Falha silenciosa — criar novo
  }
  return {};
}

/**
 * Escreve hook-metrics.json com nova informação de agente.
 * @param {string} metricsPath - Path to hook-metrics.json
 * @param {object} metrics - Current metrics
 * @param {string} agentId - Active agent ID
 * @param {object|null} contextState - Optional Phases 1-4 context state to merge into session
 */
function writeMetrics(metricsPath, metrics, agentId, contextState = null) {
  try {
    const session = {
      ...metrics.session,
      active_agent: {
        id: agentId,
        activated_at: new Date().toISOString(),
      },
    };
    if (contextState) {
      session.context_state = contextState;
    }
    const updated = {
      ...metrics,
      session,
      timestamp: new Date().toISOString(),
    };
    const dir = path.dirname(metricsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(metricsPath, JSON.stringify(updated, null, 2), 'utf8');
  } catch (_) {
    // Falha silenciosa — nunca bloqueia
  }
}

// ===========================================================================
// Auto-Contextualization Hook (Story 5.3.2)
//
// Quando um agente é detectado, corre as Phases 1-4 do ContextEngine
// (INTAKE → GAP-ANALYSIS → CONTEXT-COMPLETION → VALIDATION) de forma silenciosa
// e inline. O resultado é gravado em session.context_state. Nunca bloqueia a
// activação do agente: timeout de ~2s + degradação graceful em qualquer erro.
// ===========================================================================

/** Budget máximo para as Phases 1-4 (ms) — alvo AC3 (<2s). */
const CONTEXT_PHASES_TIMEOUT_MS = 2000;

/** Sentinela retornado quando o budget de tempo expira. */
const CONTEXT_TIMEOUT = Symbol('context-timeout');

/**
 * Caminho do log de degradação graceful do engine.
 * @param {string} cwd
 * @returns {string}
 */
function contextLogPath(cwd) {
  return path.join(cwd, '.aiox', 'context-engine.log');
}

/**
 * Append silencioso ao log do engine. Nunca lança.
 * @param {string} cwd
 * @param {string} message
 */
function logContextEngine(cwd, message) {
  try {
    const logFile = contextLogPath(cwd);
    const dir = path.dirname(logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
  } catch (_) {
    // Falha silenciosa — log nunca bloqueia
  }
}

/**
 * Corre as Phases 1-4 do ContextEngine sequencialmente.
 *
 * O engine usa console.log internamente; silenciamos console durante a execução
 * para preservar o contrato de stdout do hook ({} apenas). Restauramos no fim.
 *
 * @param {string} userStatement - prompt do utilizador (intake statement)
 * @param {string} cwd - working directory (resolução de paths do engine)
 * @returns {Promise<object>} { phase_4_passed, completed_at, intent_type, completeness, gaps_detected }
 */
async function runContextPhases1To4(userStatement, cwd) {
  // Silenciar console para não poluir stdout/stderr do hook (AC4)
  const origLog = console.log;
  const origError = console.error;
  console.log = () => {};
  console.error = () => {};

  try {
    // require lazy: só quando há agente activo (não penaliza o caminho comum)
    // eslint-disable-next-line global-require
    const ContextEngine = require(path.join(cwd, '.synapse', 'context-engine', 'engine.js'));
    const engine = new ContextEngine();

    const intent = await engine.phase1_intake(userStatement);
    const gapAnalysis = await engine.phase2_gapAnalysis(intent);
    const contextResult = await engine.phase3_contextCompletion(gapAnalysis.gaps);
    const validation = await engine.phase4_validation(contextResult.context);

    return {
      phase_4_passed: validation.passed === true,
      completed_at: new Date().toISOString(),
      intent_type: intent.intent_type,
      completeness: contextResult.completeness,
      gaps_detected: (gapAnalysis.gaps || []).map((g) => g.source),
    };
  } finally {
    console.log = origLog;
    console.error = origError;
  }
}

/**
 * Executa as Phases 1-4 com timeout e degradação graceful.
 * Nunca lança: em timeout ou erro, regista no log e devolve null.
 *
 * @param {string} userStatement
 * @param {string} cwd
 * @returns {Promise<object|null>} context_state ou null (degradação)
 */
async function runContextPhasesGuarded(userStatement, cwd) {
  if (!userStatement || typeof userStatement !== 'string') {
    return null;
  }

  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(CONTEXT_TIMEOUT), CONTEXT_PHASES_TIMEOUT_MS);
    if (timer && typeof timer.unref === 'function') timer.unref();
  });

  try {
    const result = await Promise.race([
      runContextPhases1To4(userStatement, cwd),
      timeout,
    ]);

    if (result === CONTEXT_TIMEOUT) {
      logContextEngine(cwd, `TIMEOUT: Phases 1-4 exceeded ${CONTEXT_PHASES_TIMEOUT_MS}ms — graceful degradation (agent not blocked)`);
      return null;
    }
    return result;
  } catch (err) {
    logContextEngine(cwd, `ERROR: Phases 1-4 failed (${err && err.message}) — graceful degradation (agent not blocked)`);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Main hook execution */
async function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');

  return new Promise((resolve) => {
    process.stdin.on('data', (chunk) => { raw += chunk; });
    process.stdin.on('end', async () => {
      try {
        const event = JSON.parse(raw || '{}');
        const prompt = event.message || event.user_message || '';

        // Detecta agente ativo
        const activeAgent = detectActiveAgent(prompt);

        if (activeAgent) {
          // Resolve paths
          const cwd = process.cwd();
          const metricsPath = path.join(cwd, '.synapse', 'metrics', 'hook-metrics.json');

          // Lê metrics atuais
          const metrics = readMetrics(metricsPath);

          // Auto-Contextualization (Story 5.3.2): corre Phases 1-4 inline,
          // com timeout + degradação graceful. Nunca bloqueia o agente.
          // Em timeout/erro, contextState é null e a activação prossegue.
          const contextState = await runContextPhasesGuarded(prompt, cwd);

          // Escreve com novo agente ativo + context_state (se disponível)
          writeMetrics(metricsPath, metrics, activeAgent, contextState);
        }

        // Output vazio — não injeta nada no sistema prompt
        // Apenas side-effect de actualizar hook-metrics.json
        process.stdout.write('{}');
      } catch (_) {
        // Falha silenciosa
        process.stdout.write('{}');
      }

      resolve();
    });
  });
}

/** Run with timeout protection */
function run() {
  const timer = setTimeout(() => {
    process.exit(0);
  }, 3000); // 3s timeout

  timer.unref();

  main()
    .then(() => {
      clearTimeout(timer);
      process.exitCode = 0;
    })
    .catch(() => {
      clearTimeout(timer);
      process.exitCode = 0;
    });
}

if (require.main === module) {
  run();
}

module.exports = {
  detectActiveAgent,
  readMetrics,
  writeMetrics,
  runContextPhases1To4,
  runContextPhasesGuarded,
  CONTEXT_PHASES_TIMEOUT_MS,
  main,
};
