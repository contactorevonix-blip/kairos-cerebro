const fs = require('fs');
const path = require('path');
const { buildStoryTemplate, normalizeStoryId, resolveStoryPath } = require('./story-template');

function printHelp() {
  console.log(`Kairos CLI v1

Usage:
  kairos start                                   # boot the entire empire
  kairos init-story <story-id> [--title "Story title"] [--force]
  kairos validate-story <story-id>
  kairos tenant:create --id <tenantId> [--name "Display"] [--plan pilot] [--rate 120]
  kairos key:create --tenant <tenantId> [--label main]
  kairos key:revoke --key <rawKey>
  kairos vault:init
  kairos vault:set --name <secret> --value <plain>
  kairos vault:get --name <secret>
  kairos vault:list
  kairos vault:delete --name <secret>
  kairos vault:rotate --newPassphrase "<new>"
  kairos agents:list
  kairos taskforce:list
  kairos sovereign:decide --task "<short>" [--brief "<context>"]
  kairos audit:verify
  kairos compliance:purge [--retention 90]
  kairos compliance:export --subject "<email|wallet>"
  kairos compliance:erase --subject "<email|wallet>"
  kairos billing:plans
  kairos billing:usage --tenant <tenantId>
  kairos verify:text --text "copy suspeita" [--api-base http://127.0.0.1:8787] [--api-key ksk_...]
  kairos verify:url --url https://exemplo.com/oferta [--api-base ...] [--api-key ...]
    (ou: KAIROS_API_BASE + KAIROS_API_KEY no ambiente)

Examples:
  kairos start                                   # one command, full launch
  kairos init-story 1.1.1 --title "CLI bootstrap"
  kairos tenant:create --id banco-millennium --plan b2b-pilot --rate 240
  kairos audit:verify
  kairos compliance:purge --retention 90
`);
}

function parseArgs(argv) {
  const [, , command, ...rest] = argv;
  const args = { command, positionals: [], title: '', force: false };
  const STRING_FLAGS = [
    '--title', '--id', '--tenant', '--label', '--key', '--name', '--plan',
    '--rate', '--value', '--newPassphrase', '--task', '--brief',
    '--retention', '--subject', '--api-base', '--api-key', '--text', '--url',
  ];

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === '--force') {
      args.force = true;
      continue;
    }
    if (STRING_FLAGS.includes(token)) {
      let key = token.slice(2);
      if (token === '--title') key = 'title';
      if (token === '--api-base') key = 'apiBase';
      if (token === '--api-key') key = 'apiKey';
      args[key] = rest[i + 1] || '';
      i += 1;
      continue;
    }
    args.positionals.push(token);
  }

  return args;
}

function initStory(params, io = { log: console.log, error: console.error }) {
  const projectRoot = params.projectRoot || process.cwd();
  const storyId = normalizeStoryId(params.storyId);
  const filePath = resolveStoryPath(projectRoot, storyId);
  const storyDir = path.dirname(filePath);

  if (fs.existsSync(filePath) && !params.force) {
    throw new Error(`Story already exists: ${filePath}. Use --force to overwrite.`);
  }

  fs.mkdirSync(storyDir, { recursive: true });
  const content = buildStoryTemplate({ storyId, title: params.title });
  fs.writeFileSync(filePath, content, 'utf8');
  io.log(`✅ Story scaffold created: ${path.relative(projectRoot, filePath)}`);
}

function tenantCreate(params, io = { log: console.log, error: console.error }) {
  if (!params.tenantId) throw new Error('Missing --id <tenantId>');
  const db = require('../sniper-db');
  const tenant = db.upsertTenant({
    tenantId: params.tenantId,
    name: params.name || params.tenantId,
    plan: params.plan || 'b2b-pilot',
    rateLimitPerMinute: Number(params.rate) || 120,
  });
  io.log(`Tenant ${tenant.tenantId} ready (plan=${tenant.plan}, rate=${tenant.rateLimitPerMinute}/min).`);
}

function keyCreate(params, io = { log: console.log, error: console.error }) {
  if (!params.tenantId) throw new Error('Missing --tenant <tenantId>');
  const db = require('../sniper-db');
  const { rawKey, record } = db.createApiKey(params.tenantId, params.label || 'cli');
  io.log(`API key for ${record.tenantId} (label=${record.label}):`);
  io.log(`  ${rawKey}`);
  io.log('  Save this NOW. It is shown only once and stored hashed.');
}

