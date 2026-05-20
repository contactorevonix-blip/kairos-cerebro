'use strict';

/**
 * HYPERDRIVE — Quality Gates
 * Validação multi-dimensional antes de qualquer handoff ou deploy.
 *
 * Dimensões:
 *   - functional   (testes passam)
 *   - quality      (código sem issues críticos)
 *   - performance  (dentro de SLAs)
 *   - security     (sem vulnerabilidades abertas)
 *   - completeness (deliverable completo)
 */

const GATES = {
  code: {
    dimensions: ['functional', 'quality', 'security'],
    thresholds: {
      functional:  { min: 1.0,  weight: 0.45 }, // 100% testes PASS
      quality:     { min: 8.0,  weight: 0.35 }, // score /10
      security:    { min: 0,    weight: 0.20 }, // 0 vulnerabilidades críticas
    },
    min_overall: 8.5,
  },
  api: {
    dimensions: ['functional', 'performance', 'security'],
    thresholds: {
      functional:  { min: 1.0,  weight: 0.40 },
      performance: { min: 90,   weight: 0.35 }, // Lighthouse ou P95ms score
      security:    { min: 0,    weight: 0.25 },
    },
    min_overall: 8.5,
  },
  design: {
    dimensions: ['functional', 'quality', 'accessibility'],
    thresholds: {
      functional:    { min: 1.0, weight: 0.35 },
      quality:       { min: 8.5, weight: 0.40 },
      accessibility: { min: 0,   weight: 0.25 }, // 0 WCAG violations
    },
    min_overall: 8.0,
  },
  docs: {
    dimensions: ['completeness', 'quality'],
    thresholds: {
      completeness: { min: 1.0, weight: 0.50 },
      quality:      { min: 7.5, weight: 0.50 },
    },
    min_overall: 7.5,
  },
};

class QualityGates {
  /**
   * Avalia um deliverable contra o gate do seu tipo.
   * @param {object} result - { testsPassed, testsTotal, qualityScore, securityVulns, performanceScore, accessibilityViolations }
   * @param {string} gateType - 'code' | 'api' | 'design' | 'docs'
   * @returns {{ pass: boolean, score: number, dimensions: object, issues: string[] }}
   */
  evaluate(result, gateType = 'code') {
    const gate = GATES[gateType] || GATES.code;
    const issues = [];
    const dimensions = {};

    // Functional: testes passam
    if (gate.dimensions.includes('functional')) {
      const ratio = result.testsTotal > 0
        ? result.testsPassed / result.testsTotal
        : (result.testsPassed === undefined ? 0.5 : 1.0);
      dimensions.functional = { score: ratio, threshold: gate.thresholds.functional.min };
      if (ratio < gate.thresholds.functional.min) {
        issues.push(`Functional: ${result.testsPassed}/${result.testsTotal} testes passam (${(ratio * 100).toFixed(0)}%, mínimo 100%)`);
      }
    }

    // Quality score
    if (gate.dimensions.includes('quality')) {
      const score = result.qualityScore ?? 7.0;
      dimensions.quality = { score, threshold: gate.thresholds.quality.min };
      if (score < gate.thresholds.quality.min) {
        issues.push(`Quality: score ${score}/10 < mínimo ${gate.thresholds.quality.min}`);
      }
    }

    // Security
    if (gate.dimensions.includes('security')) {
      const vulns = result.securityVulns ?? 0;
      dimensions.security = { score: vulns === 0 ? 1 : 0, vulns, threshold: 0 };
      if (vulns > 0) {
        issues.push(`Security: ${vulns} vulnerabilidade(s) crítica(s)`);
      }
    }

    // Performance
    if (gate.dimensions.includes('performance')) {
      const perf = result.performanceScore ?? 100;
      dimensions.performance = { score: perf, threshold: gate.thresholds.performance.min };
      if (perf < gate.thresholds.performance.min) {
        issues.push(`Performance: score ${perf} < mínimo ${gate.thresholds.performance.min}`);
      }
    }

    // Accessibility
    if (gate.dimensions.includes('accessibility')) {
      const violations = result.accessibilityViolations ?? 0;
      dimensions.accessibility = { score: violations === 0 ? 1 : 0, violations, threshold: 0 };
      if (violations > 0) {
        issues.push(`Accessibility: ${violations} WCAG violation(s)`);
      }
    }

    // Completeness
    if (gate.dimensions.includes('completeness')) {
      const comp = result.completeness ?? 1.0;
      dimensions.completeness = { score: comp, threshold: gate.thresholds.completeness.min };
      if (comp < gate.thresholds.completeness.min) {
        issues.push(`Completeness: ${(comp * 100).toFixed(0)}% < 100%`);
      }
    }

    // Overall weighted score (normalizado para 0-10)
    let weightedSum = 0;
    let weightTotal = 0;
    for (const [dim, info] of Object.entries(dimensions)) {
      const weight = gate.thresholds[dim]?.weight || 0.2;
      const normalised = Math.min(1, info.score / (info.threshold > 0 ? info.threshold : 1));
      weightedSum  += normalised * weight * 10;
      weightTotal  += weight;
    }
    const overall = weightTotal > 0 ? weightedSum / weightTotal : 5;

    return {
      pass:       issues.length === 0 && overall >= gate.min_overall,
      score:      Math.round(overall * 10) / 10,
      threshold:  gate.min_overall,
      dimensions,
      issues,
      gateType,
    };
  }

  /**
   * Gate rápido para código: só verifica se testes passam e sem vulns críticas.
   */
  quickCheck(testsPassed, testsTotal, criticalVulns = 0) {
    const allPass = testsPassed === testsTotal && testsTotal > 0;
    const safe    = criticalVulns === 0;
    return {
      pass:   allPass && safe,
      issues: [
        ...(allPass ? [] : [`${testsTotal - testsPassed} tests FAILING`]),
        ...(safe    ? [] : [`${criticalVulns} critical vulnerabilities`]),
      ],
    };
  }
}

module.exports = { QualityGates, GATES };
