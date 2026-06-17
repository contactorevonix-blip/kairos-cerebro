#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Canonical story file pattern. Real stories live at docs/stories/<n.n>-name.md
// or docs/stories/<n>/<n.n>.name.md. Artifacts under epics/*/outputs/ (generated
// reports, JSON deliverables) are NOT stories and must not be AC-validated.
// Aligned with STORY_PATTERN in validate-story-structure.js.
const STORY_FILE_PATTERN = /^docs\/stories\/(?:\d+\/)?\d+\.\d+[.-].*\.md$/;

function isStoryFile(f) {
  if (!STORY_FILE_PATTERN.test(f)) return false;
  // Defensive: never treat epic output artifacts as stories.
  if (f.includes('/epics/') && f.includes('/outputs/')) return false;
  return true;
}

function validateStoryAC() {
  try {
    const branch = execSync('git branch --show-current').toString().trim();
    const changedFiles = execSync('git diff --cached --name-only').toString().split('\n').filter(f => f);

    const storyFiles = changedFiles.filter(isStoryFile);

    if (storyFiles.length === 0) {
      return true;
    }

    for (const storyFile of storyFiles) {
      const content = fs.readFileSync(storyFile, 'utf8');

      if (!content.includes('## Acceptance Criteria') || !content.includes('- [ ]') && !content.includes('- [x]')) {
        console.error(`❌ BLOCKED: Story ${path.basename(storyFile)} must have acceptance criteria`);
        console.error(`   Add '## Acceptance Criteria' section with checkbox items`);
        process.exit(1);
      }

      const acMatch = content.match(/## Acceptance Criteria\n+([\s\S]*?)(?=\n##(?!#)|$)/);
      if (acMatch) {
        const acSection = acMatch[1];
        const uncheckedCount = (acSection.match(/- \[ \]/g) || []).length;
        const checkedCount = (acSection.match(/- \[x\]/g) || []).length;

        if (uncheckedCount === 0 && checkedCount === 0) {
          console.error(`❌ BLOCKED: Story ${path.basename(storyFile)} has no acceptance criteria items`);
          process.exit(1);
        }
      }
    }

    return true;
  } catch (err) {
    console.error(`✅ PASS: No story files to validate, or git check passed`);
    return true;
  }
}

if (require.main === module) {
  try {
    validateStoryAC();
    console.log('✅ Story AC validation passed');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Validation error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { validateStoryAC };
