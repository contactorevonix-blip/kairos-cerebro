#!/usr/bin/env node
'use strict';

/**
 * blocker-resolver.js — Story 8.4.4
 *
 * Detects story blockers and suggests workarounds or parallel tracks.
 * Helps teams find alternative paths forward.
 */

const fs = require('fs');
const path = require('path');

const RESOLUTIONS_LOG = '.aiox/blocker-resolutions.jsonl';

function ensureLogsDir() {
  const dir = path.dirname(RESOLUTIONS_LOG);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function logResolution(data) {
  ensureLogsDir();
  const entry = {
    timestamp: new Date().toISOString(),
    storyId: data.storyId,
    blockerType: data.blockerType,
    blockerStoryId: data.blockerStoryId,
    resolution: data.resolution,
    escalated: data.escalated || false,
  };
  try {
    fs.appendFileSync(RESOLUTIONS_LOG, JSON.stringify(entry) + '\n', 'utf8');
  } catch {
    // Graceful: log failures don't block resolution
  }
}

function detectBlockers(storyId, story, allStories = []) {
  const blockers = [];

  if (!story || !allStories) return blockers;

  const dependencies = story.dependencies || [];

  dependencies.forEach((depId) => {
    const depStory = allStories.find((s) => s.id === depId);

    if (!depStory) {
      blockers.push({
        type: 'dependency_not_found',
        blockerStoryId: depId,
        description: `Dependency story ${depId} not found`,
        severity: 'critical',
      });
    } else if (depStory.status !== 'Done') {
      blockers.push({
        type: 'dependency_not_done',
        blockerStoryId: depId,
        description: `Dependency ${depId} status is ${depStory.status} (not Done)`,
        severity: 'high',
        blockerStatus: depStory.status,
      });
    }
  });

  // Detect circular dependencies
  const circular = detectCircular(storyId, allStories);
  if (circular.length > 0) {
    blockers.push({
      type: 'circular_dependency',
      blockerStoryIds: circular,
      description: `Circular dependency detected: ${circular.join(' → ')}`,
      severity: 'critical',
    });
  }

  return blockers;
}

function detectCircular(storyId, allStories, visited = new Set()) {
  if (visited.has(storyId)) return [storyId];
  visited.add(storyId);

  const story = allStories.find((s) => s.id === storyId);
  if (!story || !story.dependencies) return [];

  for (const dep of story.dependencies) {
    const circular = detectCircular(dep, allStories, visited);
    if (circular.length > 0) return circular;
  }

  visited.delete(storyId);
  return [];
}

function generateWorkarounds(blocker, storyId) {
  const workarounds = [];

  if (blocker.type === 'dependency_not_done') {
    workarounds.push({
      rank: 1,
      title: 'Work in parallel',
      description: `Begin work on ${storyId} while waiting for ${blocker.blockerStoryId}`,
      feasibility: 'high',
      riskLevel: 'medium',
      effort: 'low',
    });
    workarounds.push({
      rank: 2,
      title: 'Create stub/mock',
      description: `Create mock implementation of ${blocker.blockerStoryId} for testing`,
      feasibility: 'high',
      riskLevel: 'high',
      effort: 'medium',
    });
    workarounds.push({
      rank: 3,
      title: 'Split story',
      description: `Split ${storyId} into independent chunks, postpone dependency-reliant parts`,
      feasibility: 'medium',
      riskLevel: 'low',
      effort: 'high',
    });
  }

  if (blocker.type === 'circular_dependency') {
    workarounds.push({
      rank: 1,
      title: 'Break circle',
      description: 'Identify and remove one dependency link to break the cycle',
      feasibility: 'medium',
      riskLevel: 'medium',
      effort: 'high',
    });
    workarounds.push({
      rank: 2,
      title: 'Escalate to @aiox-master',
      description: 'Request architectural review to resolve circular dependency',
      feasibility: 'high',
      riskLevel: 'low',
      effort: 'low',
    });
  }

  return workarounds;
}

function estimateResolutionTime(blocker, allStories = []) {
  if (blocker.type === 'dependency_not_done' && blocker.blockerStoryId) {
    const blockerStory = allStories.find((s) => s.id === blocker.blockerStoryId);
    if (blockerStory && blockerStory.estimatedDaysToCompletion) {
      return blockerStory.estimatedDaysToCompletion;
    }
  }
  return null;
}

function checkBlockers(storyId, story, allStories = []) {
  const blockers = detectBlockers(storyId, story, allStories);

  if (blockers.length === 0) {
    return {
      storyId,
      blocked: false,
      blockers: [],
      workarounds: [],
    };
  }

  // Generate workarounds for each blocker
  const allWorkarounds = [];
  blockers.forEach((blocker) => {
    const workarounds = generateWorkarounds(blocker, storyId);
    allWorkarounds.push(...workarounds);
  });

  // Sort by rank and remove duplicates
  const uniqueWorkarounds = Array.from(
    new Map(
      allWorkarounds.map((w) => [
        w.title,
        { ...w, rank: Math.min(...allWorkarounds.filter((x) => x.title === w.title).map((x) => x.rank)) },
      ])
    ).values()
  ).sort((a, b) => a.rank - b.rank);

  return {
    storyId,
    blocked: true,
    blockers,
    workarounds: uniqueWorkarounds.slice(0, 5), // Top 5
    estimatedResolutionDays: blockers
      .map((b) => estimateResolutionTime(b, allStories))
      .filter((d) => d !== null)[0] || null,
  };
}

function resolveBlocker(storyId, selectedWorkaround, allStories = []) {
  const resolution = {
    storyId,
    chosenWorkaround: selectedWorkaround.title,
    timestamp: new Date().toISOString(),
  };

  logResolution({
    storyId,
    blockerType: 'user_resolution',
    resolution: selectedWorkaround.title,
  });

  return resolution;
}

function escalateBlocker(storyId, blockers) {
  blockers.forEach((blocker) => {
    logResolution({
      storyId,
      blockerType: blocker.type,
      blockerStoryId: blocker.blockerStoryId,
      resolution: 'escalated_to_master',
      escalated: true,
    });
  });

  return {
    storyId,
    escalated: true,
    message: 'Blocker escalated to @aiox-master for review',
    blockers,
  };
}

module.exports = {
  checkBlockers,
  detectBlockers,
  generateWorkarounds,
  estimateResolutionTime,
  resolveBlocker,
  escalateBlocker,
  detectCircular,
};
