# PRD: SYNAPSE Enforcement Sync (Framework Governance)

**Goal:** Synchronize ALL rules, enforcement hooks, templates, workflows, and commands so they all work together.

**Problem:** 
- 16 rules escritas
- 22 hooks scattered (some rules have no hooks)
- 18 templates (some unused)
- Workflows e commands incompletos

**Result:** Rules definem X mas enforcement faz Y. Confusão.

---

## What We Need to Do

### Phase 1: Audit Everything (ASAP)
Make a table showing:
- **Rule name** → What it says must happen
- **Hook status** → Does it block/warn/nothing?
- **Template** → Is there a template for this?
- **Workflow** → Is there a workflow (steps)?
- **Commands** → Are there \*command shortcuts?
- **Gap** → What's missing?

### Phase 2: Fill the Gaps
For each gap, decide:
- Create new hook? (enforce-X.cjs)
- Create new template? (template-Y.yaml)
- Create new workflow? (how to do X step-by-step)
- Create new command? (\*X shortcut)

### Phase 3: Sync Everything
Once gaps are known, update:
- `.claude/settings.json` — add new hooks to PreToolUse/PostToolUse
- `.claude/rules/` — update rules to reference enforcement
- `.claude/templates/` — add missing templates
- `.claude/commands/` (or skill files) — add \*commands

### Phase 4: Test & Ship
- Unit tests for new hooks
- Manual test: does rule actually block violations?
- Update gate logs
- Commit everything

---

## Effort Estimate

| Phase | Effort | What |
|-------|--------|------|
| Phase 1 (Audit) | 2sp | Read all rules, check coverage, make table |
| Phase 2 (Design) | 3sp | Decide what's missing, write specs |
| Phase 3 (Build) | 8-12sp | Create hooks, templates, workflows |
| Phase 4 (Test) | 2sp | Unit tests, manual validation |
| **TOTAL** | **15-17sp** | Enterprise flow (needs PRD + Spec Pipeline) |

---

## Stories to Create

After Phase 1, we'll create stories like:
- **1.17:** Expand enforce-agent-authority (Skills + Skill commands)
- **1.18:** New enforce-story-lifecycle (status transitions)
- **1.19:** New enforce-po-exclusive-ops (@po commands)
- **1.20:** New enforce-absolute-imports (Art. VI)
- **1.21:** Sync templates + workflows to match rules

---

## Decision for Pedro

**Option A (Recommended):** Do Phase 1 Audit NOW (2sp, ~2h), then create PRD with Phases 2-4.
- Safer: know exactly what we're building
- Prevents work on partial info

**Option B:** Skip audit, assume we know the gaps, start building.
- Faster: ship in 1-2 days
- Risk: build wrong stuff, redo work

**Which?**
