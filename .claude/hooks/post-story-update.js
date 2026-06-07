#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Hook: post-story-update
// Triggers when story file is edited (via Edit/Write tools)
// Auto-updates STATE.md with story status + latest commit

async function updateStateOnStoryChange(filePath) {
  try {
    if (!filePath.includes('docs/stories/') || !filePath.endsWith('.md')) {
      return; // Not a story file
    }

    const storyContent = fs.readFileSync(filePath, 'utf8');
    const storyMatch = filePath.match(/(\d+\.\d+)/);
    if (!storyMatch) return;

    const storyId = storyMatch[1];
    const statusMatch = storyContent.match(/\*\*Status:\*\*\s+(\w+)/);
    const status = statusMatch ? statusMatch[1] : 'Unknown';

    // Get latest commit message
    let latestCommit = '';
    try {
      latestCommit = execSync('git log -1 --format=%s', { encoding: 'utf8' }).trim();
    } catch (e) {
      latestCommit = 'N/A';
    }

    // Update STATE.md with story info
    const statePath = path.join(path.dirname(filePath), '..', '..', 'STATE.md');
    updateStateMd(statePath, storyId, status, latestCommit);

  } catch (error) {
    console.warn('⚠️  State update failed:', error.message);
    // Non-blocking
  }
}

function updateStateMd(statePath, storyId, status, latestCommit) {
  if (!fs.existsSync(statePath)) return;

  let content = fs.readFileSync(statePath, 'utf8');
  const timestamp = new Date().toISOString();

  // Create or update story entry in STATE.md (simple append to top of appropriate section)
  const storyEntry = `- **Story ${storyId}:** ${status} (updated ${timestamp.split('T')[0]})`;

  // Check if story already exists in State
  const storyRegex = new RegExp(`- \\*\\*Story ${storyId}:.*`, 'i');
  if (storyRegex.test(content)) {
    content = content.replace(storyRegex, storyEntry);
  } else {
    // Add to "Recent Updates" section if it exists
    const recentSection = '## Recent Updates\n';
    if (content.includes(recentSection)) {
      content = content.replace(
        recentSection,
        recentSection + storyEntry + '\n'
      );
    }
  }

  fs.writeFileSync(statePath, content, 'utf8');
}

if (require.main === module) {
  const filePath = process.argv[2];
  if (filePath) {
    updateStateOnStoryChange(filePath);
  }
}

module.exports = { updateStateOnStoryChange };
