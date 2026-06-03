# ADR-4: Write Guard Strategy — KAIROS COMMAND CENTER

**Status:** Aceite
**Data:** 2026-06-03
**Arquitecta:** Aria (@architect)
**Epic:** EPIC-004
**Prioridade:** CRÍTICO — bloqueador de segurança

---

## Contexto

O KCC pode potencialmente escrever ficheiros no KAIROS_CEREBRO. Sem protecção, um bug ou acção errada poderia corromper:
- A Constitution (`.aiox-core/constitution.md`)
- As deny rules (`.claude/settings.json`)
- O framework core (`.aiox-core/core/`)

A Constitution já tem 97 deny rules no `.claude/settings.json` para o Claude Code. O KCC precisa de um layer equivalente no servidor.

---

## Decisão

**Write Guard em 3 camadas:**

1. **Allowlist de paths** — só `docs/`, `squads/`, `packages/`, `bin/kairos*` são escrevíveis
2. **Path traversal guard** — rejeitar qualquer path com `../`, `~`, ou path absoluto
3. **Audit log** — todas as escritas (sucesso e falha) registadas em `.aiox/kcc-write-log.json`

---

## Implementação

```javascript
// packages/kcc/lib/write-guard.js

const path = require('path');
const fs = require('fs');

// Apenas L4 é escrevível
const WRITABLE_PREFIXES = [
  'docs/',
  'squads/',
  'packages/',
  'bin/kairos',
  'tests/',
];

// Explicitamente bloqueado (mesmo que prefixo passe)
const BLOCKED_PATHS = [
  '.aiox-core/',
  '.claude/settings.json',
  '.claude/settings.local.json',
  'core-config.yaml',
  'bin/aiox.js',
  'bin/aiox-init.js',
];

/**
 * Valida se um path é escrevível pelo KCC.
 * @param {string} relativePath — path relativo ao projectRoot
 * @returns {{ allowed: boolean, layer: string, reason?: string }}
 */
function checkWritePermission(relativePath) {
  // Normalizar (sem ../  ou /)
  const normalized = path.normalize(relativePath).replace(/\\/g, '/');

  // Bloquear path traversal
  if (normalized.startsWith('..') || path.isAbsolute(relativePath)) {
    return { allowed: false, layer: 'INVALID', reason: 'Path traversal attempt blocked' };
  }

  // Verificar blocklist explícita primeiro
  const isBlocked = BLOCKED_PATHS.some(blocked => normalized.startsWith(blocked));
  if (isBlocked) {
    const layer = getLayer(normalized);
    return { allowed: false, layer, reason: `Path ${normalized} is in blocked list (${layer})` };
  }

  // Verificar allowlist
  const isAllowed = WRITABLE_PREFIXES.some(prefix => normalized.startsWith(prefix));
  if (!isAllowed) {
    const layer = getLayer(normalized);
    return {
      allowed: false,
      layer,
      reason: `Path ${normalized} is not in writable L4 prefixes`,
      allowedRoots: WRITABLE_PREFIXES,
    };
  }

  return { allowed: true, layer: 'L4' };
}

function getLayer(normalizedPath) {
  if (normalizedPath.startsWith('.aiox-core/core/') ||
      normalizedPath === '.aiox-core/constitution.md' ||
      normalizedPath === 'bin/aiox.js') return 'L1';
  if (normalizedPath.startsWith('.aiox-core/development/') ||
      normalizedPath.startsWith('.aiox-core/infrastructure/')) return 'L2';
  if (normalizedPath.startsWith('.aiox-core/data/') ||
      normalizedPath === '.claude/settings.json' ||
      normalizedPath === 'core-config.yaml') return 'L3';
  return 'L4';
}

/**
 * Regista tentativa de escrita no audit log.
 */
function logWriteAttempt(projectRoot, entry) {
  const logPath = path.join(projectRoot, '.aiox', 'kcc-write-log.json');
  try {
    const existing = fs.existsSync(logPath)
      ? JSON.parse(fs.readFileSync(logPath, 'utf8'))
      : { entries: [] };
    existing.entries.push({
      timestamp: new Date().toISOString(),
      ...entry,
    });
    // Manter só os últimos 100 entries
    if (existing.entries.length > 100) {
      existing.entries = existing.entries.slice(-100);
    }
    fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));
  } catch {
    // Falha silenciosa no log — não deve bloquear a resposta principal
  }
}

module.exports = { checkWritePermission, logWriteAttempt };
```

---

## Uso no Route Handler

```javascript
// packages/kcc/routes/write.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { checkWritePermission, logWriteAttempt } = require('../lib/write-guard');

const router = express.Router();

router.put('/content', (req, res) => {
  const { path: filePath, content } = req.body;
  const projectRoot = req.projectRoot;

  if (!filePath || typeof content !== 'string') {
    return res.status(400).json({
      ok: false, data: null,
      error: { code: 'INVALID_REQUEST', message: 'path and content are required' }
    });
  }

  const guard = checkWritePermission(filePath);

  logWriteAttempt(projectRoot, {
    path: filePath,
    allowed: guard.allowed,
    layer: guard.layer,
    reason: guard.reason,
  });

  if (!guard.allowed) {
    return res.status(403).json({
      ok: false, data: null,
      error: {
        code: 'WRITE_GUARD_VIOLATION',
        message: guard.reason,
        layer: guard.layer,
        allowedRoots: guard.allowedRoots,
      }
    });
  }

  const absolutePath = path.join(projectRoot, filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, 'utf8');

  res.json({ ok: true, data: { path: filePath, written: true, layer: 'L4' } });
});

module.exports = router;
```

---

## Testes de Segurança (para @qa)

| Teste | Input | Expected |
|-------|-------|----------|
| Escrita L4 válida | `docs/stories/test.md` | 200 OK |
| Bloqueio L1 | `.aiox-core/constitution.md` | 403 WRITE_GUARD_VIOLATION |
| Bloqueio L1 core | `.aiox-core/core/orchestration/x.js` | 403 |
| Bloqueio settings | `.claude/settings.json` | 403 |
| Path traversal | `../../etc/passwd` | 403 INVALID |
| Path absoluto | `/etc/passwd` | 403 INVALID |
| Subpath L4 | `squads/my-squad/new-agent.yaml` | 200 OK |
| Bin KCC | `bin/kairos-command-center.js` | 200 OK |
| Bin AIOX | `bin/aiox.js` | 403 L1 |

---

## Consequências

**Positivas:**
- Impossível corromper L1/L2/L3 via KCC, mesmo com bug
- Audit trail de todas as escritas (`.aiox/kcc-write-log.json`)
- Alinhado com os 97 deny rules já existentes no Claude Code

**Negativas:**
- Pedro não pode editar `.claude/rules/` via KCC (é L3/config)
- Workaround: abrir o ficheiro no editor directamente para L3

**Decisão consciente:**
Preferimos bloquear demasiado e desbloquear por pedido, do que bloquear pouco e perder dados. A Constitution diz: "automação sem guardrails = NUNCA".
