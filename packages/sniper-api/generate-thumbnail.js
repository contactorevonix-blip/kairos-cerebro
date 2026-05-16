#!/usr/bin/env node
/**
 * generate-thumbnail.js
 * Generates a 240×240px Product Hunt thumbnail for Kairos Check.
 * Uses pure Node.js with no external dependencies — raw PNG encoding via zlib.
 *
 * Design:
 *   - Canvas 240×240, background #060606
 *   - Pentagonal shield #00d97e centred
 *   - Bitmap K (7×9 @ 8x scale = 56×72px) centred inside shield, colour #000000
 */

'use strict';

const fs   = require('fs');
const zlib = require('zlib');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const OUTPUT_PATH = path.resolve('C:\\Users\\lealp\\KAIROS_CEREBRO\\kairos_thumbnail_final.png');
const W = 240;
const H = 240;

const BG    = { r: 6,   g: 6,   b: 6   }; // #060606
const GREEN = { r: 0,   g: 217, b: 126 }; // #00d97e
const BLACK = { r: 0,   g: 0,   b: 0   }; // #000000

// ---------------------------------------------------------------------------
// Bitmap font — K in 7 columns × 9 rows (1 = pixel on)
// ---------------------------------------------------------------------------
const K_BITMAP = [
  [1,0,0,0,1,0,0],
  [1,0,0,1,0,0,0],
  [1,0,1,0,0,0,0],
  [1,1,0,0,0,0,0],
  [1,1,0,0,0,0,0],
  [1,0,1,0,0,0,0],
  [1,0,0,1,0,0,0],
  [1,0,0,0,1,0,0],
  [1,0,0,0,0,1,0],
];
const SCALE    = 8;            // 7×8=56px wide, 9×8=72px tall
const K_W      = 7 * SCALE;   // 56
const K_H      = 9 * SCALE;   // 72

// ---------------------------------------------------------------------------
// Pixel buffer — RGBA, row-major
// ---------------------------------------------------------------------------
const buf = Buffer.alloc(W * H * 4, 0);

function setPixel(x, y, c) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  buf[i]     = c.r;
  buf[i + 1] = c.g;
  buf[i + 2] = c.b;
  buf[i + 3] = 255;
}

function getPixel(x, y) {
  if (x < 0 || x >= W || y < 0 || y >= H) return null;
  const i = (y * W + x) * 4;
  return { r: buf[i], g: buf[i+1], b: buf[i+2], a: buf[i+3] };
}

// ---------------------------------------------------------------------------
// Step 1 — Fill background
// ---------------------------------------------------------------------------
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    setPixel(x, y, BG);

// ---------------------------------------------------------------------------
// Step 2 — Draw pentagonal shield (centred)
//
// Shield geometry (all coordinates relative to canvas):
//   top-left  (cx - sw/2, cy - sh/2)
//   top-right (cx + sw/2, cy - sh/2)
//   mid-right (cx + sw/2, cy + sh*0.15)   <- where sides start tapering
//   bottom    (cx,        cy + sh/2)       <- pointed bottom
//   mid-left  (cx - sw/2, cy + sh*0.15)
//
// We rasterise by checking each pixel: is it inside the pentagon?
// ---------------------------------------------------------------------------
const CX = W / 2;       // 120
const CY = H / 2 - 4;   // 116  (slight upward bias looks better)
const SW = 140;          // shield width
const SH = 160;          // shield height

const shieldLeft  = CX - SW / 2;   // 50
const shieldRight = CX + SW / 2;   // 190
const shieldTop   = CY - SH / 2;   // 36
const shieldBot   = CY + SH / 2;   // 196
const shieldMidY  = CY + SH * 0.12; // where taper begins

// Pentagon vertices
const verts = [
  { x: shieldLeft,  y: shieldTop    }, // TL
  { x: shieldRight, y: shieldTop    }, // TR
  { x: shieldRight, y: shieldMidY  }, // MR
  { x: CX,          y: shieldBot   }, // Bottom point
  { x: shieldLeft,  y: shieldMidY  }, // ML
];

function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect =
      ((yi > py) !== (yj > py)) &&
      (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Anti-aliased shield fill: supersample 3×3
const SS = 3;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let hits = 0;
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const px = x + (sx + 0.5) / SS;
        const py = y + (sy + 0.5) / SS;
        if (pointInPolygon(px, py, verts)) hits++;
      }
    }
    if (hits === 0) continue;
    const alpha = hits / (SS * SS);
    const i = (y * W + x) * 4;
    // Blend with existing BG
    buf[i]     = Math.round(GREEN.r * alpha + BG.r * (1 - alpha));
    buf[i + 1] = Math.round(GREEN.g * alpha + BG.g * (1 - alpha));
    buf[i + 2] = Math.round(GREEN.b * alpha + BG.b * (1 - alpha));
    buf[i + 3] = 255;
  }
}

// ---------------------------------------------------------------------------
// Step 3 — Draw bitmap K centred in shield
// ---------------------------------------------------------------------------
// Centre inside shield (vertically a little above mid due to pointed bottom)
const kOffsetX = Math.round(CX - K_W / 2);
const kOffsetY = Math.round(CY - K_H / 2) - 4; // nudge up slightly

for (let row = 0; row < 9; row++) {
  for (let col = 0; col < 7; col++) {
    if (!K_BITMAP[row][col]) continue;
    // Draw SCALE×SCALE block
    for (let dy = 0; dy < SCALE; dy++) {
      for (let dx = 0; dx < SCALE; dx++) {
        const px = kOffsetX + col * SCALE + dx;
        const py = kOffsetY + row * SCALE + dy;
        setPixel(px, py, BLACK);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Step 4 — Encode as PNG (pure Node.js, no external deps)
//
// PNG structure:
//   Signature (8 bytes)
//   IHDR chunk
//   IDAT chunk (deflated scanlines with filter byte 0 each)
//   IEND chunk
// ---------------------------------------------------------------------------

function crc32(data) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })());
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = table[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf    = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput  = Buffer.concat([typeBytes, data]);
  const crcBuf    = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

// IHDR: width, height, bit depth 8, colour type 2 (RGB), deflate, filter 0, interlace 0
const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(W, 0);
ihdrData.writeUInt32BE(H, 4);
ihdrData[8]  = 8;  // bit depth
ihdrData[9]  = 2;  // colour type RGB
ihdrData[10] = 0;  // deflate
ihdrData[11] = 0;  // filter
ihdrData[12] = 0;  // no interlace

// Build raw scanlines (filter byte 0 + RGB data per row)
const rawLines = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  const base = y * (1 + W * 3);
  rawLines[base] = 0; // filter None
  for (let x = 0; x < W; x++) {
    const src = (y * W + x) * 4;
    const dst = base + 1 + x * 3;
    rawLines[dst]     = buf[src];     // R
    rawLines[dst + 1] = buf[src + 1]; // G
    rawLines[dst + 2] = buf[src + 2]; // B
  }
}

const compressed = zlib.deflateSync(rawLines, { level: 9 });

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdrChunk    = makeChunk('IHDR', ihdrData);
const idatChunk    = makeChunk('IDAT', compressed);
const iendChunk    = makeChunk('IEND', Buffer.alloc(0));

const png = Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);

fs.writeFileSync(OUTPUT_PATH, png);

const stats = fs.statSync(OUTPUT_PATH);
console.log(`PNG written: ${OUTPUT_PATH}`);
console.log(`File size:   ${stats.size} bytes`);
console.log('Done.');
