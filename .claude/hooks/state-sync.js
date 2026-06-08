#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Hook: state-sync
// Maintains STATE.md synchronization when story status changes
// Prevents merge conflicts via atomic updates

// Locate STATE.md by walking up from the story path until found.
// storyPath may be a file or a directory; we search ancestor dirs.
function resolveStatePath(storyPath) {
  let dir = path.resolve(storyPath);
  try {
    if (fs.existsSync(dir) && fs.statSync(dir).isFile()) dir = path.dirname(dir);
  } catch { dir = path.dirname(dir); }
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'STATE.md');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

async function syncStateFile(storyPath, storyId, newStatus) {
  try {
    const statePath = resolveStatePath(storyPath);
    if (!statePath) return;

    const lock = statePath + '.lock';
    const maxRetries = 5;
    const STALE_LOCK_MS = 5000; // a lock older than 5s is considered abandoned
    let retries = 0;

    // Wait for an active lock to clear, but reclaim a stale one (REL-001).
    while (fs.existsSync(lock) && retries < maxRetries) {
      let lockAgeMs = Infinity;
      try {
        lockAgeMs = Date.now() - fs.statSync(lock).mtimeMs;
      } catch {
        break; // lock vanished between existsSync and statSync — proceed
      }
      if (lockAgeMs > STALE_LOCK_MS) {
        // Stale lock from a crashed writer — reclaim it.
        try { fs.unlinkSync(lock); } catch { /* already gone */ }
        break;
      }
      await new Promise(r => setTimeout(r, 100));
      retries++;
    }

    // Acquire lock atomically: wx fails if another writer won the race.
    try {
      fs.writeFileSync(lock, `${process.pid}:${Date.now()}`, { flag: 'wx' });
    } catch (e) {
      if (e.code === 'EEXIST') {
        // Lost the race; another writer holds an active lock — skip this update.
        console.warn('⚠️  State sync skipped: lock held by another writer');
        return;
      }
      throw e;
    }

    try {
      let content = fs.readFileSync(statePath, 'utf8');
      const timestamp = new Date().toISOString();

      // Update story status in STATE.md
      const pattern = new RegExp(
        `(Story ${storyId}[^\\n]*Status:)\\s+\\w+`,
        'i'
      );

      if (pattern.test(content)) {
        content = content.replace(pattern, `$1 ${newStatus}`);
      }

      // Add timestamp
      const tsPattern = new RegExp(
        `(Story ${storyId}[^\\n]*)(\\n|$)`,
        'i'
      );
      content = content.replace(
        tsPattern,
        `$1 (${timestamp.split('T')[0]})$2`
      );

      fs.writeFileSync(statePath, content, 'utf8');
    } finally {
      // Release lock
      if (fs.existsSync(lock)) {
        fs.unlinkSync(lock);
      }
    }
  } catch (error) {
    console.warn('⚠️  State sync failed:', error.message);
  }
}

if (require.main === module) {
  const [storyPath, storyId, status] = process.argv.slice(2);
  if (storyPath && storyId && status) {
    syncStateFile(storyPath, storyId, status);
  }
}

module.exports = { syncStateFile, resolveStatePath };
module.exports.STALE_LOCK_MS = 5000;
