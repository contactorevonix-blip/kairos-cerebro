'use strict';

/**
 * Surface Reconciler — Three-Surface Agent Reconciliation (Story 12.3)
 *
 * Implements the RT-3 "Agent Context Loading Determinism" reconciliation
 * strategy from EPIC-12 (research.json RT-3.reconciliation_strategy).
 *
 * THE THREE-SURFACE AGENT TRAP
 * ----------------------------
 * An agent definition can live in up to three independent surfaces that may
 * diverge over time, causing context inconsistency on activation:
 *
 *   - Surface 1 (PRIORITY 1, highest): `.claude/agents/aiox-{name}.md`
 *       user-customized, project-level definition
 *   - Surface 2 (PRIORITY 2, medium):  `.claude/skills/AIOX/agents/{name}/SKILL.md`
 *       unified activation payload — activation source-of-truth
 *   - Surface 3 (PRIORITY 3, lowest):  `.aiox-core/development/agents/{name}.md`
 *       framework template — fallback only
 *
 * This module reconciles the surfaces deterministically (Surface 1 > 2 > 3),
 * detects divergence between surfaces and logs a warning, applies a 4-level
 * graceful-degradation ladder, and caches the resolved definition with a 1h
 * TTL to turn O(3 file reads) into O(1) lookups for repeated agent loads.
 *
 * Traceability:
 *   - FR-4.1 — deterministic context loading (priority order)
 *   - FR-4.2 — conflict detection + context expansion
 *   - NFR-1.1 — < 500ms agent load
 *   - NFR-1.3 — > 80% cache hit rate
 *
 * @module development/scripts/surface-reconciler
 * @see unified-activation-pipeline.js — consumes this reconciler
 * @see docs/stories/12.3.story.md
 */

const fs = require('fs');
const path = require('path');

/**
 * Cache TTL: 1 hour, per research.json RT-3.cache_strategy.ttl.
 * @type {number}
 */
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Cache location, per research.json RT-3.cache_strategy.where.
 * Relative to project root (gitignored, per-session).
 * @type {string}
 */
const CACHE_RELATIVE_PATH = path.join('.aiox', '.agent-context-cache.json');

/**
 * Degradation levels — mirrors research.json RT-3.graceful_degradation.
 * @enum {string}
 */
const DEGRADATION_LEVEL = {
  CACHE_HIT: 'L1-cache-hit',
  FALLBACK_SURFACE: 'L2-fallback-surface',
  HARDCODED_DEFAULTS: 'L3-hardcoded-defaults',
  ERROR: 'L4-error',
};

/**
 * Surface priority order, per research.json RT-3.reconciliation_strategy.priority_order.
 * Index 0 = highest priority (Surface 1). Each entry resolves a project-relative
 * path for a given agent id.
 * @type {Array<{id: number, label: string, resolve: (agentId: string) => string}>}
 */
const SURFACE_DEFINITIONS = [
  {
    id: 1,
    label: '.claude/agents/aiox-{name}.md',
    resolve: (agentId) => path.join('.claude', 'agents', `aiox-${agentId}.md`),
  },
  {
    id: 2,
    label: '.claude/skills/AIOX/agents/{name}/SKILL.md',
    resolve: (agentId) => path.join('.claude', 'skills', 'AIOX', 'agents', agentId, 'SKILL.md'),
  },
  {
    id: 3,
    label: '.aiox-core/development/agents/{name}.md',
    resolve: (agentId) => path.join('.aiox-core', 'development', 'agents', `${agentId}.md`),
  },
];

/**
 * Reconciles the three agent-definition surfaces into a single deterministic
 * agent context, with conflict detection, graceful degradation, and caching.
 */
