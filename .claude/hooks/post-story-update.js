#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { resolveStatePath } = require('./state-sync.js');

// Hook: post-story-update
// Triggers when story file is edited (via Edit/Write tools)
// Auto-updates STATE.md with story status + latest commit

async function updateStateOnStoryChange(filePath) {
  try {
    // Normalize Windows backslashes so path matching is cross-platform.
    const normalized = String(filePath).replace(/\\/g, '/');
    if (!normalized.includes('docs/stories/') || !normalized.endsWith('.md')) {
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

    // Update STATE.md with story info (walk up from the story dir to find it)
    const statePath = resolveStatePath(path.dirname(filePath));
    if (statePath) {
      updateStateMd(statePath, storyId, status, latestCommit);
    }

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

// Extract the edited file path from a Claude Code PostToolUse event payload.
// Supports Edit, Write, MultiEdit and NotebookEdit tool inputs.
function extractFilePathFromEvent(event) {
  if (!event || typeof event !== 'object') return null;
  const input = event.tool_input || event.toolInput || {};
  return input.file_path || input.filePath || input.notebook_path || null;
}

if (require.main === module) {
  // Mode 1: manual / test invocation — `node post-story-update.js <filePath>`
  const argvPath = process.argv[2];
  if (argvPath) {
    updateStateOnStoryChange(argvPath);
  } else if (!process.stdin.isTTY) {
    // Mode 2: Claude Code hook — event JSON arrives on stdin
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { raw += chunk; });
    process.stdin.on('end', () => {
      try {
        const event = JSON.parse(raw || '{}');
        const filePath = extractFilePathFromEvent(event);
        if (filePath) {
          updateStateOnStoryChange(filePath);
        }
      } catch {
        // Non-blocking: never break the Claude flow
      }
      process.exit(0);
    });
  }
}

module.exports = { updateStateOnStoryChange, updateStateMd, extractFilePathFromEvent };
