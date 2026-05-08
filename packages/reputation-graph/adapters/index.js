// KAIROS Reputation Graph — Adapter selector
// The graph operates in two modes:
//   - JSON adapter (default): single-process, on-disk, zero infrastructure.
//   - Redis adapter (production): multi-region, multi-process, low-latency.
//
// Switching is purely a deployment decision: set KAIROS_RG_ADAPTER=redis and
// KAIROS_REDIS_URL=redis://... — code paths above the adapter never change.

'use strict';

const path = require('node:path');
const { createJsonAdapter } = require('./json-adapter');

const DEFAULT_DIR = process.env.KAIROS_DB_DIR
  || path.join(process.cwd(), '.kairos-data');

function createAdapter({ dir = DEFAULT_DIR, mode = process.env.KAIROS_RG_ADAPTER || 'json' } = {}) {
  if (mode === 'json') return createJsonAdapter({ dir });
  if (mode === 'redis') {
    // Lazy require so JSON-only deployments never load the Redis adapter.
    const { createRedisAdapter } = require('./redis-adapter');
    return createRedisAdapter({ url: process.env.KAIROS_REDIS_URL });
  }
  throw new Error(`reputation-graph: unknown adapter mode "${mode}"`);
}

module.exports = { createAdapter };