function keyRevoke(params, io = { log: console.log, error: console.error }) {
  if (!params.key) throw new Error('Missing --key <rawKey>');
  const db = require('../sniper-db');
  const ok = db.revokeApiKey(params.key);
  if (!ok) throw new Error('Key not found.');
  io.log('Key revoked.');
}

function vaultInit(_, io = { log: console.log }) {
  const v = require('../vault');
  v.initVault();
  io.log('Vault initialized. Master key derived from KAIROS_MASTER_PASSPHRASE.');
}

function vaultSet(params, io = { log: console.log }) {
  if (!params.name) throw new Error('Missing --name <secret-name>');
  if (params.value === undefined) throw new Error('Missing --value <secret-value>');
  const v = require('../vault');
  const out = v.setSecret(params.name, params.value);
  io.log(`Secret "${out.name}" stored at ${out.updatedAt}.`);
}

function vaultGet(params, io = { log: console.log }) {
  if (!params.name) throw new Error('Missing --name <secret-name>');
  const v = require('../vault');
  const value = v.getSecret(params.name);
  if (value === null) throw new Error('Secret not found.');
  io.log(value);
}

function vaultList(_, io = { log: console.log }) {
  const v = require('../vault');
  const items = v.listSecrets();
  if (items.length === 0) {
    io.log('No secrets stored.');
    return;
  }
  for (const it of items) {
    io.log(`${it.name}\t${it.updatedAt}`);
  }
}

function vaultDelete(params, io = { log: console.log }) {
  if (!params.name) throw new Error('Missing --name <secret-name>');
  const v = require('../vault');
  const ok = v.deleteSecret(params.name);
  if (!ok) throw new Error('Secret not found.');
  io.log(`Secret "${params.name}" deleted.`);
}

function vaultRotate(params, io = { log: console.log }) {
  const v = require('../vault');
  const newPass = params.newPassphrase || process.env.KAIROS_NEW_MASTER_PASSPHRASE;
  if (!newPass) throw new Error('Provide --newPassphrase or KAIROS_NEW_MASTER_PASSPHRASE.');
  const out = v.rotateMasterPassphrase({ newPassphrase: newPass });
  io.log(`Master passphrase rotated. ${out.rotated} secret(s) re-encrypted.`);
}

async function verifyTextCli(params, io = { log: console.log, error: console.error }) {
  const base = String(params.apiBase || process.env.KAIROS_API_BASE || 'http://127.0.0.1:8787').replace(/\/$/, '');
  const apiKey = params.apiKey || process.env.KAIROS_API_KEY;
  if (!apiKey) throw new Error('Missing API key: set KAIROS_API_KEY or pass --api-key');
  const text = String(params.text || params.positionals.join(' ') || '').trim();
  if (!text) throw new Error('Missing text: use --text "..." or pass text as arguments after verify:text');
  const res = await fetch(`${base}/verify`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ text, channel: 'cli', region: { country: 'PT' } }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  io.log(JSON.stringify(json, null, 2));
}

async function verifyUrlCli(params, io = { log: console.log, error: console.error }) {
  const base = String(params.apiBase || process.env.KAIROS_API_BASE || 'http://127.0.0.1:8787').replace(/\/$/, '');
  const apiKey = params.apiKey || process.env.KAIROS_API_KEY;
  if (!apiKey) throw new Error('Missing API key: set KAIROS_API_KEY or pass --api-key');
  const target = String(params.url || params.positionals[0] || '').trim();
  if (!target) throw new Error('Missing URL: use --url https://... or pass URL as first argument');
  const res = await fetch(`${base}/scan-url`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ url: target, region: { country: 'PT' } }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || json.detail || `HTTP ${res.status}`);
  io.log(JSON.stringify(json, null, 2));
}

