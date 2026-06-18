#!/usr/bin/env node
'use strict';

/**
 * gate-framework.cjs — Constitutional Enforcement Gate Framework (Story 9.1)
 *
 * Meta-runner for Constitutional Enforcement Gates (Articles I-VII).
 * Loads gate modules dynamically, executes them, collects verdicts,
 * and ensures no gate crashes the PreToolUse hook layer.
 *
 * Dependency-free (Node core only) for freshly installed AIOX.
 * NEVER throws — all errors degrade gracefully.
 *
 * Gates registered (Story 9.2-9.5 implementations):
 *   - enforce-agent-authority.cjs (Art. II)
 *   - enforce-story-driven.cjs (Art. III)
 *   - enforce-no-invention.cjs (Art. IV)
 *   - enforce-quality-gates.cjs (Art. V-VII)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const GATES = [
  { name: 'enforce-agent-authority', article: 'II', priority: 1 },
  { name: 'enforce-story-driven', article: 'III', priority: 2 },
  { name: 'enforce-no-invention', article: 'IV', priority: 3 },
  { name: 'enforce-quality-gates', article: 'V-VII', priority: 4 },
];

/**
 * Read stdin synchronously. Returns empty string on failure.
 */
function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

/**
 * Execute a gate hook synchronously as a child process.
 * Returns null on timeout, error, or non-zero exit.
 * Captures stderr for gate's own error messages.
 */
function executeGate(gateFile, stdinData, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(null);
    }, timeoutMs);

    try {
      const gateAbsPath = path.join(__dirname, `${gateFile}.cjs`);
      if (!fs.existsSync(gateAbsPath)) {
        resolve(null);
        clearTimeout(timeout);
        return;
      }

      const proc = spawn('node', [gateAbsPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: timeoutMs,
      });

      let stdout = '';
      let stderr = '';
      let processExited = false;

      proc.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      proc.on('error', () => {
        resolve(null);
        clearTimeout(timeout);
      });

      proc.on('exit', (code) => {
        processExited = true;
        clearTimeout(timeout);
        // Exit code 0 = gate allowed / no violation
        // Exit code 1 = gate blocked
        // Exit code 2 = gate error (degraded, let through)
        resolve({
          exitCode: code,
          allowed: code === 0 || code === null || code === 2, // 2 = error, graceful pass
          blocked: code === 1,
          stderr,
        });
      });

      proc.stdin.write(stdinData);
      proc.stdin.end();
    } catch {
      resolve(null);
      clearTimeout(timeout);
    }
  });
}

/**
 * Execute all gates in priority order.
 * Returns early if any gate BLOCKS (exitCode 1).
 * Otherwise collects all verdicts and returns.
 */
async function executeGates(stdinData) {
  const results = [];

  for (const gate of GATES) {
    try {
      const result = await executeGate(gate.name, stdinData);

      if (!result) {
        // Timeout or file not found — log but continue
        results.push({
          gate: gate.name,
          article: gate.article,
          verdict: 'warn',
          reason: 'Gate timeout or not found; proceeding with caution',
        });
        continue;
      }

      if (result.blocked) {
        // Gate blocked — stop here
        results.push({
          gate: gate.name,
          article: gate.article,
          verdict: 'block',
          reason: result.stderr || 'Gate blocked operation',
        });
        return {
          allowed: false,
          verdict: 'block',
          results,
          reason: `Art. ${gate.article} gate blocked operation`,
        };
      }

      // Gate allowed
      results.push({
        gate: gate.name,
        article: gate.article,
        verdict: 'allow',
      });
    } catch {
      // Gate execution error — log and continue
      results.push({
        gate: gate.name,
        article: gate.article,
        verdict: 'warn',
        reason: 'Gate execution error; proceeding',
      });
    }
  }

  return {
    allowed: true,
    verdict: 'allow',
    results,
    reason: 'All gates passed',
  };
}

/**
 * Main entry point.
 */
async function main() {
  const stdinData = readStdin();

  try {
    const gateResult = await executeGates(stdinData);

    if (!gateResult.allowed) {
      // A gate blocked — exit with code 1
      process.stderr.write(`⚠️  Constitutional gate blocked: ${gateResult.reason}\n`);
      process.exitCode = 1;
      return;
    }

    // All gates passed — allow the operation
    process.exitCode = 0;
  } catch {
    // Framework error — allow operation (fail-safe)
    process.exitCode = 0;
  }
}

// Run if invoked directly
if (require.main === module) {
  main().catch(() => {
    process.exitCode = 0;
  });
}

module.exports = { executeGates, executeGate };
