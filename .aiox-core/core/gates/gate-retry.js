#!/usr/bin/env node
'use strict';

/**
 * gate-retry.js — Story 8.4.3
 *
 * Implements exponential backoff retry logic for transient gate failures.
 * Distinguishes transient (timeout, network, lock) from persistent (validation) errors.
 */

const fs = require('fs');
const path = require('path');

const RETRIES_LOG = '.aiox/gate-logs/art-gates-retries.jsonl';

function ensureLogsDir() {
  const dir = path.dirname(RETRIES_LOG);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function logRetry(data) {
  ensureLogsDir();
  const entry = {
    timestamp: new Date().toISOString(),
    gateName: data.gateName,
    attemptNumber: data.attemptNumber,
    reason: data.reason,
    outcome: data.outcome, // 'success' | 'failed_transient' | 'failed_persistent'
    waitMs: data.waitMs,
  };
  try {
    fs.appendFileSync(RETRIES_LOG, JSON.stringify(entry) + '\n', 'utf8');
  } catch {
    // Graceful: log failures don't block gates
  }
}

function classifyFailure(error) {
  const message = String(error.message || error).toLowerCase();

  // Transient failures
  if (
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('eagain') ||
    message.includes('locked')
  ) {
    return 'transient';
  }

  // Persistent failures
  if (
    message.includes('validation') ||
    message.includes('not found') ||
    message.includes('missing') ||
    message.includes('invalid')
  ) {
    return 'persistent';
  }

  // Default to transient (conservative: retry by default)
  return 'transient';
}

function calculateBackoff(attemptNumber) {
  // Exponential backoff: 1s, 2s, 4s
  const base = Math.pow(2, attemptNumber - 1);
  return Math.min(base * 1000, 4000); // Cap at 4 seconds
}

async function retryGateWithBackoff(
  gateFn,
  gateName,
  maxAttempts = 3,
  abortSignal = null
) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await gateFn();
      if (attempt > 1) {
        logRetry({
          gateName,
          attemptNumber: attempt,
          reason: 'Retry succeeded',
          outcome: 'success',
          waitMs: 0,
        });
      }
      return { success: true, result };
    } catch (error) {
      lastError = error;
      const classification = classifyFailure(error);

      // If persistent, fail immediately
      if (classification === 'persistent') {
        logRetry({
          gateName,
          attemptNumber: attempt,
          reason: `Persistent error: ${error.message}`,
          outcome: 'failed_persistent',
          waitMs: 0,
        });
        return { success: false, error, persistent: true };
      }

      // If transient and not last attempt, retry with backoff
      if (attempt < maxAttempts) {
        const waitMs = calculateBackoff(attempt);
        logRetry({
          gateName,
          attemptNumber: attempt,
          reason: `Transient error: ${error.message}`,
          outcome: 'failed_transient',
          waitMs,
        });

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, waitMs));

        // Check abort signal
        if (abortSignal?.aborted) {
          return { success: false, error, aborted: true };
        }
      } else {
        // Last attempt failed
        logRetry({
          gateName,
          attemptNumber: attempt,
          reason: `Final attempt failed: ${error.message}`,
          outcome: 'failed_transient',
          waitMs: 0,
        });
      }
    }
  }

  return { success: false, error: lastError };
}

module.exports = {
  retryGateWithBackoff,
  classifyFailure,
  calculateBackoff,
  logRetry,
};
