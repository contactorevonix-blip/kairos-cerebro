# SOP: Story Naming & Rastreability

**Story:** 2.5 Phase 2 (Governance Infrastructure)  
**Author:** @architect (Aria), @dev (Dex)  
**Version:** 1.0.0  
**Created:** 2026-06-09  
**Modified:** 2026-06-09

---

## Overview

This SOP defines story naming conventions and validation rules to ensure 100% rastreability across the AIOX framework. Story naming is critical for:
- Task-First automation (task-auto-suggest.cjs resolution)
- Constitution Art. III compliance (story-driven development)
- Metrics accuracy (tasksActivated, rastreability = 100%)

---

## Naming Patterns

### Standard Stories

**Format:** `{EPIC}.{STORY}-{slug}.md`

**Examples:**
- ✅ `5.2-script-lifecycle-testing.md`
- ✅ `1.20-enforcement-gates.md`
- ✅ `2.5-phase2-governance-infrastructure.md`

**Rules:**
1. Must match regex `/(\d+\.\d+)/` in filename
2. Epic number (first digit) matches `.aiox-core/data/epic-registry.yaml` if exists
3. Story number (second digit) is sequential within epic
4. Slug is kebab-case, descriptive (no spaces, no special chars except hyphen)

### Special / Meta Stories

Some stories don't fit the standard pattern and are whitelisted in `.aiox-core/data/story-registry.yaml`:

- `INDEX.md` — Story catalogue, used for navigation (resolves as `INDEX`)
- `WORKSPACE-CLEANUP.story.md` — Maintenance task (resolves as `WORKSPACE-CLEANUP`)

**Rule:** Meta stories MUST be registered in `story-registry.yaml::whitelist` with:
- `id` — unique identifier
- `path` — full path including filename
- `type` — 'meta' or custom type
- `resolveAs` — how task-auto-suggest resolves this story

---

## Validation Rules

| Rule | Enforcement | Severity | Gate |
|------|-------------|----------|------|
| **R1: Standard pattern match** | Automatic (hook) | WARN | Non-blocking |
| **R2: Whitelist registration** | Automatic (hook) | WARN | Non-blocking |
| **R3: Uniqueness** | Manual (review) | HIGH | Pre-merge |
| **R4: Slug clarity** | Manual (review) | LOW | Pre-merge |

---

## Failure Modes & Recovery

| Scenario | Symptom | Root Cause | Recovery |
|----------|---------|-----------|----------|
| New story, wrong name | Hook warns + `.aiox/task-logs/unknown.json` generated | Filename doesn't match `/(\d+\.\d+)/` | Rename file to `{EPIC}.{STORY}-{slug}.md` |
| Meta story, not whitelisted | Hook warns, resolver falls back to 'unknown' | Story not in `story-registry.yaml::whitelist` | Add entry to registry YAML |
| Duplicate story ID | `npm test` fails or metrics noise | Two stories with same `{EPIC}.{STORY}` | Audit and renumber (e.g., 5.2 → 5.3) |
| `unknown.json` created | Investigation alert | Any unresolvable story ID | Check logs, fix root cause (R1 or R2) |

---

## Compliance Checklist

When creating a new story, verify:

- [ ] Filename matches `/(\d+\.\d+)/` (standard pattern) OR is registered in `story-registry.yaml`
- [ ] Metadata in story frontmatter (story_id, epic) matches filename
- [ ] Story appears in `.aiox/task-logs/{storyId}.json` after first read
- [ ] No `unknown.json` generated for this story ID
- [ ] Rastreability link: commit message references story ID (e.g., `[Story 5.2]`)

---

## Tools & Automation

### Hooks (Automatic)

| Hook | Trigger | Behavior |
|------|---------|----------|
| `task-auto-suggest.cjs` | Story file opened/edited | Loads registry, resolves storyId, logs suggestions |
| `story-naming-validator.cjs` | Story file created/modified | Validates pattern match, warns if unresolvable |

### Registry (Source of Truth)

**Location:** `.aiox-core/data/story-registry.yaml` (L3 — mutable)

**Content:**
- `patterns.standard.regex` — Standard pattern definition
- `patterns.whitelist[]` — Whitelisted meta stories with resolution rules

**Update:** Edit directly when adding new meta stories. Hooks reload on each invocation (no restart needed).

### Testing

**Location:** `tests/hooks/test-story-traceability.test.js`

**Coverage:**
- Standard pattern resolution (40+ real stories)
- Whitelist resolution (INDEX, WORKSPACE-CLEANUP)
- Fallback behavior (graceful degradation)
- Metrics accuracy (no noise in tasksActivated)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-09 | Implement story-registry.yaml (L3) | Single source of truth for resolver rules; mutable without modifying hooks |
| 2026-06-09 | Whitelist meta stories (INDEX, WORKSPACE-CLEANUP) | Support operational necessity without forcing numeric ID pattern |
| 2026-06-09 | Non-blocking validation (hook warns, never blocks) | Align with Constitution Art. I (CLI first) — observability only |

---

## References

- Constitution Art. III (Story-Driven Development)
- Constitution Art. IV (No Invention)
- `.aiox-core/data/story-registry.yaml` — Registry definition
- `.claude/hooks/task-auto-suggest.cjs` — Resolver implementation
- `.claude/hooks/story-naming-validator.cjs` — Validator implementation
- `tests/hooks/test-story-traceability.test.js` — Test suite

---

## Contacts

- **Author:** @architect (Aria) — Design, validation rules
- **Implementer:** @dev (Dex) — Hooks, tests, registry
- **Owner:** @aiox-master (Orion) — Governance, amendments

---

*Version 1.0.0 — Effective 2026-06-09*
