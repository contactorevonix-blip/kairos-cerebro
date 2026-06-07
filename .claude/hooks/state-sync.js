#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Hook: state-sync
// Maintains STATE.md synchronization when story status changes
// Prevents merge conflicts via atomic updates

async function syncStateFile(storyPath, storyId, newStatus) {
  try {
    const statePath = path.join(storyPath, '..', '..', 'STATE.md');
    if (!fs.existsSync(statePath)) return;

    const lock = statePath + '.lock';
    const maxRetries = 5;
    let retries = 0;

    // Simple lock to prevent concurrent writes
    while (fs.existsSync(lock) && retries < maxRetries) {
      await new Promise(r => setTimeout(r, 100));
      retries++;
    }

    // Create lock
    fs.writeFileSync(lock, Date.now().toString());

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

module.exports = { syncStateFile };
