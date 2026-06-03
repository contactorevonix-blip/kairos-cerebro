'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { checkWritePermission, logWriteAttempt } = require('../lib/write-guard');

const router = express.Router();

router.put('/content', (req, res) => {
  const { path: filePath, content } = req.body;

  if (!filePath || typeof content !== 'string') {
    return res.status(400).json({
      ok: false, data: null,
      error: { code: 'INVALID_REQUEST', message: 'path and content are required' },
    });
  }

  const guard = checkWritePermission(filePath);
  logWriteAttempt(req.projectRoot, { path: filePath, allowed: guard.allowed, layer: guard.layer, reason: guard.reason });

  if (!guard.allowed) {
    return res.status(403).json({
      ok: false, data: null,
      error: { code: 'WRITE_GUARD_VIOLATION', message: guard.reason, layer: guard.layer, allowedRoots: guard.allowedRoots },
    });
  }

  const absolutePath = path.join(req.projectRoot, filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, 'utf8');

  res.json({ ok: true, data: { path: filePath, written: true, layer: 'L4' } });
});

module.exports = router;
