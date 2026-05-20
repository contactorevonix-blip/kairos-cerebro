'use strict';

/**
 * KAIROS HYPERDRIVE — Configuração Global
 * Lida automaticamente por orchestrator, cli, providers.
 * Override via variáveis de ambiente KAIROS_*.
 */

const HYPERDRIVE_CONFIG = {
  // Modo autónomo: zero confirmações, auto-fix, auto-retry
  autonomous: process.env.KAIROS_AUTONOMOUS !== '0',

  // Auto-limpeza de ficheiros temporários após cada task
  autoCleanup: process.env.KAIROS_AUTO_CLEANUP !== '0',

  // Número máximo de retentativas automáticas em caso de falha
  maxRetries: Number(process.env.KAIROS_MAX_RETRIES || 3),

  // Commit automático após fase completada (só com KAIROS_LIVE=1)
  autoCommit: process.env.KAIROS_AUTO_COMMIT === '1',

  // Output style: 'verbose' | 'summary-only'
  reportStyle: process.env.KAIROS_REPORT_STYLE || 'summary-only',

  // Threshold mínimo de confiança do agente para execução directa (sem consenso)
  minConfidenceForDirect: Number(process.env.KAIROS_MIN_CONFIDENCE || 0.4),

  // Max tokens para respostas de execução (aumentado para tasks complexas)
  maxTokensExecution: Number(process.env.KAIROS_MAX_TOKENS || 8192),

  // Max iterações do tool loop antes de forçar end_turn
  maxToolIterations: Number(process.env.KAIROS_MAX_TOOL_ITER || 20),
};

module.exports = { HYPERDRIVE_CONFIG };
