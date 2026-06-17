const fs = require('fs');
const path = require('path');

class LayerValidator {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  validateCoverage(loadedLayers) {
    const expectedLayers = [
      'constitution',
      'global-rules',
      'agent-layer',
      'workflow-layer',
      'task-layer',
      'squad-layer',
      'keyword-layer',
      'star-command-layer'
    ];

    const missing = expectedLayers.filter(layer => !loadedLayers.has(layer));
    const unexpected = Array.from(loadedLayers.keys()).filter(layer => !expectedLayers.includes(layer));

    return {
      valid: missing.length === 0,
      expectedLayers: expectedLayers.length,
      loadedLayers: loadedLayers.size,
      missing,
      unexpected,
      coverage: (loadedLayers.size / expectedLayers.length * 100).toFixed(1) + '%'
    };
  }

  validateAtomicity(transaction) {
    if (!transaction) return { valid: false, error: 'No transaction data' };

    return {
      valid: transaction.status === 'committed',
      status: transaction.status,
      loadedCount: transaction.loadedLayers?.size || 0
    };
  }

  validateConstitution(constitutionContent) {
    const articles = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const patterns = articles.map(art => new RegExp(`Article\\s+${art}|Art\\.\\s*${art}`, 'i'));

    const found = patterns.filter(pattern => pattern.test(constitutionContent)).length;

    return {
      valid: found >= 7,
      articlesFound: found,
      expectedArticles: 7
    };
  }

  validateGlobalRules(rulesContent) {
    const requiredRules = [
      'agent-authority',
      'workflow-execution',
      'ids-principles'
    ];

    const found = requiredRules.filter(rule =>
      Object.keys(rulesContent).some(key => key.includes(rule))
    );

    return {
      valid: found.length >= 3,
      rulesFound: found,
      expectedRules: requiredRules
    };
  }

  validatePerformance(startTime, endTime) {
    const duration = endTime - startTime;
    const coldStartTarget = 2000;

    return {
      durationMs: duration,
      coldStartOk: duration < coldStartTarget,
      target: `<${coldStartTarget}ms`,
      actual: `${duration}ms`
    };
  }
}

module.exports = LayerValidator;
