// API Key generation and validation
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const KEY_PREFIX = 'sk_live_';
const KEY_LENGTH = 32; // total key = prefix + 24 random chars

function generateKey() {
  const random = crypto.randomBytes(18).toString('hex'); // 18 bytes = 36 hex chars
  const key = KEY_PREFIX + random.substring(0, 24);
  return key;
}

async function hashKey(key) {
  return bcrypt.hash(key, SALT_ROUNDS);
}

async function verifyKey(key, hash) {
  return bcrypt.compare(key, hash);
}

function getLastFourChars(key) {
  // Returns last 4 chars of key for display: sk_live_...a1b2
  return key.substring(key.length - 4);
}

module.exports = {
  generateKey,
  hashKey,
  verifyKey,
  getLastFourChars,
};