class SurfaceReconciler {
  /**
   * @param {Object} [options]
   * @param {string} [options.projectRoot] - Project root (defaults to process.cwd()).
   * @param {Function} [options.logger] - Warning sink (defaults to console.warn).
   * @param {Object} [options.metricsSink] - Optional metrics persistence target
   *   exposing `record(metrics)`; defaults to file-backed metrics writer.
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.logger = options.logger || ((msg) => console.warn(msg));
    this.metricsSink = options.metricsSink || null;
    this.cachePath = path.join(this.projectRoot, CACHE_RELATIVE_PATH);
  }

  /**
   * Reconcile surfaces for an agent into a single definition.
   *
   * Degradation ladder (research.json RT-3.graceful_degradation):
   *   L1 — fresh cache hit (< 1h TTL) → O(1) return
   *   L2 — read surfaces in priority order, reconcile + detect conflicts
   *   L3 — no surfaces readable → minimal hardcoded persona
   *   L4 — total failure → error result with recovery hint
   *
   * Never throws: failures collapse to L3/L4 result objects.
   *
   * @param {string} agentId - Agent identifier (e.g., 'dev', 'qa').
   * @param {Object} [opts]
   * @param {boolean} [opts.forceRefresh=false] - Bypass cache (always re-read surfaces).
   * @returns {{
   *   agentId: string,
   *   source: string,          // winning surface label or 'cache'/'hardcoded'/'error'
   *   degradationLevel: string,
   *   cacheHit: boolean,
   *   conflict: boolean,
   *   conflictingSurfaces: number[],
   *   surfacesFound: number[],
   *   content: string|null,
   *   lineCount: number,
   *   error: string|null,
   * }}
   */
  reconcile(agentId, opts = {}) {
    const forceRefresh = Boolean(opts.forceRefresh);

    if (!agentId || typeof agentId !== 'string') {
      const result = this._errorResult('', 'Invalid agentId: a non-empty string is required.');
      this._recordMetrics(result);
      return result;
    }

    // --- Level 1: cache hit ---
    if (!forceRefresh) {
      const cached = this._readCache(agentId);
      if (cached) {
        const result = {
          agentId,
          source: 'cache',
          degradationLevel: DEGRADATION_LEVEL.CACHE_HIT,
          cacheHit: true,
          conflict: Boolean(cached.conflict),
          conflictingSurfaces: cached.conflictingSurfaces || [],
          surfacesFound: cached.surfacesFound || [],
          content: cached.content || null,
          lineCount: cached.lineCount || 0,
          error: null,
        };
        this._recordMetrics(result);
        return result;
      }
    }

    // --- Level 2: read + reconcile surfaces in priority order ---
    const surfaces = this._readSurfaces(agentId);
    const found = surfaces.filter((s) => s.exists && s.content !== null);

    if (found.length === 0) {
      // --- Level 3: hardcoded defaults ---
      const hardcoded = this._hardcodedResult(agentId);
      this._recordMetrics(hardcoded);
      return hardcoded;
    }

    // Winner = highest-priority surface that exists (lowest id).
    const winner = found.reduce((best, s) => (s.id < best.id ? s : best), found[0]);

    // Conflict detection: any two found surfaces with divergent normalized content.
    const { conflict, conflictingSurfaces } = this._detectConflict(found);
    if (conflict) {
      this.logger(
        `[SurfaceReconciler] Conflict detected for agent "${agentId}": ` +
        `surfaces ${conflictingSurfaces.join(', ')} diverge. ` +
        `Using Surface ${winner.id} (${winner.label}) per priority order; drift noted in metrics.`,
      );
    }

    const result = {
      agentId,
      source: winner.label,
      degradationLevel: DEGRADATION_LEVEL.FALLBACK_SURFACE,
      cacheHit: false,
      conflict,
      conflictingSurfaces,
      surfacesFound: found.map((s) => s.id),
      content: winner.content,
      lineCount: this._countLines(winner.content),
      error: null,
    };

    this._writeCache(agentId, result);
    this._recordMetrics(result);
    return result;
  }

