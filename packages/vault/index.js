// KAIROS — The Vault v1
// Encrypted secret store backed by a single JSON file.
// Algorithm: AES-256-GCM with per-secret IV.
// Master key: scrypt(passphrase, salt, 32) where salt is stored in the vault
//             header. Passphrase is read from process.env.KAIROS_MASTER_PASSPHRASE
//             and never persisted on disk.
// Atomic writes via tmp+rename. Tamper detection via auth tag on every secret.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 12;
const TAG_LEN = 16;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

const DEFAULT_VAULT_DIR = process.env.KAIROS_VAULT_DIR
  || path.join(process.cwd(), '.kairos-data');
const VAULT_FILE = 'vault.json';

class VaultError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'VaultError';
  }
}

function vaultPath(dir = DEFAULT_VAULT_DIR) {
  return path.join(dir, VAULT_FILE);
}

// Cheap inspection: returns true if a vault file exists. Does NOT decrypt or
// expose any secret. Safe to call from /health.
function isVaultInitialized(dir = DEFAULT_VAULT_DIR) {
  return fs.existsSync(vaultPath(dir));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readVaultFile(dir = DEFAULT_VAULT_DIR) {
  const p = vaultPath(dir);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  if (!raw) return null;
  return JSON.parse(raw);
}

function writeVaultFileAtomic(payload, dir = DEFAULT_VAULT_DIR) {
  ensureDir(dir);
  const p = vaultPath(dir);
  const tmp = `${p}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tmp, p);
  try { fs.chmodSync(p, 0o600); } catch { /* best-effort on Windows */ }
}

function deriveKey(passphrase, saltB64) {
  const salt = Buffer.from(saltB64, 'base64');
  return crypto.scryptSync(String(passphrase), salt, KEY_LEN, SCRYPT_OPTS);
}

function getPassphrase(passphrase) {
  const pass = passphrase || process.env.KAIROS_MASTER_PASSPHRASE;
  if (!pass || String(pass).length < 12) {
    throw new VaultError(
      'KAIROS_MASTER_PASSPHRASE missing or too short (min 12 chars).',
      'WEAK_PASSPHRASE'
    );
  }
  return String(pass);
}

function initVault({ dir = DEFAULT_VAULT_DIR, passphrase } = {}) {
  if (readVaultFile(dir)) {
    throw new VaultError('Vault already initialized.', 'ALREADY_INIT');
  }
  const pass = getPassphrase(passphrase);
  const salt = crypto.randomBytes(16).toString('base64');
  const key = deriveKey(pass, salt);
  // Verifier: encrypt a known marker so we can detect wrong passphrase later.
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update('KAIROS_VAULT_OK_v1', 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const verifier = {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ct: enc.toString('base64'),
  };
  const payload = {
    version: 1,
    algo: ALGO,
    kdf: 'scrypt',
    salt,
    verifier,
    secrets: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeVaultFileAtomic(payload, dir);
  return payload;
}

function loadAndUnlock({ dir = DEFAULT_VAULT_DIR, passphrase } = {}) {
  const vault = readVaultFile(dir);
  if (!vault) throw new VaultError('Vault not initialized. Run kairos vault:init.', 'NOT_INIT');
  const pass = getPassphrase(passphrase);
  const key = deriveKey(pass, vault.salt);
  // Verify passphrase against the stored verifier.
  try {
    const iv = Buffer.from(vault.verifier.iv, 'base64');
    const tag = Buffer.from(vault.verifier.tag, 'base64');
    const ct = Buffer.from(vault.verifier.ct, 'base64');
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const out = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
    if (out !== 'KAIROS_VAULT_OK_v1') throw new Error('verifier mismatch');
  } catch {
    throw new VaultError('Wrong KAIROS_MASTER_PASSPHRASE.', 'BAD_PASSPHRASE');
  }
  return { vault, key };
}

function encryptValue(plaintext, key) {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ct: enc.toString('base64'),
  };
}

function decryptValue(record, key) {
  const iv = Buffer.from(record.iv, 'base64');
  const tag = Buffer.from(record.tag, 'base64');
  const ct = Buffer.from(record.ct, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

function setSecret(name, value, opts = {}) {
  if (!name || typeof name !== 'string') throw new VaultError('Secret name required.', 'BAD_INPUT');
  if (typeof value !== 'string') throw new VaultError('Secret value must be string.', 'BAD_INPUT');
  const { vault, key } = loadAndUnlock(opts);
  const record = encryptValue(value, key);
  vault.secrets[name] = {
    ...record,
    createdAt: vault.secrets[name]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  vault.updatedAt = new Date().toISOString();
  writeVaultFileAtomic(vault, opts.dir);
  return { name, updatedAt: vault.secrets[name].updatedAt };
}

function getSecret(name, opts = {}) {
  const { vault, key } = loadAndUnlock(opts);
  const record = vault.secrets[name];
  if (!record) return null;
  return decryptValue(record, key);
}

function deleteSecret(name, opts = {}) {
  const { vault } = loadAndUnlock(opts);
  if (!vault.secrets[name]) return false;
  delete vault.secrets[name];
  vault.updatedAt = new Date().toISOString();
  writeVaultFileAtomic(vault, opts.dir);
  return true;
}

function listSecrets(opts = {}) {
  const { vault } = loadAndUnlock(opts);
  return Object.keys(vault.secrets).map((name) => ({
    name,
    createdAt: vault.secrets[name].createdAt,
    updatedAt: vault.secrets[name].updatedAt,
  }));
}

function rotateMasterPassphrase({ oldPassphrase, newPassphrase, dir = DEFAULT_VAULT_DIR }) {
  if (!newPassphrase || String(newPassphrase).length < 12) {
    throw new VaultError('New passphrase too short (min 12 chars).', 'WEAK_PASSPHRASE');
  }
  const { vault, key: oldKey } = loadAndUnlock({ dir, passphrase: oldPassphrase });
  // Decrypt all secrets with old key.
  const decrypted = {};
  for (const [name, rec] of Object.entries(vault.secrets)) {
    decrypted[name] = decryptValue(rec, oldKey);
  }
  // Re-init salt + key with new passphrase.
  const newSalt = crypto.randomBytes(16).toString('base64');
  const newKey = deriveKey(newPassphrase, newSalt);
  const verifierIv = crypto.randomBytes(IV_LEN);
  const verifierCipher = crypto.createCipheriv(ALGO, newKey, verifierIv);
  const verifierEnc = Buffer.concat([verifierCipher.update('KAIROS_VAULT_OK_v1', 'utf8'), verifierCipher.final()]);
  vault.salt = newSalt;
  vault.verifier = {
    iv: verifierIv.toString('base64'),
    tag: verifierCipher.getAuthTag().toString('base64'),
    ct: verifierEnc.toString('base64'),
  };
  vault.secrets = {};
  for (const [name, plain] of Object.entries(decrypted)) {
    vault.secrets[name] = {
      ...encryptValue(plain, newKey),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  vault.updatedAt = new Date().toISOString();
  writeVaultFileAtomic(vault, dir);
  return { rotated: Object.keys(decrypted).length };
}

module.exports = {
  VaultError,
  initVault,
  setSecret,
  getSecret,
  deleteSecret,
  listSecrets,
  rotateMasterPassphrase,
  vaultPath,
  isVaultInitialized,
  DEFAULT_VAULT_DIR,
};
