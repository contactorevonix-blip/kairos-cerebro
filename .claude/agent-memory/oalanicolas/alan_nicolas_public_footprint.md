---
name: alan-nicolas-public-footprint
description: Verified public footprint of Alan Nicolas (oalanicolas) — GitHub repos, Academia Lendaria community, AIOS/AIOX framework, and what is NOT public (chiefs files)
metadata:
  type: reference
---

## Identity

- GitHub: https://github.com/oalanicolas (31 public repos as of 2026-05-25)
- Website: https://oalanicolas.news/ (PT-BR newsletter on AI)
- Founder & CEO of Academia Lendaria; co-founder of AIOX/Synkra AIOS
- Active on X, LinkedIn, Instagram, TikTok, YouTube

## Public repos relevant to agent system

- **SynkraAI/aiox-core** (pinned, ~2.9k stars) — "Synkra AIOS: AI-Orchestrated System for Full Stack Development - Core Framework v4.0" (JavaScript)
- **oalanicolas/aios-core** (~17 stars, last updated 2026-01-13) — earlier v2.1 of the framework
- **oalanicolas/aios-squads** (~27 stars, last updated 2026-01-29) — public squads: `etl-squad`, `creator-squad`. Mentions private squads `mmos` and `certified-partners` in separate repos.
- **oalanicolas/lendaria-ds** — "Academia Lendaria - Design System" (HTML)
- **oalanicolas/aiox-research** — local-first research workbench (TypeScript)
- **oalanicolas/ralph** — autonomous AI agent loop (TypeScript)

## Verified agent file format (aios-core)

Path: `.claude/commands/AIOS/agents/` — **confirmed exists** in `oalanicolas/aios-core`.

Files present (all `.md`):
- `_README.md`
- `aios-master.md`, `analyst.md`, `architect.md`, `data-engineer.md`, `dev.md`, `devops.md`, `pm.md`, `po.md`, `qa.md`, `sm.md`, `squad-creator.md`, `ux-design-expert.md`

**File format** (from `dev.md`): YAML + Markdown hybrid. YAML block defines:
- `IDE-FILE-RESOLUTION`, `REQUEST-RESOLUTION`, `activation-instructions`
- `agent` (name, id, title, icon, whenToUse)
- `persona_profile` (archetype, communication, greeting_levels)
- `persona` (role, style, identity, focus)
- `core_principles`
- `commands` array (name, visibility, description)
- `develop-story` workflows
- `dependencies` (checklists, tasks, tools)
- `coderabbit_integration`, `decision_logging`, `git_restrictions`
Followed by markdown sections: Quick Commands, Agent Collaboration, Developer Guide.

**Tool ID convention** (from `_README.md`):
- `mcp-{name}` for MCP servers
- `cli-{name}` for CLI wrappers
- `local-{name}` for local binaries
- bare name for core tools (e.g., `browser`)

## Squad canonical structure

From `aios-core/templates/squad/`:
- `agents/`, `tasks/`, `templates/`, `tests/`, `workflows/`
- `squad.yaml`, `package.json`, `README.md`, `LICENSE`, `.gitignore`
- Agents activated via `@{agent-name}` — no hierarchical "chief" structure in public templates.

## Academia Lendaria (community)

- Paid cohort program — Fundamentals Batch 5 starts 2026-05-18
- Pricing: R$ 4,888 upfront / 12x R$ 488 (existing AIOX students); R$ 6,888 / 12x R$ 688 (new)
- Format: 4 weeks, 8 live lectures + 9 support sessions, lifetime recordings, 100-person cap
- Required tooling: Claude Pro (~US$20/mo)
- Batch 5 promises "five new squads" — design, technical research, competitive analysis, **copywriting (Hormozi / Russell Brunson frameworks)**, plus a live masterclass with Alan
- Companion `lendaria-ds` design-system repo is public

## What is NOT publicly available

Verified absences (searched across `oalanicolas/*` repos, web search, and Academia Lendaria public pages):

- ❌ No files named `copy-chief`, `story-chief`, `traffic-masters-chief`, `design-chief` in any public repo
- ❌ No `chiefs/` folder in `aios-core`, `aios-squads`, or `templates/squad`
- ❌ Academia Lendaria public landing pages do not reference "Chiefs" terminology — they use "squads"
- ❌ No public distribution channel found for "chief" persona files

**Conclusion:** "Chiefs" appears to be either (a) private/paid material distributed inside Academia Lendaria cohort, (b) terminology used internally by Pedro / KAIROS that doesn't map 1:1 to Alan's public taxonomy, or (c) future content (Batch 5's "copywriting squad" using Hormozi/Brunson frameworks is the closest analog to a public "copy chief"). The public AIOX taxonomy uses **squads + agents**, not chiefs.

## Implications for cloning

- The `.claude/commands/{Domain}/agents/*.md` YAML+MD hybrid format is the canonical public form — reuse it when cloning minds into KAIROS.
- Source tier for this research:
  - **Tier 0:** Direct GitHub file inspection (`aios-core/.claude/commands/AIOS/agents/dev.md`, `_README.md`)
  - **Tier 1:** Academia Lendaria public pricing page, oalanicolas.news
  - **Tier 2:** Web search summaries (less reliable)
- If user has private Academia Lendaria materials, those would be the only verifiable source for actual "chief" file contents.
