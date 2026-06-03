'use strict';
const express = require('express');
const router = express.Router();

// Stub — implementado em Story 4.7 (Sprint 2)
router.post('/', (_req, res) => res.json({ ok: true, data: { stub: true, story: '4.7' } }));

module.exports = router;
