/**
 * Agent Memory Logger (Phase 1 — Logging Foundation)
 * Non-blocking, graceful error handling, zero external dependencies
 *
 * Usage:
 *   const logger = require('./logger.cjs');
 *   logger.captureSnapshot({ agentId, context, decisions, memory });
 *   logger.logSession({ agentId, timestamp, sessionData });
 *   const logs = logger.readLog({ agentId, date });
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = process.env.IMMORTALITY_LOG_DIR || '.aiox/agent-memory/logs';
const DEFAULT_LOG_RETENTION_HOURS = 168; // 7 days

/**
 * Ensure log directory exists (synchronous, safe to fail silently)
 */
function ensureLogDirectory() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (err) {
    // Silently fail — logging directory creation should never block agent
    console.warn(`[immortality:logger] Failed to create log directory: ${err.message}`);
  }
}

/**
 * Generate log filename for given date
 * Format: agent-memory-{YYYY-MM-DD}.jsonl
 */
function getLogFilePath(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  return path.join(LOG_DIR, `agent-memory-${dateStr}.jsonl`);
}

/**
 * Capture agent memory snapshot at a point in time
 *
 * Schema: { agentId, timestamp, context, decisions, memory, serialization_errors }
 *
 * @param {Object} params
 * @param {string} params.agentId - Agent identifier
 * @param {Object} params.context - Agent execution context (optional)
 * @param {Array} params.decisions - List of decisions made (optional)
 * @param {Object} params.memory - Agent memory state (optional)
 * @returns {Object} Snapshot object or null on error
 */
function captureSnapshot({ agentId, context = {}, decisions = [], memory = {} } = {}) {
  try {
    const timestamp = new Date().toISOString();
    const serializationErrors = [];

    // Safely serialize each component
    let contextData = context;
    let decisionsData = decisions;
    let memoryData = memory;

    try {
      contextData = JSON.parse(JSON.stringify(context));
    } catch (e) {
      serializationErrors.push(`context: ${e.message}`);
      contextData = {};
    }

    try {
      decisionsData = JSON.parse(JSON.stringify(decisions));
    } catch (e) {
      serializationErrors.push(`decisions: ${e.message}`);
      decisionsData = [];
    }

    try {
      memoryData = JSON.parse(JSON.stringify(memory));
    } catch (e) {
      serializationErrors.push(`memory: ${e.message}`);
      memoryData = {};
    }

    const snapshot = {
      agentId,
      timestamp,
      context: contextData,
      decisions: decisionsData,
      memory: memoryData,
      serialization_errors: serializationErrors.length > 0 ? serializationErrors : null
    };

    return snapshot;
  } catch (err) {
    console.warn(`[immortality:logger] Failed to capture snapshot: ${err.message}`);
    return null;
  }
}

/**
 * Log a session snapshot to the daily log file (non-blocking async)
 *
 * @param {Object} snapshot - Snapshot object from captureSnapshot()
 * @param {Function} callback - Optional callback (error-first)
 */
function logSession(snapshot, callback = null) {
  if (!snapshot) {
    if (callback) callback(new Error('No snapshot to log'));
    return;
  }

  ensureLogDirectory();

  setImmediate(() => {
    try {
      const logFile = getLogFilePath();
      const logLine = JSON.stringify(snapshot) + '\n';

      fs.appendFile(logFile, logLine, 'utf8', (err) => {
        if (err) {
          console.warn(`[immortality:logger] Failed to write log: ${err.message}`);
          if (callback) callback(err);
        } else {
          if (callback) callback(null, { written: true, file: logFile });
        }
      });
    } catch (err) {
      console.warn(`[immortality:logger] Error in logSession: ${err.message}`);
      if (callback) callback(err);
    }
  });
}

/**
 * Read logs for a given agent and date
 * Returns array of snapshot objects (parsed from JSONL)
 *
 * @param {Object} options
 * @param {string} options.agentId - Filter by agent (optional)
 * @param {Date} options.date - Log date to read (default: today)
 * @param {Function} callback - Callback(error, logs)
 */
function readLog({ agentId = null, date = new Date() } = {}, callback = null) {
  try {
    const logFile = getLogFilePath(date);

    if (!fs.existsSync(logFile)) {
      const result = [];
      if (callback) callback(null, result);
      return result;
    }

    fs.readFile(logFile, 'utf8', (err, data) => {
      if (err) {
        console.warn(`[immortality:logger] Failed to read log: ${err.message}`);
        if (callback) callback(err);
        return;
      }

      try {
        const lines = data.trim().split('\n').filter(line => line.trim());
        let logs = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            console.warn(`[immortality:logger] Failed to parse log line: ${e.message}`);
            return null;
          }
        }).filter(log => log !== null);

        if (agentId) {
          logs = logs.filter(log => log.agentId === agentId);
        }

        if (callback) callback(null, logs);
        return logs;
      } catch (err) {
        console.warn(`[immortality:logger] Error processing logs: ${err.message}`);
        if (callback) callback(err);
      }
    });
  } catch (err) {
    console.warn(`[immortality:logger] Error in readLog: ${err.message}`);
    if (callback) callback(err);
  }
}

/**
 * Clean up old logs based on TTL (daily rotation)
 *
 * @param {number} ttlHours - Time-to-live for logs in hours
 * @param {Function} callback - Callback(error, deletedCount)
 */
function cleanupOldLogs(ttlHours = DEFAULT_LOG_RETENTION_HOURS, callback = null) {
  try {
    const now = Date.now();
    const ttlMs = ttlHours * 3600 * 1000;

    fs.readdir(LOG_DIR, (err, files) => {
      if (err) {
        if (callback) callback(err);
        return;
      }

      let deletedCount = 0;

      files.forEach(file => {
        const filePath = path.join(LOG_DIR, file);
        try {
          const stats = fs.statSync(filePath);
          const age = now - stats.mtimeMs;

          if (age > ttlMs) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        } catch (e) {
          console.warn(`[immortality:logger] Failed to clean log file ${file}: ${e.message}`);
        }
      });

      if (callback) callback(null, deletedCount);
    });
  } catch (err) {
    console.warn(`[immortality:logger] Error in cleanupOldLogs: ${err.message}`);
    if (callback) callback(err);
  }
}

// Exports
module.exports = {
  captureSnapshot,
  logSession,
  readLog,
  cleanupOldLogs,
  ensureLogDirectory,
  getLogFilePath
};