  /**
   * Read all three surfaces for an agent (existence + content).
   * @private
   * @param {string} agentId
   * @returns {Array<{id:number,label:string,path:string,exists:boolean,content:string|null}>}
   */
  _readSurfaces(agentId) {
    return SURFACE_DEFINITIONS.map((def) => {
      const rel = def.resolve(agentId);
      const abs = path.join(this.projectRoot, rel);
      let exists = false;
      let content = null;
      try {
        if (fs.existsSync(abs)) {
          content = fs.readFileSync(abs, 'utf8');
          exists = true;
        }
      } catch (err) {
        this.logger(`[SurfaceReconciler] Failed reading Surface ${def.id} (${rel}): ${err.message}`);
      }
      return { id: def.id, label: def.label, path: rel, exists, content };
    });
  }

  /**
   * Detect divergence among found surfaces. Two surfaces "conflict" when their
   * normalized content differs. Returns the set of surface ids involved.
   * @private
   * @param {Array<{id:number,content:string}>} found
   * @returns {{conflict: boolean, conflictingSurfaces: number[]}}
   */
  _detectConflict(found) {
    if (found.length < 2) {
      return { conflict: false, conflictingSurfaces: [] };
    }
    const normalized = found.map((s) => ({ id: s.id, hash: this._normalize(s.content) }));
    const baseline = normalized[0].hash;
    const divergent = normalized.filter((n) => n.hash !== baseline);
    if (divergent.length === 0) {
      return { conflict: false, conflictingSurfaces: [] };
    }
    // All ids participate in the conflict (baseline + each divergent one).
    const ids = new Set([normalized[0].id, ...divergent.map((d) => d.id)]);
    return { conflict: true, conflictingSurfaces: [...ids].sort((a, b) => a - b) };
  }

  /**
   * Normalize content for comparison: strip CRLF, collapse trailing whitespace,
   * drop blank-line noise. This avoids false-positive conflicts from line-ending
   * or trailing-whitespace differences between surfaces.
   * @private
   * @param {string} content
   * @returns {string}
   */
  _normalize(content) {
    return String(content || '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n')
      .replace(/\n{2,}/g, '\n')
      .trim();
  }

  /**
   * @private
   * @param {string} content
   * @returns {number}
   */
  _countLines(content) {
    if (!content) return 0;
    return String(content).replace(/\r\n/g, '\n').split('\n').length;
  }

  /**
   * Level 3 result — minimal hardcoded persona when no surface is readable.
   * @private
   * @param {string} agentId
   * @returns {Object}
   */
  _hardcodedResult(agentId) {
    return {
      agentId,
      source: 'hardcoded',
      degradationLevel: DEGRADATION_LEVEL.HARDCODED_DEFAULTS,
      cacheHit: false,
      conflict: false,
      conflictingSurfaces: [],
      surfacesFound: [],
      content: `# ${agentId}\n\nMinimal hardcoded persona (no surface available).\nCommands: *help (placeholder)\n`,
      lineCount: 4,
      error: null,
    };
  }

  /**
   * Level 4 result — unrecoverable error with actionable recovery hint.
   * @private
   * @param {string} agentId
   * @param {string} message
   * @returns {Object}
   */
  _errorResult(agentId, message) {
    return {
      agentId: agentId || '',
      source: 'error',
      degradationLevel: DEGRADATION_LEVEL.ERROR,
      cacheHit: false,
      conflict: false,
      conflictingSurfaces: [],
      surfacesFound: [],
      content: null,
      lineCount: 0,
      error: `${message} Recovery hint: run \`aiox doctor agent-context\` to diagnose.`,
    };
  }

  // --- Cache (research.json RT-3.cache_strategy) ---

  /**
   * Read a fresh (< TTL) cache entry for an agent. Returns null on miss/stale/error.
   * @private
   * @param {string} agentId
   * @returns {Object|null}
   */
  _readCache(agentId) {
    try {
      if (!fs.existsSync(this.cachePath)) return null;
      const raw = JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
      const entry = raw && raw.agents ? raw.agents[agentId] : null;
      if (!entry || typeof entry.cachedAt !== 'number') return null;
      if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null; // stale
      return entry;
    } catch {
      return null; // corrupt cache → treat as miss (graceful)
    }
  }

