#!/usr/bin/env node
'use strict';

/**
 * coderabbit-circuit-breaker.js — Story 8.4.1
 *
 * Tracks CodeRabbit auto-fix iterations and halts after 3 consecutive failures.
 * Prevents semantic drift from repeated failed fix attempts.
 */

const fs = require('fs');
const path = require('path');

const ITERATIONS_LOG = '.aiox/gate-logs/coderabbit-iterations.jsonl';
const FAILURE_THRESHOLD = 3;

function ensureLogsDir() {
  const dir = path.dirname(ITERATIONS_LOG);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function logIteration(data) {
  ensureLogsDir();
  const entry = {
    timestamp: new Date().toISOString(),
    iteration: data.iteration,
    storyId: data.storyId,
    phase: data.phase, // 'dev' | 'qa'
    severity: data.severity,
    result: data.result, // 'fixed' | 'failed' | 'halted'
    reason: data.reason,
  };
  const line = JSON.stringify(entry) + '\n';
  try {
    fs.appendFileSync(ITERATIONS_LOG, line, 'utf8');
  } catch (err) {
    // Graceful: log failures don't block development
  }
}

function getConsecutiveFailures(storyId, phase, severityFilter) {
  if (!fs.existsSync(ITERATIONS_LOG)) return 0;

  try {
    const content = fs.readFileSync(ITERATIONS_LOG, 'utf8');
    const lines = content.trim().split('\n');
    let failureCount = 0;

    // Count recent failures in reverse order (most recent first)
    for (let i = lines.length - 1; i >= 0; i--) {
      const entry = JSON.parse(lines[i]);
      if (
        entry.storyId === storyId &&
        entry.phase === phase &&
        severityFilter.includes(entry.severity)
      ) {
        if (entry.result === 'failed') {
          failureCount++;
        } else {
          break; // Stop counting when we hit a non-failure
        }
      }
    }
    return failureCount;
  } catch {
    return 0;
  }
}

class CircuitBreaker {
  constructor(storyId, phase = 'dev', severityFilter = ['CRITICAL', 'HIGH']) {
    this.storyId = storyId;
    this.phase = phase;
    this.severityFilter = severityFilter;
    this.iteration = 0;
    this.isOpen = false;
  }

  recordAttempt(severity, result, reason) {
    this.iteration++;
    logIteration({
      iteration: this.iteration,
      storyId: this.storyId,
      phase: this.phase,
      severity,
      result,
      reason,
    });

    // Check if we should open the circuit
    if (result === 'failed') {
      const consecutiveFailures = getConsecutiveFailures(
        this.storyId,
        this.phase,
        this.severityFilter
      );
      if (consecutiveFailures >= FAILURE_THRESHOLD) {
        this.isOpen = true;
        logIteration({
          iteration: this.iteration + 1,
          storyId: this.storyId,
          phase: this.phase,
          severity: 'CRITICAL',
          result: 'halted',
          reason: `Circuit breaker opened after ${FAILURE_THRESHOLD} consecutive failures`,
        });
      }
    }
  }

  shouldHalt() {
    return this.isOpen;
  }

  getStatus() {
    return {
      storyId: this.storyId,
      phase: this.phase,
      iteration: this.iteration,
      isOpen: this.isOpen,
      consecutiveFailures: getConsecutiveFailures(
        this.storyId,
        this.phase,
        this.severityFilter
      ),
    };
  }
}

module.exports = {
  CircuitBreaker,
  logIteration,
  getConsecutiveFailures,
  FAILURE_THRESHOLD,
};
