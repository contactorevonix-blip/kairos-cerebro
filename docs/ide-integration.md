# IDE Integration Matrix — AIOX 4.0.4

## Compatibility Overview

KAIROS_CEREBRO uses **Claude Code only** as its primary IDE integration. This document defines the compatibility status of AIOX across various IDEs for reference, but only Claude Code is actively supported and tested.

**Last Updated:** 2026-02-16  
**AIOX Version:** 4.0.4  
**Primary IDE:** Claude Code  
**Validator:** `.aiox-core/infrastructure/scripts/validate-parity.js`

---

## Compatibility Matrix

| IDE | Status | Notes |
|-----|--------|-------|
| Claude Code | Works | ✅ **Active** — Full integration with Claude Code hooks and MCP servers |
| Gemini CLI | Works | Framework support only; not used in KAIROS_CEREBRO |
| Codex CLI | Limited | Framework support only; not used in KAIROS_CEREBRO |
| Cursor | Limited | Framework support only; not used in KAIROS_CEREBRO |
| GitHub Copilot | Limited | Framework support only; not used in KAIROS_CEREBRO |
| AntiGravity | Limited | Framework support only; not used in KAIROS_CEREBRO |

---

## Integration Details

### Claude Code — Works ✅ (KAIROS_CEREBRO Primary)

**Status:** **Actively Supported and Tested**

**Features:**
- ✅ Agents and agent commands (`@agent-name` syntax)
- ✅ Skills integration (`.claude/skills/`)
- ✅ Hook system (PreToolUse, PostToolUse)
- ✅ MCP server configuration and management
- ✅ Full AIOX command support
- ✅ Agent activation tracking
- ✅ Story-driven development integration
- ✅ Quality gates and enforcement

**Configuration:**
- **Agent Definitions:** `.claude/agents/`
- **Skills:** `.claude/skills/*/SKILL.md`
- **Hooks:** `.claude/hooks/*.cjs`
- **Rules:** `.claude/rules/`
- **Settings:** `.claude/settings.json`, `.claude/settings.local.json`

**Recent Commits:**
- feat: Story 13.11 — Fix Enforcement Gates YAML Regex + full test support
- AIOX Agent Authority enforcement gates active

---

### Other IDEs (Framework Support Only)

The following IDEs are supported by the AIOX framework but **not used in KAIROS_CEREBRO**:

- **Gemini CLI** — Framework support available
- **Codex CLI** — Framework support available
- **Cursor** — Framework support available
- **GitHub Copilot** — Framework support available
- **AntiGravity** — Framework support available

These can be integrated in other projects using AIOX.

---

## Quality Gates

### Claude Code Validation (KAIROS_CEREBRO)

The following validation checks ensure Claude Code integration is working:

| Check | Purpose | Status |
|-------|---------|--------|
| `claude-sync` | Claude Code IDE sync validation | ✅ Tested |
| `claude-integration` | Claude Code feature integration | ⚠️ Framework-level |
| `codex-skills` | Skills synchronization | ✅ Tested |
| `paths` | Framework path integrity check | ✅ Tested |

### Framework-Level Checks

The AIOX framework also validates other IDEs (not used in KAIROS_CEREBRO):

| Check | IDE | Notes |
|-------|-----|-------|
| `gemini-sync`, `gemini-integration` | Gemini CLI | Framework support only |
| `codex-sync`, `codex-integration` | Codex CLI | Framework support only |
| `cursor-sync` | Cursor | Framework support only |
| `github-copilot-sync` | GitHub Copilot | Framework support only |
| `antigravity-sync` | AntiGravity | Framework support only |

### Run Validation

```bash
# Full framework validation
node .aiox-core/infrastructure/scripts/validate-parity.js

# JSON output (for CI/CD)
node .aiox-core/infrastructure/scripts/validate-parity.js --json

# Quiet mode
node .aiox-core/infrastructure/scripts/validate-parity.js --quiet
```

**Note:** Only Claude Code checks (`claude-sync`, `paths`) are expected to pass for KAIROS_CEREBRO. Other IDE checks are framework-level and may show warnings/failures if those IDEs are not configured.

---

## Project-Specific Configuration

### KAIROS_CEREBRO Setup

```
.claude/
├── agents/              # Agent definitions active in this project
├── skills/              # Skills registered for Claude Code
├── hooks/               # PreToolUse/PostToolUse hooks
├── rules/               # Development rules and enforcement
└── settings.json        # Claude Code integration settings
```

### Active Integration Points

- **Agent Activation:** Via `@agent-name` syntax in Claude Code
- **Story Management:** Via story files in `docs/stories/`
- **Quality Gates:** Via enforcement hooks in `.claude/hooks/`
- **Configuration:** Via `.claude/settings.json` and `.claude/CLAUDE.md`

---

## Framework Architecture

IDE integrations are defined in the AIOX framework at `.aiox-core/infrastructure/ide-sync/`:

```
.aiox-core/infrastructure/
├── ide-sync/
│   ├── claude-code/      # Claude Code (ACTIVE)
│   ├── gemini/           # Gemini CLI (framework only)
│   ├── codex/            # Codex CLI (framework only)
│   ├── cursor/           # Cursor (framework only)
│   ├── github-copilot/   # GitHub Copilot (framework only)
│   └── antigravity/      # AntiGravity (framework only)
└── scripts/
    ├── validate-parity.js              # Main parity validator
    └── contracts/
        └── compatibility/
            └── aiox-4.0.4.yaml         # Framework compatibility matrix
```

---

## References

- **Compatibility Contract:** `.aiox-core/infrastructure/contracts/compatibility/aiox-4.0.4.yaml`
- **Validator Script:** `.aiox-core/infrastructure/scripts/validate-parity.js`
- **Claude Code Configuration:** `.claude/CLAUDE.md`
- **Development Rules:** `.claude/rules/`
- **Framework Constitution:** `.aiox-core/constitution.md`
- **Agent Authority:** `.claude/rules/agent-authority.md`
