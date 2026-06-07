#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STORY_PATTERN = /docs\/stories\/(\d+\.\d+-.*\.md)$/;
const HANDOFF_DIR = '.aiox/handoffs';
const ARCHIVE_DIR = path.join(HANDOFF_DIR, '_archive');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getCommittedStoryFiles() {
  try {
    const output = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf8' });
    return output.trim().split('\n')
      .filter(f => STORY_PATTERN.test(f));
  } catch {
    return [];
  }
}

function parseStoryFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  const storyIdMatch = content.match(/\*\*Story ID:\*\*\s+(\S+)/);
  const statusMatch = content.match(/\*\*Status:\*\*\s+(\S+)/);
  const effortMatch = content.match(/\*\*Effort:\*\*\s+([\d]+)\s+story\s+points/);

  return {
    id: storyIdMatch ? storyIdMatch[1] : 'unknown',
    status: statusMatch ? statusMatch[1] : 'unknown',
    effort: effortMatch ? parseInt(effortMatch[1]) : 0,
    filePath
  };
}

function generateHandoffArtifact(storyInfo) {
  const timestamp = new Date().toISOString();
  const [storyNum, storyName] = storyInfo.id.split('-');

  const handoff = {
    timestamp,
    story_id: storyInfo.id,
    story_path: storyInfo.filePath,
    story_status: storyInfo.status,
    story_effort: storyInfo.effort,
    agent: 'dev',
    action: 'commit',
    notes: `Story ${storyInfo.id} committed with status: ${storyInfo.status}`
  };

  return handoff;
}

function archiveOldHandoffs() {
  if (!fs.existsSync(HANDOFF_DIR)) {
    return;
  }

  const handoffFiles = fs.readdirSync(HANDOFF_DIR)
    .filter(f => f.startsWith('handoff-') && f.endsWith('.yaml'));

  if (handoffFiles.length >= 5) {
    // Archive oldest files
    const sorted = handoffFiles.sort();
    const toArchive = sorted.slice(0, Math.floor(sorted.length / 2));

    ensureDir(ARCHIVE_DIR);

    toArchive.forEach(file => {
      const src = path.join(HANDOFF_DIR, file);
      const dest = path.join(ARCHIVE_DIR, file);
      try {
        fs.copyFileSync(src, dest);
        fs.unlinkSync(src);
        console.log(`  ℹ️  Archived old handoff: ${file}`);
      } catch (err) {
        console.warn(`  ⚠️  Could not archive ${file}: ${err.message}`);
      }
    });
  }
}

function main() {
  const storyFiles = getCommittedStoryFiles();

  if (storyFiles.length === 0) {
    // No story files committed, nothing to do
    process.exit(0);
  }

  ensureDir(HANDOFF_DIR);

  storyFiles.forEach(filePath => {
    const storyInfo = parseStoryFile(filePath);
    if (!storyInfo) {
      console.warn(`⚠️  Could not parse story file: ${filePath}`);
      return;
    }

    // Only generate handoff if story status is InProgress, InReview, or Done
    if (['InProgress', 'InReview', 'Done'].includes(storyInfo.status)) {
      const handoff = generateHandoffArtifact(storyInfo);
      const filename = `handoff-${Date.now()}-${storyInfo.id}.json`;
      const filepath = path.join(HANDOFF_DIR, filename);

      fs.writeFileSync(filepath, JSON.stringify(handoff, null, 2));
      console.log(`✅ Handoff artifact created: ${filename}`);
    }
  });

  // Archive old handoffs if threshold reached
  archiveOldHandoffs();

  process.exit(0);
}

main();
