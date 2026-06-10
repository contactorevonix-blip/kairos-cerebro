/**
 * Context Registry Module
 * Persistent JSON-based session context storage
 * Integrates with Story 5.3.1 engine (Phase 5: IDS-CHECK, Phase 10: PERSISTENCE)
 * Uses JSON (not YAML) to avoid external dependencies
 */

const fs = require('fs');
const path = require('path');

class ContextRegistry {
  constructor(filePath) {
    this.filePath = filePath || path.join(process.cwd(), '.synapse', 'context-registry.json');
    this.ensureFile();
  }

  ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
    }
  }

  read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content) || {};
    } catch (err) {
      console.error(`Failed to read registry: ${err.message}`);
      return {};
    }
  }

  write(sessionId, contextState) {
    // Validate required fields
    const required = ['timestamp', 'intent_type', 'completeness', 'phase_4_passed'];
    for (const field of required) {
      if (!(field in contextState)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate types
    if (typeof contextState.timestamp !== 'string') {
      throw new Error('timestamp must be a string (ISO 8601)');
    }
    if (!['feature', 'bug', 'refactor', 'config', 'framework', 'research'].includes(contextState.intent_type)) {
      throw new Error('intent_type must be one of: feature, bug, refactor, config, framework, research');
    }
    if (typeof contextState.completeness !== 'number' || contextState.completeness < 0 || contextState.completeness > 1) {
      throw new Error('completeness must be a number between 0 and 1');
    }
    if (typeof contextState.phase_4_passed !== 'boolean') {
      throw new Error('phase_4_passed must be a boolean');
    }

    // Read current registry
    const registry = this.read();

    // Add/update entry
    registry[sessionId] = {
      timestamp: contextState.timestamp,
      intent_type: contextState.intent_type,
      completeness: contextState.completeness,
      phase_4_passed: contextState.phase_4_passed,
      gaps_detected: contextState.gaps_detected || [],
      context_sources: contextState.context_sources || {}
    };

    // Atomic write: temp file + rename
    const tempPath = this.filePath + '.tmp';
    try {
      fs.writeFileSync(tempPath, JSON.stringify(registry, null, 2));
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new Error(`Failed to write registry: ${err.message}`);
    }
  }

  /**
   * Persist a full registry object atomically (temp file + rename).
   *
   * Unlike write(), this does NOT enforce the per-session context-state schema.
   * It is the single canonical write path used by engine.js (Phase 10) to store
   * non-session metadata such as `last_context_engine_run`, so that the engine
   * and this module share ONE store/format (.synapse/context-registry.json)
   * instead of the engine maintaining its own inline JSON-into-.yaml writer
   * (REL-001 reconciliation, Story 5.3.5 AC3).
   *
   * @param {object} registry - the full registry object to persist
   */
  saveRaw(registry) {
    const obj = registry && typeof registry === 'object' ? registry : {};
    const tempPath = this.filePath + '.tmp';
    try {
      fs.writeFileSync(tempPath, JSON.stringify(obj, null, 2));
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new Error(`Failed to write registry: ${err.message}`);
    }
  }

  query(intentType) {
    const registry = this.read();
    const results = [];

    for (const [sessionId, state] of Object.entries(registry)) {
      if (state.intent_type === intentType) {
        results.push({
          session_id: sessionId,
          ...state
        });
      }
    }

    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getAll() {
    const registry = this.read();
    const results = [];

    for (const [sessionId, state] of Object.entries(registry)) {
      results.push({
        session_id: sessionId,
        ...state
      });
    }

    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  delete(sessionId) {
    const registry = this.read();
    delete registry[sessionId];

    const tempPath = this.filePath + '.tmp';
    try {
      fs.writeFileSync(tempPath, JSON.stringify(registry, null, 2));
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new Error(`Failed to delete from registry: ${err.message}`);
    }
  }

  clear() {
    const tempPath = this.filePath + '.tmp';
    try {
      fs.writeFileSync(tempPath, JSON.stringify({}, null, 2));
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new Error(`Failed to clear registry: ${err.message}`);
    }
  }
}

module.exports = ContextRegistry;
