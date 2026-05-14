#!/usr/bin/env node
/**
 * backup-volume.js — Kairos Check volume backup to Cloudflare R2
 *
 * Tars KAIROS_DB_DIR, computes SHA-256, uploads via AWS S3 SigV4 (manual,
 * zero external deps — uses node:crypto, node:fs, node:child_process, fetch).
 *
 * Required env vars:
 *   KAIROS_DB_DIR          — path to data dir (default: /app/.kairos-data)
 *   R2_BACKUP_BUCKET       — R2 bucket name (e.g. kairos-backups)
 *   R2_ENDPOINT            — https://<accountid>.r2.cloudflarestorage.com
 *   R2_ACCESS_KEY_ID       — R2 API token access key
 *   R2_SECRET_ACCESS_KEY   — R2 API token secret key
 *
 * Output: JSON line to stdout — { ts, sha, size, destination }
 * Exit 0 on success, 1 on any failure.
 */

'use strict';

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const os = require('node:os');

const DB_DIR          = process.env.KAIROS_DB_DIR        || '/app/.kairos-data';
const R2_BUCKET       = process.env.R2_BACKUP_BUCKET;
const R2_ENDPOINT_RAW = process.env.R2_ENDPOINT;
const ACCESS_KEY_ID   = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS   = process.env.R2_SECRET_ACCESS_KEY;

function die(msg) {
  process.stderr.write('[backup] ERROR: ' + msg + '\n');
  process.exit(1);
}

if (!R2_BUCKET)       die('R2_BACKUP_BUCKET is not set');
if (!R2_ENDPOINT_RAW) die('R2_ENDPOINT is not set');
if (!ACCESS_KEY_ID)   die('R2_ACCESS_KEY_ID is not set');
if (!SECRET_ACCESS)   die('R2_SECRET_ACCESS_KEY is not set');
if (!fs.existsSync(DB_DIR)) die('KAIROS_DB_DIR does not exist: ' + DB_DIR);

const now         = new Date();
const isoSafe     = now.toISOString().replace(/[:.]/g, '-');
const archiveFile = path.join(os.tmpdir(), `kairos-backup-${isoSafe}.tar.gz`);
const objectKey   = `kairos-backup-${isoSafe}.tar.gz`;

process.stderr.write(`[backup] Creating archive: ${archiveFile}\n`);
try {
  execSync(`tar -czf "${archiveFile}" -C "${DB_DIR}" .`, { stdio: 'inherit' });
} catch (err) {
  die('tar failed: ' + err.message);
}

const archiveData = fs.readFileSync(archiveFile);
const archiveSize = archiveData.length;
const sha256hex   = crypto.createHash('sha256').update(archiveData).digest('hex');
process.stderr.write(`[backup] SHA-256: ${sha256hex}  size: ${archiveSize} bytes\n`);

function dateStamp(d) { return d.toISOString().slice(0, 10).replace(/-/g, ''); }
function amzDate(d)   { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
function hmac(key, data) { return crypto.createHmac('sha256', key).update(data, 'utf8').digest(); }
function sha256(data)    { return crypto.createHash('sha256').update(data).digest('hex'); }

function signingKey(secretKey, datestamp, region, service) {
  const kDate    = hmac('AWS4' + secretKey, datestamp);
  const kRegion  = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function buildSignedPutRequest({ endpoint, bucket, key, body, accessKeyId, secretAccessKey, region, service, now }) {
  const ds  = dateStamp(now);
  const dt  = amzDate(now);
  const host = new URL(endpoint).host;
  const payloadHash = sha256(body);

  const canonicalHeaders =
    `content-type:application/octet-stream\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${dt}\n`;

  const signedHeaders  = 'content-type;host;x-amz-content-sha256;x-amz-date';
  const canonicalUri   = `/${bucket}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
  const canonicalRequest = ['PUT', canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const credentialScope  = `${ds}/${region}/${service}/aws4_request`;
  const stringToSign     = ['AWS4-HMAC-SHA256', dt, credentialScope, sha256(canonicalRequest)].join('\n');
  const kSign            = signingKey(secretAccessKey, ds, region, service);
  const signature        = hmac(kSign, stringToSign).toString('hex');
  const authorization    = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url: `${endpoint}/${bucket}/${key}`,
    headers: {
      'Authorization':        authorization,
      'Content-Type':         'application/octet-stream',
      'Content-Length':       String(body.length),
      'Host':                 host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date':           dt,
    },
  };
}

const R2_ENDPOINT = R2_ENDPOINT_RAW.replace(/\/$/, '');

const { url, headers } = buildSignedPutRequest({
  endpoint: R2_ENDPOINT, bucket: R2_BUCKET, key: objectKey, body: archiveData,
  accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS,
  region: 'auto', service: 's3', now,
});

const destination = `r2://${R2_BUCKET}/${objectKey}`;
process.stderr.write(`[backup] Uploading to ${destination} ...\n`);

(async () => {
  let res;
  try {
    res = await fetch(url, { method: 'PUT', headers, body: archiveData });
  } catch (err) {
    die('Network error during upload: ' + err.message);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    die(`R2 upload failed — HTTP ${res.status}: ${text}`);
  }

  process.stderr.write(`[backup] Upload complete — HTTP ${res.status}\n`);
  try { fs.unlinkSync(archiveFile); } catch (_) {}

  process.stdout.write(JSON.stringify({ ts: now.toISOString(), sha: sha256hex, size: archiveSize, destination }) + '\n');
  process.exit(0);
})();
