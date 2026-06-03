'use strict';
const express = require('express');
const router = express.Router();

// Stub — implementado em Story 4.4
router.get('/', (_req, res) => res.json({ ok: true, data: { stub: true, story: '4.4' } }));

module.exports = router;
