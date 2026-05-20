'use strict';
// HYPERDRIVE — Resource Allocator (stub — implementação completa: ADR-014)
class ResourceAllocator {
  constructor(agents) { this.agents = agents; }
  score(agent, domain) {
    const domainScore = (agent.domains || []).includes(domain) ? 0.2 : 0;
    return (agent.baseConfidence || 0.75) + domainScore;
  }
  bestFor(domain, excludeIds = []) {
    return this.agents
      .filter(a => !excludeIds.includes(a.id))
      .sort((a, b) => this.score(b, domain) - this.score(a, domain))[0] || null;
  }
}
module.exports = { ResourceAllocator };
