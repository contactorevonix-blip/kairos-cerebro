/**
 * Phase 1: INTAKE — Collect user intent
 * Extracts single statement, classifies intent, scores clarity
 */

class Phase1Intake {
  async execute(userStatement) {
    if (!userStatement || typeof userStatement !== 'string' || userStatement.trim() === '') {
      throw new Error('INTAKE requires non-empty statement');
    }

    const statement = userStatement.trim();
    return {
      statement,
      intent_type: this.classify(statement),
      clarity_score: this.scoreClarity(statement),
      statement_length: statement.length,
      collected_at: new Date().toISOString()
    };
  }

  classify(statement) {
    const lowerCase = statement.toLowerCase();

    if (lowerCase.includes('create') || lowerCase.includes('new')) return 'creation';
    if (lowerCase.includes('fix') || lowerCase.includes('bug') || lowerCase.includes('issue')) return 'bugfix';
    if (lowerCase.includes('implement') || lowerCase.includes('build') || lowerCase.includes('develop')) return 'implementation';
    if (lowerCase.includes('review') || lowerCase.includes('check') || lowerCase.includes('audit')) return 'review';
    if (lowerCase.includes('refactor') || lowerCase.includes('optimize')) return 'refactor';
    if (lowerCase.includes('test')) return 'testing';

    return 'general';
  }

  scoreClarity(statement) {
    let score = 0.5;

    // Length scoring
    if (statement.length < 10) score -= 0.2;
    else if (statement.length > 200) score += 0.1;
    else if (statement.length > 50) score += 0.15;

    // Specificity signals
    if (statement.includes('?')) score -= 0.1; // questions reduce clarity
    if (/\b(specific|exactly|precisely)\b/i.test(statement)) score += 0.1;
    if (/\b(maybe|perhaps|probably|possibly)\b/i.test(statement)) score -= 0.1;

    // Structure signals
    const sentences = statement.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 3) score += 0.1;

    return Math.min(Math.max(score, 0), 1.0);
  }
}

module.exports = Phase1Intake;
