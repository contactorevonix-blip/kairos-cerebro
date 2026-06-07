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
 */
function writeMetrics(metricsPath, metrics, agentId) {
  try {
    const updated = {
      ...metrics,
      session: {
        ...metrics.session,
        active_agent: {
          id: agentId,
          activated_at: new Date().toISOString(),
        },
      },
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

/** Main hook execution */
async function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');

  return new Promise((resolve) => {
    process.stdin.on('data', (chunk) => { raw += chunk; });
    process.stdin.on('end', () => {
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

          // Escreve com novo agente ativo
          writeMetrics(metricsPath, metrics, activeAgent);

          // Log para debug (silent — não afecta stdout)
          // console.error(`[agent-activation-tracker] Detectado agente: ${activeAgent}`);
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

module.exports = { detectActiveAgent, readMetrics, writeMetrics, main };
