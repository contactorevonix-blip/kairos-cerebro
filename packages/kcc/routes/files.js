'use strict';
const express = require('express');
const router = express.Router();

// Stub — implementado em Story 4.2
router.get('/', (_req, res) => res.json({ ok: true, data: { stub: true, story: '4.2' } }));
router.get('/content', (_req, res) => res.json({ ok: true, data: { stub: true, story: '4.2' } }));

module.exports = router;
