# Knowledge Base — Claude Code Mastery Squad

## Claude Code — Quick Reference
[SOURCE: claude-code-mastery squad — knowledge interno verificado]

### 17 Hook Events
SessionStart, SessionEnd, UserPromptSubmit, PreToolUse, PostToolUse,
PostToolUseFailure, PermissionRequest, Notification, SubagentStart, SubagentStop,
Stop, TeammateIdle, TaskCompleted, ConfigChange, WorktreeCreate, WorktreeRemove, PreCompact

### 16+ Tools
Read, Write, Edit, MultiEdit, NotebookEdit, Glob, Grep, LS, Bash, BashOutput,
KillBash, WebSearch, WebFetch, TodoWrite, Agent, ExitPlanMode, AskUserQuestion, ToolSearch

### Permission Modes
askAlways (default) · acceptEdits · autoApprove/dontAsk · bypassPermissions · plan

### Settings Hierarchy
managed-settings.json > CLI args > .claude/settings.local.json > .claude/settings.json > ~/.claude/settings.json

### Agent Activation Paths
.claude/agents/*.md → @{name}
.claude/skills/AIOX/agents/{name}/SKILL.md → /AIOX:agents:{name}
.claude/commands/{Squad}/agents/{name}.md → /{Squad}:agents:{name}

## Squad Specialists
- Latch (hooks-architect): disler/IndyDevDan — 17 hook events
- Piper (mcp-integrator): Peter Steinberger — MCP servers
- Nexus (swarm-orchestrator): Kieran Klaassen + Reuven Cohen — agent teams
- Sigil (config-engineer): SuperClaude-Org — settings/permissions
- Anvil (skill-craftsman): BMAD-CODE-ORG — skills/plugins
- Conduit (project-integrator): Daniel Miessler — CI/CD/AIOX
- Vigil (roadmap-sentinel): Boris Cherny — changelog/roadmap
