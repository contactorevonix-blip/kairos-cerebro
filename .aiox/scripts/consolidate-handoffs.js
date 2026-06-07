#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const HANDOFF_DIR = path.join(__dirname, '..', 'handoffs');
const ARCHIVE_DIR = path.join(HANDOFF_DIR, '_archive');
const THRESHOLD = 5;
const LOG_DIR = path.join(__dirname, '..', '..', 'docs', 'runlogs');

async function consolidateHandoffs() {
  try {
    console.log('🔄 Starting handoff consolidation...\n');

    // Ensure directories exist
    ensureDir(ARCHIVE_DIR);
    ensureDir(LOG_DIR);

    // Read all handoff files
    const handoffFiles = fs.readdirSync(HANDOFF_DIR)
      .filter(f => f.startsWith('handoff-') && f.endsWith('.json'))
      .sort();

    if (handoffFiles.length === 0) {
      console.log('✅ No handoffs to consolidate');
      return;
    }

    // Group handoffs by pipeline (extracted from filename or content)
    const pipelines = groupByPipeline(handoffFiles);

    console.log(`📊 Found ${Object.keys(pipelines).length} pipeline(s)\n`);

    // Process each pipeline
    for (const [pipelineId, handoffs] of Object.entries(pipelines)) {
      await processPipeline(pipelineId, handoffs);
    }

    console.log('\n✅ Handoff consolidation complete');
  } catch (error) {
    console.error('❌ Error during consolidation:', error.message);
    process.exit(1);
  }
}

function groupByPipeline(files) {
  const pipelines = {};

  for (const file of files) {
    const filepath = path.join(HANDOFF_DIR, file);
    let pipelineId = 'unknown';

    try {
      const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      // Extract pipeline from story_id (e.g., "1.16" → "1") or use filename pattern
      if (content.story_id) {
        const storyParts = content.story_id.toString().split('.');
        pipelineId = `phase-${storyParts[0]}`;
      } else if (file.includes('2.0-SYN')) {
        pipelineId = '2.0-synapse';
      }
    } catch (e) {
      // Skip malformed files
    }

    if (!pipelines[pipelineId]) {
      pipelines[pipelineId] = [];
    }
    pipelines[pipelineId].push(file);
  }

  return pipelines;
}

async function processPipeline(pipelineId, handoffFiles) {
  if (handoffFiles.length < THRESHOLD) {
    console.log(`  ${pipelineId}: ${handoffFiles.length}/${THRESHOLD} handoffs (skip)`);
    return;
  }

  console.log(`  ${pipelineId}: ${handoffFiles.length}/${THRESHOLD} handoffs → consolidating...`);

  // Keep latest, archive others
  const sortedFiles = handoffFiles.sort().reverse();
  const latestFile = sortedFiles[0];
  const toArchive = sortedFiles.slice(1);

  // Create pipeline archive dir
  const pipelineArchiveDir = path.join(ARCHIVE_DIR, pipelineId);
  ensureDir(pipelineArchiveDir);

  // Archive old handoffs
  for (const oldFile of toArchive) {
    const src = path.join(HANDOFF_DIR, oldFile);
    const dst = path.join(pipelineArchiveDir, oldFile);
    fs.renameSync(src, dst);
  }

  // Create/update RUN-LOG.md
  const runLogPath = path.join(LOG_DIR, `${pipelineId}-RUN-LOG.md`);
  await updateRunLog(runLogPath, pipelineId, toArchive, latestFile);

  console.log(`    ✅ Archived ${toArchive.length} handoff(s), kept ${latestFile}`);
}

async function updateRunLog(runLogPath, pipelineId, archivedFiles, latestFile) {
  let content = '';

  if (fs.existsSync(runLogPath)) {
    content = fs.readFileSync(runLogPath, 'utf8');
  } else {
    content = `# ${pipelineId} — Run Log

**Consolidated:** ${new Date().toISOString().split('T')[0]}

---

`;
  }

  // Append consolidation note
  const waveCount = archivedFiles.length;
  const note = `
## Consolidation: ${new Date().toISOString()}

**Consolidated ${waveCount} handoff(s):**
${archivedFiles.map(f => `- ${f}`).join('\n')}

**Latest kept:** ${latestFile}
**Archive path:** \`.aiox/handoffs/_archive/${pipelineId}/\`

---
`;

  fs.writeFileSync(runLogPath, content + note);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Run if executed directly
if (require.main === module) {
  consolidateHandoffs();
}

module.exports = { consolidateHandoffs, groupByPipeline };
