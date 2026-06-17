const fs = require('fs');
const path = require('path');

class AgentCache {
  constructor(cacheDir = '.synapse/agent-cache', ttlMs = 3600000) {
    this.cacheDir = cacheDir;
    this.ttlMs = ttlMs;
    this.memoryCache = new Map();
  }

  getCacheKey(agentId) {
    return `${agentId}`;
  }

  getCachePath(agentId) {
    return path.join(this.cacheDir, `${agentId}.json`);
  }

  isExpired(metadata) {
    if (!metadata?.timestamp) return true;
    return Date.now() - metadata.timestamp > this.ttlMs;
  }

  get(agentId) {
    const key = this.getCacheKey(agentId);

    if (this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (!this.isExpired(cached.metadata)) {
        return { hit: true, data: cached.data };
      }
      this.memoryCache.delete(key);
    }

    const diskPath = this.getCachePath(agentId);
    if (fs.existsSync(diskPath)) {
      try {
        const diskData = JSON.parse(fs.readFileSync(diskPath, 'utf-8'));
        if (!this.isExpired(diskData.metadata)) {
          this.memoryCache.set(key, diskData);
          return { hit: true, data: diskData.data };
        }
        fs.unlinkSync(diskPath);
      } catch (err) {
        // Corrupted cache, ignore
      }
    }

    return { hit: false, data: null };
  }

  set(agentId, data) {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    const cacheData = {
      metadata: { timestamp: Date.now(), agentId },
      data
    };

    const key = this.getCacheKey(agentId);
    this.memoryCache.set(key, cacheData);

    const diskPath = this.getCachePath(agentId);
    fs.writeFileSync(diskPath, JSON.stringify(cacheData, null, 2));
  }

  invalidate(agentId) {
    const key = this.getCacheKey(agentId);
    this.memoryCache.delete(key);
    const diskPath = this.getCachePath(agentId);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }
  }

  clear() {
    this.memoryCache.clear();
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    }
  }
}

module.exports = AgentCache;