function validateStory(params, io = { log: console.log, error: console.error }) {
  const projectRoot = params.projectRoot || process.cwd();
  const storyId = normalizeStoryId(params.storyId);
  const filePath = resolveStoryPath(projectRoot, storyId);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Story file not found: ${path.relative(projectRoot, filePath)}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const missingSections = [];
  const requiredSections = [
    '## Status',
    '## Story',
    '## Acceptance Criteria',
    '## Tasks / Subtasks',
    '## Dev Agent Record',
    '### File List',
  ];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      missingSections.push(section);
    }
  }

  const fileListMatch = content.match(/### File List\s*\n([\s\S]*?)(\n### |\n## |\s*$)/);
  const fileListBody = (fileListMatch && fileListMatch[1] ? fileListMatch[1] : '').trim();
  const fileListHasEntry = /^-\s+\S+/m.test(fileListBody);
  const issues = [];

  if (missingSections.length > 0) {
    issues.push(`Missing sections: ${missingSections.join(', ')}`);
  }

  if (!fileListHasEntry) {
    issues.push('File List must contain at least one bullet entry.');
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      io.error(`- ${issue}`);
    }
    throw new Error(`Story ${storyId} failed validation.`);
  }

  io.log(`✅ Story ${storyId} passed validation.`);
}

