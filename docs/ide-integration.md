# IDE Integration Matrix — AIOX 4.0.4

## Compatibility Overview

This document defines the compatibility status of AIOX with various Integrated Development Environments (IDEs) and editor integrations.

**Last Updated:** 2026-02-16  
**AIOX Version:** 4.0.4  
**Validator:** `.aiox-core/infrastructure/scripts/validate-parity.js`

---

## Compatibility Matrix

| IDE | Status | Notes |
|-----|--------|-------|
| Claude Code | Works | Full integration with Claude Code hooks and MCP servers |
| Gemini CLI | Works | Full integration with Gemini CLI features |
| Codex CLI | Limited | Partial support; skills sync via codex-skills-sync |
| Cursor | Limited | IDE sync available; some features not fully supported |
| GitHub Copilot | Limited | IDE sync available; some features not fully supported |
| AntiGravity | Limited | IDE sync available; some features not fully supported |

---

## Integration Details

### Claude Code — Works ✅

**Features:**
- Agents and agent commands (`@agent-name` syntax)
- Skills integration
- Hook system (PreToolUse, PostToolUse)
- MCP server configuration
- Full AIOX command support

**Location:** `.claude/agents/`, `.claude/skills/`, `.claude/hooks/`

---

### Gemini CLI — Works ✅

**Features:**
- Gemini CLI integration
- Agent activation and commands
- AIOX framework support

**Location:** `.aiox-core/infrastructure/ide-sync/gemini/`

---

### Codex CLI — Limited ⚠️

**Features:**
- Codex CLI IDE sync
- Codex integration via `@devops` commands
- Skills synchronization

**Limitations:**
- Some advanced AIOX features not supported
- Skills sync requires explicit validation

**Location:** `.aiox-core/infrastructure/ide-sync/codex/`, `.aiox-core/infrastructure/scripts/codex-skills-sync/`

---

### Cursor — Limited ⚠️

**Features:**
- IDE sync for basic AIOX integration
- Cursor IDE support

**Limitations:**
- Some AIOX features not fully integrated
- Requires manual configuration

**Location:** `.aiox-core/infrastructure/ide-sync/cursor/`

---

### GitHub Copilot — Limited ⚠️

**Features:**
- GitHub Copilot IDE sync
- Basic AIOX integration

**Limitations:**
- Limited feature parity with Claude Code
- Some workflows not supported

**Location:** `.aiox-core/infrastructure/ide-sync/github-copilot/`

---

### AntiGravity — Limited ⚠️

**Features:**
- AntiGravity IDE sync
- Basic AIOX integration

**Limitations:**
- Early-stage integration
- Some features may be unstable

**Location:** `.aiox-core/infrastructure/ide-sync/antigravity/`

---

## Quality Gates

All IDE integrations pass the following validation checks:

| Check | Purpose |
|-------|---------|
| `claude-sync` | Claude Code IDE sync validation |
| `claude-integration` | Claude Code feature integration |
| `gemini-sync` | Gemini CLI IDE sync validation |
| `gemini-integration` | Gemini CLI feature integration |
| `codex-sync` | Codex CLI IDE sync validation |
| `codex-integration` | Codex CLI feature integration |
| `codex-skills` | Codex skills synchronization |
| `cursor-sync` | Cursor IDE sync validation |
| `github-copilot-sync` | GitHub Copilot IDE sync validation |
| `antigravity-sync` | AntiGravity IDE sync validation |
| `paths` | Framework path integrity check |

Run validation with:
```bash
node .aiox-core/infrastructure/scripts/validate-parity.js
```

---

## Architecture

IDE integrations are located in `.aiox-core/infrastructure/ide-sync/` with the following structure:

```
.aiox-core/infrastructure/
├── ide-sync/
│   ├── claude-code/      # Claude Code integration
│   ├── gemini/           # Gemini CLI integration
│   ├── codex/            # Codex CLI integration
│   ├── cursor/           # Cursor IDE integration
│   ├── github-copilot/   # GitHub Copilot integration
│   └── antigravity/      # AntiGravity integration
└── scripts/
    ├── validate-parity.js              # Main parity validator
    ├── validate-claude-integration.js
    ├── validate-codex-integration.js
    ├── validate-gemini-integration.js
    └── codex-skills-sync/              # Codex skills validation
```

---

## Validation Command

Run the full parity validation suite:

```bash
# Human-readable output
node .aiox-core/infrastructure/scripts/validate-parity.js

# JSON output (for CI/CD)
node .aiox-core/infrastructure/scripts/validate-parity.js --json

# Quiet mode (exit code only)
node .aiox-core/infrastructure/scripts/validate-parity.js --quiet

# Compare compatibility contracts (diff)
node .aiox-core/infrastructure/scripts/validate-parity.js --diff=old-contract.yaml

# Custom contract path
node .aiox-core/infrastructure/scripts/validate-parity.js --contract=custom-contract.yaml
```

---

## References

- **Compatibility Contract:** `.aiox-core/infrastructure/contracts/compatibility/aiox-4.0.4.yaml`
- **Validator Script:** `.aiox-core/infrastructure/scripts/validate-parity.js`
- **Claude Code Rules:** `.claude/rules/`
- **Framework Constitution:** `.aiox-core/constitution.md`
