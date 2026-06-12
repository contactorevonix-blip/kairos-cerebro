#!/usr/bin/env node
'use strict';

/**
 * story-validator.js — Story 8.4.2
 *
 * Detects story issues (vague AC, scope creep, missing dependencies, complexity mismatch)
 * and suggests structured improvements.
 */

function analyzeAC(acText) {
  const clauses = (acText.match(/Given|When|Then/gi) || []).length;
  return {
    clauses,
    isVague: clauses < 3,
  };
}

function detectScopeCreep(story) {
  const acCount = (story.acceptanceCriteria || []).length;
  return {
    count: acCount,
    isCreep: acCount > 10,
  };
}

function validateDependencies(story, allStories = []) {
  const missing = [];
  const deps = story.dependencies || [];
  deps.forEach((dep) => {
    if (!allStories.some((s) => s.id === dep)) {
      missing.push(dep);
    }
  });
  return {
    missing,
    hasMissing: missing.length > 0,
  };
}

function complexityMismatch(story) {
  const acCount = (story.acceptanceCriteria || []).length;
  const storyPoints = story.storyPoints || 0;
  const expectedPointsPerAC = storyPoints / (acCount || 1);
  return {
    acCount,
    storyPoints,
    pointsPerAC: expectedPointsPerAC,
    isMismatch: acCount > 5 && storyPoints < 5,
  };
}

function generateSuggestions(story, allStories = []) {
  const suggestions = [];

  // Check for vague AC
  const acAnalysis = analyzeAC(story.acceptanceCriteria?.join(' ') || '');
  if (acAnalysis.isVague) {
    suggestions.push({
      type: 'vague_ac',
      severity: 'medium',
      message: `AC structure unclear (${acAnalysis.clauses} clause(s) found, <3 expected)`,
      recommendation:
        'Use Given/When/Then format for each AC. Example: Given <precondition> When <action> Then <outcome>',
    });
  }

  // Check for scope creep
  const scopeAnalysis = detectScopeCreep(story);
  if (scopeAnalysis.isCreep) {
    suggestions.push({
      type: 'scope_creep',
      severity: 'high',
      message: `Story has ${scopeAnalysis.count} AC items (>10 threshold)`,
      recommendation:
        'Consider splitting into multiple stories. Each story should have 3-8 AC for clarity.',
    });
  }

  // Check for missing dependencies
  const depAnalysis = validateDependencies(story, allStories);
  if (depAnalysis.hasMissing) {
    suggestions.push({
      type: 'missing_dependencies',
      severity: 'high',
      message: `Dependencies not found: ${depAnalysis.missing.join(', ')}`,
      recommendation: 'Verify dependency IDs or create referenced stories first.',
    });
  }

  // Check for complexity mismatch
  const complexity = complexityMismatch(story);
  if (complexity.isMismatch) {
    suggestions.push({
      type: 'complexity_mismatch',
      severity: 'medium',
      message: `High AC count (${complexity.acCount}) but low story points (${complexity.storyPoints})`,
      recommendation: `Consider increasing story points to ${complexity.acCount * 1.5} or reducing AC`,
    });
  }

  return suggestions;
}

function refineStory(story, suggestions) {
  const refined = JSON.parse(JSON.stringify(story));
  refined.healingSuggestions = suggestions;

  // Auto-structure AC if vague
  const vagueAC = suggestions.find((s) => s.type === 'vague_ac');
  if (vagueAC && refined.acceptanceCriteria?.length > 0) {
    refined.acceptanceCriteria = refined.acceptanceCriteria.map((ac) => {
      if (!ac.includes('Given') && !ac.includes('When') && !ac.includes('Then')) {
        return `Given context When action Then outcome — ${ac}`;
      }
      return ac;
    });
  }

  return refined;
}

function validateStoryWithHealing(story, allStories = []) {
  const suggestions = generateSuggestions(story, allStories);
  const refined = refineStory(story, suggestions);

  return {
    storyId: story.id,
    suggestions,
    refined_story: refined,
    isApproved: suggestions.filter((s) => s.severity === 'high').length === 0,
  };
}

module.exports = {
  validateStoryWithHealing,
  generateSuggestions,
  refineStory,
  analyzeAC,
  detectScopeCreep,
  validateDependencies,
  complexityMismatch,
};
