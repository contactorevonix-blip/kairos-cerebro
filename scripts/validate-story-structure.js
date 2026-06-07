#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STORY_PATTERN = /docs\/stories\/\d+\.\d+-.*\.md$/;
const VALID_STATUSES = ['Draft', 'Ready', 'InProgress', 'InReview', 'Done'];

function getChangedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f);
  } catch {
    return [];
  }
}

function validateStoryFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { valid: true, warnings: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const warnings = [];

  // Check for Acceptance Criteria section
  if (!content.includes('## Acceptance Criteria')) {
    warnings.push('❌ Missing "## Acceptance Criteria" section');
  } else {
    // Validate AC format (all ACs must be [ ] or [x])
    const acSection = content.split('## Acceptance Criteria')[1]?.split('##')[0] || '';
    const acLines = acSection.split('\n').filter(l => l.includes('- ['));

    if (acLines.length === 0) {
      warnings.push('⚠️  No acceptance criteria found (should be "- [ ]" or "- [x]" format)');
    } else {
      const invalidACs = acLines.filter(l => !l.match(/- \[[xX ]?\]/));
      if (invalidACs.length > 0) {
        warnings.push(`❌ Invalid AC format: ${invalidACs.length} AC(s) not in "- [ ]" format`);
      }
    }
  }

  // Check for Status field
  const statusMatch = content.match(/\*\*Status:\*\*\s+(\S+)/);
  if (!statusMatch) {
    warnings.push('❌ Missing "**Status:**" field');
  } else if (!VALID_STATUSES.includes(statusMatch[1])) {
    warnings.push(`❌ Invalid status "${statusMatch[1]}". Must be: ${VALID_STATUSES.join(', ')}`);
  }

  // Check for File List section
  if (!content.includes('## File List')) {
    warnings.push('❌ Missing "## File List" section');
  } else {
    const fileListSection = content.split('## File List')[1]?.split('##')[0] || '';
    if (fileListSection.trim().length < 10) {
      warnings.push('⚠️  File List section is empty or too short');
    }
  }

  // Check for Change Log section
  if (!content.includes('## Change Log')) {
    warnings.push('❌ Missing "## Change Log" section');
  }

  return {
    valid: warnings.filter(w => w.startsWith('❌')).length === 0,
    warnings
  };
}

function main() {
  const changedFiles = getChangedFiles();
  const storyFiles = changedFiles.filter(f => STORY_PATTERN.test(f));

  if (storyFiles.length === 0) {
    // No story files changed, validation passes
    process.exit(0);
  }

  let hasErrors = false;
  const results = [];

  storyFiles.forEach(storyFile => {
    const validation = validateStoryFile(storyFile);
    results.push({ file: storyFile, ...validation });

    if (!validation.valid) {
      hasErrors = true;
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(w => {
        console.error(`${storyFile}: ${w}`);
      });
    }
  });

  if (hasErrors) {
    console.error('\n❌ Story structure validation failed. Please fix the issues above.');
    process.exit(1);
  }

  console.log(`✅ Story structure validation passed (${storyFiles.length} file(s))`);
  process.exit(0);
}

main();
