'use strict';

/**
 * KAIROS CHECK ENGINE — Entry Point
 * Pode ser usado como servidor HTTP ou como library.
 */

const { createServer } = require('./api/server');
const { handleCheck }  = require('./api/routes/check');
const { aggregate }    = require('./scoring/aggregator');
const { explain }      = require('./scoring/explainer');
const { evaluate }     = require('./scoring/rules-engine');

// Library API (para uso directo em código)
async function check(input, opts = {}) {
  const result = await handleCheck(input, { key: 'internal', mode: 'live' });
  return result.body;
}

// Start como servidor
if (require.main === module) {
  createServer();
}

module.exports = { check, createServer, aggregate, explain, evaluate };
