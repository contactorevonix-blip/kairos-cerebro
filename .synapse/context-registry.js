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
    } catch {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new Error('Failed to write registry');
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
    } catch {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new Error('Failed to delete from registry');
    }
  }

  clear() {
    const tempPath = this.filePath + '.tmp';
    try {
      fs.writeFileSync(tempPath, JSON.stringify({}, null, 2));
      fs.renameSync(tempPath, this.filePath);
    } catch {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      throw new Error('Failed to clear registry');
    }
  }
}

module.exports = ContextRegistry;