  /**
   * Persist the resolved definition for an agent (idempotent, never throws).
   * @private
   * @param {string} agentId
   * @param {Object} result
   */
  _writeCache(agentId, result) {
    try {
      const dir = path.dirname(this.cachePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      let store = { version: 1, agents: {} };
      if (fs.existsSync(this.cachePath)) {
        try {
          const existing = JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
          if (existing && existing.agents) store = existing;
        } catch {
          // corrupt → start fresh
        }
      }

      store.agents[agentId] = {
        cachedAt: Date.now(),
        ttlMs: CACHE_TTL_MS,
        source: result.source,
        conflict: result.conflict,
        conflictingSurfaces: result.conflictingSurfaces,
        surfacesFound: result.surfacesFound,
        content: result.content,
        lineCount: result.lineCount,
      };

      fs.writeFileSync(this.cachePath, JSON.stringify(store, null, 2), 'utf8');
    } catch {
      // Fire-and-forget: a cache write failure must never block activation.
    }
  }

  /**
   * Invalidate the entire cache (e.g. `aiox clear-cache`). Never throws.
   * @returns {boolean} true if a cache file was removed.
   */
  clearCache() {
    try {
      if (fs.existsSync(this.cachePath)) {
        fs.unlinkSync(this.cachePath);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  // --- Metrics (NFR-1.3 cache hit rate + conflict/drift tracking) ---

  /**
   * Record reconciliation metrics. Persists to `.synapse/metrics/surface-reconciler-metrics.json`
   * by default (idempotent merge). Fire-and-forget — never throws.
   * @private
   * @param {Object} result
   */
  _recordMetrics(result) {
    try {
      if (this.metricsSink && typeof this.metricsSink.record === 'function') {
        this.metricsSink.record(result);
        return;
      }

      const synapseDir = path.join(this.projectRoot, '.synapse');
      if (!fs.existsSync(synapseDir)) return; // SYNAPSE not installed — skip
      const metricsDir = path.join(synapseDir, 'metrics');
      if (!fs.existsSync(metricsDir)) fs.mkdirSync(metricsDir, { recursive: true });
      const metricsPath = path.join(metricsDir, 'surface-reconciler-metrics.json');

      let metrics = {
        reconciliations: 0,
        cacheHits: 0,
        cacheMisses: 0,
        conflictsDetected: 0,
        degradations: { L3: 0, L4: 0 },
        cacheHitRate: 0,
        lastUpdated: null,
      };
      if (fs.existsSync(metricsPath)) {
        try {
          const existing = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
          if (existing && typeof existing === 'object') metrics = { ...metrics, ...existing };
          metrics.degradations = { L3: 0, L4: 0, ...(existing.degradations || {}) };
        } catch {
          // corrupt → reset
        }
      }

      metrics.reconciliations += 1;
      if (result.cacheHit) metrics.cacheHits += 1;
      else metrics.cacheMisses += 1;
      if (result.conflict) metrics.conflictsDetected += 1;
      if (result.degradationLevel === DEGRADATION_LEVEL.HARDCODED_DEFAULTS) metrics.degradations.L3 += 1;
      if (result.degradationLevel === DEGRADATION_LEVEL.ERROR) metrics.degradations.L4 += 1;

      const totalLookups = metrics.cacheHits + metrics.cacheMisses;
      metrics.cacheHitRate = totalLookups > 0
        ? Number((metrics.cacheHits / totalLookups).toFixed(4))
        : 0;
      metrics.lastUpdated = new Date().toISOString();

      fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2), 'utf8');
    } catch {
      // Fire-and-forget.
    }
  }
}

module.exports = {
  SurfaceReconciler,
  CACHE_TTL_MS,
  CACHE_RELATIVE_PATH,
  DEGRADATION_LEVEL,
  SURFACE_DEFINITIONS,
};
