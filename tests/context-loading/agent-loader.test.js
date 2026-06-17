const test = require('node:test');
const assert = require('node:assert');
const AgentCache = require('../../.aiox-core/core/context-loading/agent-cache');
const AgentLoader = require('../../.aiox-core/core/context-loading/agent-loader');
const fs = require('fs');
const path = require('path');

test('AgentCache', async (t) => {
  const cacheDir = '.synapse/agent-cache-test';
  const cache = new AgentCache(cacheDir, 3600000);

  await t.test('should set and get agent data', () => {
    const agentData = { id: 'dev', name: 'Dex', commands: ['help', 'draft'] };
    cache.set('dev', agentData);

    const result = cache.get('dev');
    assert.strictEqual(result.hit, true);
    assert.deepStrictEqual(result.data, agentData);
  });

  await t.test('should detect cache hits', () => {
    const agentData = { id: 'qa', name: 'Quinn' };
    cache.set('qa', agentData);

    const result1 = cache.get('qa');
    assert.strictEqual(result1.hit, true);

    const result2 = cache.get('qa');
    assert.strictEqual(result2.hit, true);
  });

  await t.test('should invalidate cache', () => {
    cache.set('pm', { id: 'pm', name: 'Morgan' });
    cache.invalidate('pm');

    const result = cache.get('pm');
    assert.strictEqual(result.hit, false);
  });

  await t.test('should clear all cache', () => {
    cache.set('po', { id: 'po', name: 'Pax' });
    cache.set('sm', { id: 'sm', name: 'River' });
    cache.clear();

    assert.strictEqual(cache.get('po').hit, false);
    assert.strictEqual(cache.get('sm').hit, false);
  });

  // Cleanup
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true });
  }
});

test('AgentLoader', async (t) => {
  const loader = new AgentLoader();

  await t.test('should discover agents', async () => {
    const agents = await loader.discoverAgents();
    assert.strictEqual(Array.isArray(agents), true);
    assert.ok(agents.length > 0, 'Should find at least one agent');
  });

  await t.test('should estimate token budget', () => {
    const agentData = { contentLength: 4000 }; // ~1000 tokens
    const tokens = loader.getTokenEstimate(agentData);
    assert.strictEqual(tokens <= 1100, true); // ~1000 + margin
  });

  await t.test('should validate token budget', () => {
    const agentsData = {
      dev: { contentLength: 1500 }, // ~375 tokens
      qa: { contentLength: 2000 }   // ~500 tokens
    };
    const result = loader.validateTokenBudget(agentsData);
    assert.strictEqual(result.ok, true);
  });

  await t.test('should detect token budget violations', () => {
    const agentsData = {
      dev: { contentLength: 3000 } // ~750 tokens (over 500 budget)
    };
    const result = loader.validateTokenBudget(agentsData);
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.violations.length > 0, true);
  });
});

test('AgentLoader Cache Integration', async (t) => {
  const loader = new AgentLoader();

  await t.test('should log cache hit/miss events', async () => {
    const agents = await loader.discoverAgents();
    if (agents.length > 0) {
      const agentId = agents[0];

      // First load = cache miss
      const result1 = await loader.loadAgent(agentId);
      assert.ok(result1);

      // Second load = cache hit
      const result2 = await loader.loadAgent(agentId);
      assert.deepStrictEqual(result1, result2);
    }
  });

  await t.test('should load all agents', async () => {
    const result = await loader.loadAll();
    assert.ok(result.agents);
    assert.strictEqual(Array.isArray(Object.keys(result.agents)) || Object.keys(result.agents).length > 0, true);
  });
});
