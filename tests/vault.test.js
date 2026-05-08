'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const vault = require('../packages/vault');

function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-vault-')); }

const STRONG_PASS = 'a-very-strong-test-passphrase-123!';

test('initVault creates encrypted file with mode 0600 and refuses re-init', () => {
  const dir = tmpDir();
  process.env.KAIROS_MASTER_PASSPHRASE = STRONG_PASS;
  vault.initVault({ dir });
  const filePath = vault.vaultPath(dir);
  assert.ok(fs.existsSync(filePath));
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.equal(content.algo, 'aes-256-gcm');
  assert.ok(content.salt);
  assert.ok(content.verifier.ct);
  assert.throws(() => vault.initVault({ dir }), /ALREADY_INIT|already initialized/i);
});

test('initVault rejects weak passphrases', () => {
  const dir = tmpDir();
  process.env.KAIROS_MASTER_PASSPHRASE = 'short';
  assert.throws(() => vault.initVault({ dir }), /WEAK_PASSPHRASE|too short/i);
});

test('setSecret + getSecret roundtrip with AES-256-GCM', () => {
  const dir = tmpDir();
  process.env.KAIROS_MASTER_PASSPHRASE = STRONG_PASS;
  vault.initVault({ dir });
  vault.setSecret('GOOGLE_SAFE_BROWSING_KEY', 'AIzaSyExampleSecretValue', { dir });
  const got = vault.getSecret('GOOGLE_SAFE_BROWSING_KEY', { dir });
  assert.equal(got, 'AIzaSyExampleSecretValue');
});

test('wrong passphrase fails fast with BAD_PASSPHRASE', () => {
  const dir = tmpDir();
  process.env.KAIROS_MASTER_PASSPHRASE = STRONG_PASS;
  vault.initVault({ dir });
  vault.setSecret('FOO', 'bar', { dir });
  assert.throws(
    () => vault.getSecret('FOO', { dir, passphrase: 'wrong-passphrase-attempt!' }),
    /BAD_PASSPHRASE|Wrong/i
  );
});

test('listSecrets returns names only, not plaintext', () => {
  const dir = tmpDir();
  process.env.KAIROS_MASTER_PASSPHRASE = STRONG_PASS;
  vault.initVault({ dir });
  vault.setSecret('A', 'plain-A', { dir });
  vault.setSecret('B', 'plain-B', { dir });
  const items = vault.listSecrets({ dir });
  assert.equal(items.length, 2);
  for (const it of items) {
    const flat = JSON.stringify(it);
    assert.ok(!flat.includes('plain-A'));
    assert.ok(!flat.includes('plain-B'));
  }
});

test('deleteSecret removes the entry', () => {
  const dir = tmpDir();
  process.env.KAIROS_MASTER_PASSPHRASE = STRONG_PASS;
  vault.initVault({ dir });
  vault.setSecret('X', 'value-x', { dir });
  assert.equal(vault.deleteSecret('X', { dir }), true);
  assert.equal(vault.getSecret('X', { dir }), null);
});

test('rotateMasterPassphrase re-encrypts every secret', () => {
  const dir = tmpDir();
  process.env.KAIROS_MASTER_PASSPHRASE = STRONG_PASS;
  vault.initVault({ dir });
  vault.setSecret('S1', 'v1', { dir });
  vault.setSecret('S2', 'v2', { dir });
  const NEW_PASS = 'an-equally-strong-rotation-pass-456!';
  const out = vault.rotateMasterPassphrase({
    oldPassphrase: STRONG_PASS,
    newPassphrase: NEW_PASS,
    dir,
  });
  assert.equal(out.rotated, 2);
  // Old passphrase fails.
  assert.throws(
    () => vault.getSecret('S1', { dir, passphrase: STRONG_PASS }),
    (err) => err && err.code === 'BAD_PASSPHRASE'
  );
  // New passphrase works.
  assert.equal(vault.getSecret('S1', { dir, passphrase: NEW_PASS }), 'v1');
  assert.equal(vault.getSecret('S2', { dir, passphrase: NEW_PASS }), 'v2');
});

test('tampered ciphertext is detected by GCM auth tag', () => {
  const dir = tmpDir();
  process.env.KAIROS_MASTER_PASSPHRASE = STRONG_PASS;
  vault.initVault({ dir });
  vault.setSecret('TAMPER', 'original-value', { dir });
  const filePath = vault.vaultPath(dir);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // Flip a bit in the ciphertext.
  const ctBuf = Buffer.from(data.secrets.TAMPER.ct, 'base64');
  ctBuf[0] ^= 0xff;
  data.secrets.TAMPER.ct = ctBuf.toString('base64');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  assert.throws(() => vault.getSecret('TAMPER', { dir }));
});
