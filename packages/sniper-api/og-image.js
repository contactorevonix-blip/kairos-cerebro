'use strict';

// OG image generator — pure Node.js, zero dependencies
// 1200×630 PNG for kairoscheck.net social sharing (Twitter, LinkedIn, Product Hunt)

const zlib = require('zlib');

const W = 1200, H = 630;

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const BG    = [6,   6,   6  ];
const CARD  = [13,  13,  13 ];
const STRIP = [10,  10,  10 ];
const GREEN = [0,   217, 126];
const BLACK = [0,   0,   0  ];

// ─── PIXEL BUFFER ─────────────────────────────────────────────────────────────
function makeCanvas() {
  const px = new Uint8Array(W * H * 3);

  function setpx(x, y, r, g, b) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = (y * W + x) * 3;
    px[i] = r; px[i + 1] = g; px[i + 2] = b;
  }

  function rect(x, y, w, h, [r, g, b]) {
    const x1 = Math.max(0, x), y1 = Math.max(0, y);
    const x2 = Math.min(W, x + w), y2 = Math.min(H, y + h);
    for (let cy = y1; cy < y2; cy++)
      for (let cx = x1; cx < x2; cx++) {
        const i = (cy * W + cx) * 3;
        px[i] = r; px[i + 1] = g; px[i + 2] = b;
      }
  }

  function blend(x, y, [r, g, b], a) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = (y * W + x) * 3;
    px[i]   = Math.round(px[i]   * (1 - a) + r * a);
    px[i+1] = Math.round(px[i+1] * (1 - a) + g * a);
    px[i+2] = Math.round(px[i+2] * (1 - a) + b * a);
  }

  // ── Background ──────────────────────────────────────────────────────────────
  rect(0, 0, W, H, BG);

  // Subtle horizontal scan lines
  for (let y = 0; y < H; y += 60)
    for (let x = 0; x < W; x++) blend(x, y, [255, 255, 255], 0.02);

  // Top-left radial brightening
  for (let y = 0; y < 200; y++)
    for (let x = 0; x < 300; x++) {
      const d = Math.sqrt((x / 300) ** 2 + (y / 200) ** 2);
      if (d < 1) blend(x, y, [255, 255, 255], (1 - d) * 0.05);
    }

  // ── Accent bars ─────────────────────────────────────────────────────────────
  rect(0, 0, W, 5, GREEN);
  rect(0, H - 5, W, 5, GREEN);

  // ── Card ────────────────────────────────────────────────────────────────────
  const M = 60;
  rect(M, M, W - M * 2, H - M * 2, CARD);

  // Left green stripe
  rect(M, M, 5, H - M * 2, GREEN);

  // ── Shield (left section, vertically centred in card) ───────────────────────
  const SX = M + 60, SY = M + 65, SW = 210, SH = 300;

  // Shield upper body
  const bh = Math.round(SH * 0.58);
  rect(SX, SY, SW, bh, GREEN);

  // Shield converging mid-section
  const mh = Math.round(SH * 0.3);
  for (let row = 0; row < mh; row++) {
    const t  = row / mh;
    const w  = Math.max(4, Math.round(SW * (1 - t * 0.55)));
    const xo = Math.round((SW - w) / 2);
    rect(SX + xo, SY + bh + row, w, 1, GREEN);
  }

  // Shield tip
  const th = Math.round(SH * 0.12);
  const ty = SY + bh + mh;
  for (let row = 0; row < th; row++) {
    const t = row / th;
    const w = Math.max(2, Math.round(SW * 0.45 * (1 - t)));
    const xo = Math.round((SW - w) / 2);
    rect(SX + xo, ty + row, w, 1, GREEN);
  }

  // ── K inside shield ─────────────────────────────────────────────────────────
  const KX = SX + 52, KY = SY + 52, KH = Math.round(SH * 0.48), ST = 20;

  // Vertical bar of K
  rect(KX, KY, ST, KH, BLACK);

  // Upper arm (diagonal: up-right)
  const armLen = Math.round(KH * 0.52);
  for (let i = 0; i < armLen; i++) {
    const yo = Math.round((armLen - i) * (KH / 2) / armLen);
    rect(KX + ST + i, KY + Math.round(KH / 2) - yo, ST, 1, BLACK);
  }

  // Lower arm (diagonal: down-right)
  for (let i = 0; i < armLen; i++) {
    const yo = Math.round(i * (KH / 2) / armLen);
    rect(KX + ST + i, KY + Math.round(KH / 2) + yo, ST, 1, BLACK);
  }

  // ── Decorative right section ─────────────────────────────────────────────────
  // Subtle vertical code lines (grey stripes)
  for (let x = 700; x < 1100; x += 40) {
    const lineH = 60 + Math.floor(((x * 17 + 3) % 200));
    const lineY = 120 + Math.floor(((x * 11 + 7) % 150));
    for (let y = lineY; y < lineY + lineH; y++)
      blend(x, y, [255, 255, 255], 0.04);
  }

  // Green dot grid (accent)
  for (let dy = 0; dy < 8; dy++)
    for (let dx = 0; dx < 5; dx++) {
      const gx = 880 + dx * 35, gy = 180 + dy * 35;
      for (let py = 0; py < 3; py++)
        for (let px2 = 0; px2 < 3; px2++)
          blend(gx + px2, gy + py, GREEN, 0.18);
    }

  // ── Bottom info strip ────────────────────────────────────────────────────────
  rect(M + 5, H - M - 60, W - M * 2 - 10, 60, STRIP);
  rect(M + 5, H - M - 61, W - M * 2 - 10, 1, [20, 20, 20]);

  // Three status dots (green, green, grey)
  for (let d = 0; d < 3; d++) {
    const col = d < 2 ? GREEN : [50, 50, 50];
    rect(M + 30 + d * 22, H - M - 38, 10, 10, col);
  }

  // Horizontal accent line (URL suggestion)
  for (let x = M + 100; x < M + 400; x += 4)
    blend(x, H - M - 33, GREEN, 0.3);

  return px;
}

// ─── PNG ENCODER ──────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const typeB = Buffer.from(type, 'ascii');
  const len   = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length);
  const crcIn = Buffer.concat([typeB, data]);
  const crcB  = Buffer.allocUnsafe(4); crcB.writeUInt32BE(crc32(crcIn));
  return Buffer.concat([len, typeB, data, crcB]);
}

function encodePng(px) {
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Build raw scanlines: 1 filter byte (None=0) + RGB row
  const raw = Buffer.allocUnsafe(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    for (let i = 0; i < W * 3; i++)
      raw[y * (1 + W * 3) + 1 + i] = px[y * W * 3 + i];
  }

  const idat = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
let _cache = null;

function buildOgPng() {
  if (_cache) return _cache;
  _cache = encodePng(makeCanvas());
  return _cache;
}

module.exports = { buildOgPng };