async function runCli(argv = process.argv, io = { log: console.log, error: console.error }) {
  const parsed = parseArgs(argv);

  if (!parsed.command || parsed.command === 'help' || parsed.command === '--help' || parsed.command === '-h') {
    printHelp();
    return 0;
  }

  const known = [
    'start',
    'init-story', 'validate-story',
    'tenant:create', 'key:create', 'key:revoke',
    'vault:init', 'vault:set', 'vault:get', 'vault:list', 'vault:delete', 'vault:rotate',
    'agents:list', 'taskforce:list', 'sovereign:decide',
    'audit:verify',
    'compliance:purge', 'compliance:export', 'compliance:erase',
    'billing:plans', 'billing:usage',
    'verify:text', 'verify:url',
  ];
  if (!known.includes(parsed.command)) {
    io.error(`Unknown command: ${parsed.command}`);
    printHelp();
    return 1;
  }

  try {
    if (parsed.command === 'init-story') {
      initStory({
        storyId: parsed.positionals[0],
        title: parsed.title,
        force: parsed.force,
      }, io);
    }
    if (parsed.command === 'validate-story') {
      validateStory({ storyId: parsed.positionals[0] }, io);
    }
    if (parsed.command === 'tenant:create') {
      tenantCreate({
        tenantId: parsed.id || parsed.positionals[0],
        name: parsed.name,
        plan: parsed.plan,
        rate: parsed.rate,
      }, io);
    }
    if (parsed.command === 'key:create') {
      keyCreate({
        tenantId: parsed.tenant || parsed.positionals[0],
        label: parsed.label,
      }, io);
    }
    if (parsed.command === 'key:revoke') {
      keyRevoke({ key: parsed.key || parsed.positionals[0] }, io);
    }
    if (parsed.command === 'vault:init') vaultInit({}, io);
    if (parsed.command === 'vault:set') vaultSet({ name: parsed.name, value: parsed.value }, io);
    if (parsed.command === 'vault:get') vaultGet({ name: parsed.name }, io);
    if (parsed.command === 'vault:list') vaultList({}, io);
    if (parsed.command === 'vault:delete') vaultDelete({ name: parsed.name }, io);
    if (parsed.command === 'vault:rotate') vaultRotate({ newPassphrase: parsed.newPassphrase }, io);
    if (parsed.command === 'agents:list') {
      const sov = require('../sovereign');
      for (const a of sov.listAgents()) {
        io.log(`${a.id}\t${a.role || ''}\t${a.path}`);
      }
    }
    if (parsed.command === 'sovereign:decide') {
      const sov = require('../sovereign');
      const verdict = sov.decide({
        task: parsed.task || parsed.positionals.join(' '),
        brief: parsed.brief || '',
      });
      io.log(JSON.stringify(verdict, null, 2));
    }
    if (parsed.command === 'taskforce:list') {
      const sov = require('../sovereign');
      for (const f of sov.listTaskForces()) {
        io.log(`\n=== ${f.name} (${f.id}) ===`);
        io.log(`  ${f.mandate}`);
        for (const a of f.agents) {
          io.log(`  - ${a.id.padEnd(22)} ${a.responsibility}`);
        }
      }
    }
    if (parsed.command === 'compliance:purge') {
      const c = require('../compliance');
      const out = c.purgeStaleVerifications({ retentionDays: Number(parsed.retention) || 90 });
      io.log(`Purged ${out.purged} stale records (kept ${out.kept}).`);
    }
    if (parsed.command === 'compliance:export') {
      if (!parsed.subject) throw new Error('Missing --subject "<email|wallet>"');
      const c = require('../compliance');
      const out = c.exportRecordsForSubject({ subject: parsed.subject });
      io.log(JSON.stringify(out, null, 2));
    }
    if (parsed.command === 'compliance:erase') {
      if (!parsed.subject) throw new Error('Missing --subject "<email|wallet>"');
      const c = require('../compliance');
      const out = c.eraseRecordsForSubject({ subject: parsed.subject });
      io.log(`Erased ${out.erased} record(s) for pseudonym ${out.pseudonym}.`);
    }
    if (parsed.command === 'billing:plans') {
      const b = require('../billing');
      for (const p of Object.values(b.PLANS)) {
        io.log(`${p.id.padEnd(24)}\t${(p.priceEurMonthly === null ? 'custom' : `${p.priceEurMonthly}€/mo`).padEnd(10)}\t${p.rateLimitPerMinute}/min`);
      }
    }
    if (parsed.command === 'billing:usage') {
      const tenantId = parsed.tenant || parsed.positionals[0];
      if (!tenantId) throw new Error('Missing --tenant <tenantId>');
      const b = require('../billing');
      const used = b.currentUsage({ tenantId });
      io.log(`${tenantId}: ${used} verifications in current period.`);
    }
    if (parsed.command === 'audit:verify') {
      const db = require('../sniper-db');
      const out = db.verifyAuditChain();
      if (out.valid) {
        io.log(`✓ Audit chain valid. ${out.total} record(s). headHash=${out.headHash || '-'}`);
      } else {
        io.error(`✗ Audit chain BROKEN at index ${out.brokenAt} (${out.reason}).`);
        return 2;
      }
    }
    if (parsed.command === 'verify:text') {
      await verifyTextCli({
        text: parsed.text,
        apiBase: parsed.apiBase,
        apiKey: parsed.apiKey,
        positionals: parsed.positionals,
      }, io);
    }
    if (parsed.command === 'verify:url') {
      await verifyUrlCli({
        url: parsed.url,
        apiBase: parsed.apiBase,
        apiKey: parsed.apiKey,
        positionals: parsed.positionals,
      }, io);
    }
    if (parsed.command === 'start') {
      // One-command launch: bootstrap, optional vault init, then the API server.
      const db = require('../sniper-db');
      const boot = db.bootstrapIfEmpty();
      io.log('');
      io.log('  ╔══════════════════════════════════════════════════════════╗');
      io.log('  ║  KAIROS — Anti-Fraud Infrastructure                      ║');
      io.log('  ║  Booting empire ...                                      ║');
      io.log('  ╚══════════════════════════════════════════════════════════╝');
      io.log('');
      if (boot.bootstrapped && boot.bootstrapKeys) {
        io.log('  First boot — bootstrap keys (saved ONLY here):');
        io.log(`    internal: ${boot.bootstrapKeys.internal}`);
        io.log(`    bank:     ${boot.bootstrapKeys.bank}`);
        io.log(`    store:    ${boot.bootstrapKeys.store}`);
        io.log('');
      } else {
        io.log(`  Tenants: ${boot.tenants.length} loaded from .kairos-data/.`);
      }
      const audit = db.verifyAuditChain();
      io.log(audit.valid
        ? `  Audit chain: VALID (${audit.total} records).`
        : `  Audit chain: BROKEN at #${audit.brokenAt} (${audit.reason}).`);
      const vault = require('../vault');
      io.log(`  Vault initialized: ${vault.isVaultInitialized() ? 'yes' : 'no'}.`);
      io.log('');
      io.log('  Starting HTTP server (CTRL+C to stop) ...');
      io.log('');
      // Loading the server module triggers the listen call when run as main.
      // To make it run unconditionally from the CLI we re-fork with the
      // server.js as the entrypoint to preserve `require.main === module`.
      const { spawn } = require('child_process');
      const path = require('path');
      const serverPath = path.join(__dirname, '..', 'sniper-api', 'server.js');
      const child = spawn(process.execPath, [serverPath], {
        stdio: 'inherit',
        env: process.env,
      });
      return new Promise((resolve) => {
        child.on('exit', (code) => resolve(code || 0));
      });
    }
    return 0;
  } catch (error) {
    io.error(`❌ ${error.message}`);
    return 1;
  }
}

module.exports = {
  runCli,
  parseArgs,
  initStory,
  validateStory,
  tenantCreate,
  keyCreate,
  keyRevoke,
};
