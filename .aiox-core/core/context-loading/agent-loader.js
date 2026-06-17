const fs = require('fs');
const path = require('path');
const glob = require('glob');
const AgentCache = require('./agent-cache');

class AgentLoader {
  constructor(projectRoot = process.cwd(), cacheDir = '.synapse/agent-cache') {
    this.projectRoot = projectRoot;
    this.cache = new AgentCache(cacheDir);
    this.agentsPattern = '.claude/skills/AIOX/agents/*/SKILL.md';
    this.logDir = path.join(projectRoot, '.aiox/context-load-logs');
  }

  async discoverAgents() {
    const skillsDir = path.join(this.projectRoot, '.claude/skills/AIOX/agents');
    if (!fs.existsSync(skillsDir)) {
      return [];
    }

    const agents = fs.readdirSync(skillsDir).filter(dir => {
      const skillFile = path.join(skillsDir, dir, 'SKILL.md');
      return fs.existsSync(skillFile);
    });

    return agents;
  }

  async loadAgent(agentId) {
    const cacheResult = this.cache.get(agentId);
    if (cacheResult.hit) {
      this._logEvent('cache_hit', { agent: agentId });
      return cacheResult.data;
    }

    const skillPath = path.join(this.projectRoot, `.claude/skills/AIOX/agents/${agentId}/SKILL.md`);
    if (!fs.existsSync(skillPath)) {
      this._logEvent('agent_not_found', { agent: agentId });
      throw new Error(`Agent SKILL.md not found: ${agentId}`);
    }

    const content = fs.readFileSync(skillPath, 'utf-8');
    const agentData = {
      id: agentId,
      skillPath,
      contentLength: content.length,
      timestamp: new Date().toISOString()
    };

    // Validate persona/commands loaded
    const hasPersona = content.includes('persona');
    const hasCommands = content.includes('commands');

    agentData.validated = hasPersona && hasCommands;

    this.cache.set(agentId, agentData);
    this._logEvent('cache_miss', { agent: agentId, contentLength: content.length });

    return agentData;
  }

  async loadAll() {
    const agents = await this.discoverAgents();
    const results = {};
    const errors = [];

    for (const agentId of agents) {
      try {
        results[agentId] = await this.loadAgent(agentId);
      } catch (err) {
        errors.push({ agent: agentId, error: err.message });
      }
    }

    this._logEvent('load_all_complete', {
      agentsLoaded: Object.keys(results).length,
      agentsFailed: errors.length,
      expectedCount: 11
    });

    return { agents: results, errors, totalLoaded: Object.keys(results).length };
  }

  getTokenEstimate(agentData) {
    // Rough estimate: ~1 token per 4 characters
    return Math.ceil(agentData.contentLength / 4);
  }

  validateTokenBudget(agentsData) {
    const budgetPerAgent = 500;
    const violations = [];

    for (const [agentId, data] of Object.entries(agentsData)) {
      const tokens = this.getTokenEstimate(data);
      if (tokens > budgetPerAgent) {
        violations.push({ agent: agentId, tokens, budget: budgetPerAgent });
      }
    }

    return { ok: violations.length === 0, violations };
  }

  _logEvent(eventType, data) {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${today}.jsonl`);

    const logEntry = {
      timestamp: new Date().toISOString(),
      event: eventType,
      ...data
    };

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  }
}

module.exports = AgentLoader;
