'use strict';

/**
 * HYPERDRIVE — Agent Loader
 * Carrega perfis de agentes de .claude/agents/*.md
 * Extrai: id, role, specialty, tier, okrs, slas, domains, reports_to
 */

const fs   = require('node:fs');
const path = require('node:path');

const ROOT        = path.resolve(__dirname, '..', '..', '..', '..');
const AGENTS_DIR  = path.join(ROOT, '.claude', 'agents');

const TIER_KEYWORDS = { c_suite: ['ceo', 'cto', 'cfo', 'coo'], vp: ['vp', 'lead', 'head'], senior: ['senior', 'principal', 'staff'], mid: [], junior: ['junior', 'associate'] };

function inferTier(role = '') {
  const lower = role.toLowerCase();
  for (const [tier, kws] of Object.entries(TIER_KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) return tier;
  }
  return 'mid';
}

function parseMarkdown(id, content) {
  const lines = content.split('\n');

  // Role from first ## heading
  const roleMatch = content.match(/^##\s+(.+)$/m);
  const role = roleMatch ? roleMatch[1].trim().replace(/^[A-Z]+\s*[—–-]\s*/, '') : id;

  // Specialty from "Specialty" section or bullet
  const specialtyMatch = content.match(/\*\*Specialty\*\*[:\s]+(.+)/i) ||
                         content.match(/specialty[:\s]+(.+)/i);
  const specialty = specialtyMatch ? specialtyMatch[1].trim() : '';

  // Reports To
  const reportsMatch = content.match(/Reports?\s+[Tt]o[:\s]+(.+)/);
  const reports_to   = reportsMatch ? reportsMatch[1].trim().split(/[,\s]+/)[0] : 'CEO';

  // OKRs — extract KR lines
  const okrs = [];
  const krMatches = [...content.matchAll(/\*\*KR\d+\*\*[:\s]+(.+)/g)];
  for (const m of krMatches) okrs.push(m[1].trim());

  // SLAs
  const slas = [];
  const slaSection = content.match(/##\s*SLAs?([\s\S]*?)(?=^##|\Z)/m);
  if (slaSection) {
    const slaLines = slaSection[1].match(/[-*]\s+(.+)/g) || [];
    for (const l of slaLines) slas.push(l.replace(/^[-*]\s+/, '').trim());
  }

  // Base confidence
  const confMatch = content.match(/Base\s+Confidence[:\s]+([\d.]+)/i);
  const baseConfidence = confMatch ? parseFloat(confMatch[1]) : 0.75;

  // Domains validated
  const domains = [];
  const domainMatches = [...content.matchAll(/✅\s+([^\(]+)\([^)]+\)/g)];
  for (const m of domainMatches) domains.push(m[1].trim());

  return {
    id:             id.replace('.md', ''),
    role,
    specialty,
    tier:           inferTier(role),
    reports_to,
    okrs,
    slas,
    baseConfidence,
    domains,
    raw:            content.slice(0, 500), // primeiros 500 chars para context
  };
}

function loadAgents() {
  if (!fs.existsSync(AGENTS_DIR)) {
    // Fallback: agentes básicos hardcoded
    return [
      { id: '@Orion',  role: 'Repository Guardian',     tier: 'mid',    baseConfidence: 0.80, specialty: 'repo maintenance' },
      { id: '@Dex',    role: 'Senior Engineer',          tier: 'senior', baseConfidence: 0.82, specialty: 'Node.js, Next.js' },
      { id: '@Quinn',  role: 'QA Lead',                  tier: 'senior', baseConfidence: 0.85, specialty: 'quality, testing' },
      { id: '@Gage',   role: 'DevOps Lead',              tier: 'mid',    baseConfidence: 0.80, specialty: 'deploy, CI/CD' },
      { id: '@Aria',   role: 'Principal Architect',      tier: 'vp',     baseConfidence: 0.88, specialty: 'architecture, ADRs' },
      { id: '@Uma',    role: 'Design Intelligence Lead', tier: 'vp',     baseConfidence: 0.83, specialty: 'UI/UX, design system' },
      { id: '@Sage',   role: 'Business Architect',       tier: 'vp',     baseConfidence: 0.87, specialty: 'strategy, economics' },
      { id: '@Morgan', role: 'Growth Lead',              tier: 'vp',     baseConfidence: 0.82, specialty: 'SEO, distribution' },
      { id: '@Hermes', role: 'Sales & Revenue Lead',     tier: 'vp',     baseConfidence: 0.80, specialty: 'outreach, B2B' },
      { id: '@Oracle', role: 'Analytics Lead',           tier: 'vp',     baseConfidence: 0.86, specialty: 'metrics, forecasts' },
      { id: '@Rex',    role: 'Security & GDPR Lead',     tier: 'vp',     baseConfidence: 0.85, specialty: 'security, compliance' },
    ];
  }

  const agents = [];
  for (const file of fs.readdirSync(AGENTS_DIR)) {
    if (!file.endsWith('.md')) continue;
    try {
      const content = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
      const id = '@' + file.replace('.md', '').charAt(0).toUpperCase() + file.replace('.md', '').slice(1);
      agents.push(parseMarkdown(id, content));
    } catch { /* skip corrupt files */ }
  }

  return agents.length > 0 ? agents : loadAgents(); // recurse to fallback if empty
}

function getAgent(agents, id) {
  return agents.find(a => a.id === id || a.id.toLowerCase() === id.toLowerCase()) || null;
}

module.exports = { loadAgents, getAgent };
