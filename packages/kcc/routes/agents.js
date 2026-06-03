'use strict';
const express = require('express');
const router = express.Router();

// Stub — implementado em Story 4.3
router.get('/', (_req, res) => res.json({ ok: true, data: { stub: true, story: '4.3' } }));
router.get('/:id', (_req, res) => res.json({ ok: true, data: { stub: true, story: '4.3' } }));

module.exports = router;
