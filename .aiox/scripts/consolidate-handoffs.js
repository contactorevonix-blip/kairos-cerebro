#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const HANDOFF_DIR = path.join(__dirname, '..', 'handoffs');
const ARCHIVE_DIR = path.join(HANDOFF_DIR, '_archive');
const THRESHOLD = 5;
const LOG_DIR = path.join(__dirname, '..', '..', 'docs', 'runlogs');

async function consolidateHandoffs(dir = HANDOFF_DIR, opts = {}) {
  const workDir = dir || HANDOFF_DIR;
  const archiveDir = path.join(workDir, '_archive');
  const threshold = opts.threshold || THRESHOLD;
  const logDir = opts.logDir || LOG_DIR;

  const result = { consolidated: [], archived: [] };

  try {
    console.log('🔄 Starting handoff consolidation...\n');

    // Ensure directories exist
    ensureDir(archiveDir);
    if (!opts.logDir) ensureDir(logDir);

    // Read all handoff files
    const handoffFiles = fs.readdirSync(workDir)
      .filter(f => f.startsWith('handoff-') && (f.endsWith('.json') || f.endsWith('.yaml')))
      .sort();

    if (handoffFiles.length === 0) {
      console.log('✅ No handoffs to consolidate');
      return result;
    }

    // Group handoffs by pipeline (extracted from filename or content)
    const pipelines = groupByPipeline(handoffFiles, workDir);

    console.log(`📊 Found ${Object.keys(pipelines).length} pipeline(s)\n`);

    // Process each pipeline
    for (const [pipelineId, handoffs] of Object.entries(pipelines)) {
      const processed = await processPipeline(pipelineId, handoffs, workDir, archiveDir, logDir, threshold);
      result.consolidated.push(...processed.consolidated);
      result.archived.push(...processed.archived);
    }

    console.log('\n✅ Handoff consolidation complete');
    return result;
  } catch (error) {
    console.error('❌ Error during consolidation:', error.message);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

function groupByPipeline(files, workDir = HANDOFF_DIR) {
  const pipelines = {};

  for (const file of files) {
    // Handle both filename strings and objects with story_id
    let storyId;
    let filename;

    if (typeof file === 'string') {
      filename = file;
      const filepath = path.join(workDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        storyId = content.story_id;
      } catch (e) {
        // Continue with filename-based extraction
      }
    } else if (file && typeof file === 'object') {
      filename = file.filename || file.name || '';
      storyId = file.story_id;
    }

    let pipelineId = 'unknown';
    if (storyId) {
      const storyParts = storyId.toString().split('.');
      pipelineId = storyParts[0] === '2' && storyParts[1] === '0' ? '2.0-synapse' : `phase-${storyParts[0]}`;
    } else if (filename && filename.includes('2.0-SYN')) {
      pipelineId = '2.0-synapse';
    }

    if (!pipelines[pipelineId]) {
      pipelines[pipelineId] = [];
    }
    pipelines[pipelineId].push(filename || file);
  }

  return pipelines;
}

async function processPipeline(pipelineId, handoffFiles, workDir, archiveDir, logDir, threshold) {
  const result = { consolidated: [], archived: [] };

  if (handoffFiles.length < threshold) {
    console.log(`  ${pipelineId}: ${handoffFiles.length}/${threshold} handoffs (skip)`);
    return result;
  }

  console.log(`  ${pipelineId}: ${handoffFiles.length}/${threshold} handoffs → consolidating...`);

  // Keep latest, archive others
  const sortedFiles = handoffFiles.sort().reverse();
  const latestFile = sortedFiles[0];
  const toArchive = sortedFiles.slice(1);

  // Create pipeline archive dir
  const pipelineArchiveDir = path.join(archiveDir, pipelineId);
  ensureDir(pipelineArchiveDir);

  // Archive old handoffs
  for (const oldFile of toArchive) {
    const src = path.join(workDir, oldFile);
    const dst = path.join(pipelineArchiveDir, oldFile);
    try {
      fs.renameSync(src, dst);
      result.archived.push(oldFile);
    } catch (e) {
      // Skip if already archived or missing
    }
  }

  // Create/update RUN-LOG.md if logDir exists
  if (fs.existsSync(logDir)) {
    const runLogPath = path.join(logDir, `${pipelineId}-RUN-LOG.md`);
    await updateRunLog(runLogPath, pipelineId, toArchive, latestFile);
    result.consolidated.push(runLogPath);
  }

  console.log(`    ✅ Archived ${toArchive.length} handoff(s), kept ${latestFile}`);
  return result;
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
