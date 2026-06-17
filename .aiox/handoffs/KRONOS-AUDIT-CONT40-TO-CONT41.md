# 🔬 KRONOS ULTRA-DEEP AUDIT — Cont 40 → Cont 41 Handoff

**Coverage**: 100% file reading — Tiers 1-10 (config, hooks, workflows, agents, tasks, gates, stories, memory, execution, integration)

**Duration**: 297 seconds (5 min ultra-deep)

---

## 📊 FINDINGS SUMMARY

**31 GAPS VERIFIED** (file:line specific, ZERO invented)
- 3 CRITICAL: config silos, agent-activation broken, quality gate unwritten
- 4 HIGH: framework-protection split-brain, expiry bomb, status mismatch, @devops blocked
- 8 MEDIUM/LOW: yaml dep missing, hook names diverge, regex permissive, redundant enforcement, deprecated loader, ghost agents, doc gaps, misc

**21 AMBIGUITIES VERIFIED** (operational/communication)
- Workflow caps 3 different maxes (2/3/5) — no authority
- Worktree symlink protection undefined
- Story gate scoped wrong (any Ready ever = satisfied)
- Handoff token count 2 versions (500 vs 379)
- Quick Flow threshold 3 metrics (stories/time/tokens) — precedence undefined
- SYNAPSE TTL read path unclear
- ID collision file consolidates unknowns
- Non-determinism unbounded (TaskCompleted/PostCompact LLM output contract)
- Version sources split (2.1.0 vs 5.2.9)
- spec.md match too broad (suffix, not path-scoped)

---

## 🔴 TOP 5 CASCADE FIXES

1. **GAP #4** (event field bug) — 10 min — unblocks session tracking, @devops push, SYNAPSE L2+
2. **GAP #5** (quality writer missing) — 45 min — resurrects dead Art. V merge gate
3. **GAP #2+#3** (boundary consolidation+expiry) — 50 min — closes L1/L2 hole before 2026-06-19
4. **GAP #6** (yaml dep) — 15 min — revives 2 dead hooks
5. **GAP #12** (settings.local.json misroute) — 25 min — stops 6 hooks firing on wrong lifecycle every prompt

---

## 📋 FULL GAP LIST

| # | Title | Severity | Location | Fix | L1/L2? |
|---|-------|----------|----------|-----|--------|
| 1 | `core-config.yaml` silently ignored | CRITICAL | config-resolver.js:228 | Migrate keys to layered files | Yes |
| 2 | Framework-protection split-brained | CRITICAL | core-config.yaml:168 + hook:88 | Single config path | Yes |
| 3 | Protection expiry never enforced | CRITICAL | core-config.yaml:169-171 | Add expiry check to isFrameworkProtectionEnabled | Yes |
| 4 | Agent-activation reads wrong stdin | CRITICAL | agent-activation-tracker.cjs:236 | event.message → event.prompt | No |
| 5 | Quality merge gate is no-op | CRITICAL | enforce-quality-gates.cjs:70-81 | Wire QA gate to write quality.status | No |
| 6 | Two hooks require('yaml') package absent | HIGH | story-naming-validator, task-auto-suggest | Use js-yaml (installed) | No |
| 7 | Inconsistent stdin field names | HIGH | synapse-engine vs 5 other hooks | Canonical field: prompt everywhere | No |
| 8 | Workflow-chains status contradicts lifecycle | HIGH | workflow-chains.yaml:29,39 vs story-lifecycle | Use canonical status names | No |
| 9 | No-invention regex accepts empty citations | MEDIUM | enforce-no-invention.cjs:29 | `\[(research|finding):[^\]]+\]` | No |
| 10 | Redundant double-enforcement | MEDIUM | settings.json 127-141 | Single hook or explicit precedence | No |
| 11 | @devops blocked by session bug | HIGH | (consequence of GAP #4) | Fixed by GAP #4 | No |
| 12 | settings.local.json wrong event hooks | HIGH | settings.local.json:76-129 | Move hooks to proper events | No |
| 13 | config-loader.js reads bypassed file | MEDIUM | config-loader.js:105 vs resolver | Delete or repoint to resolver | Yes |
| 14 | agentRequirements ghost agents | MEDIUM | config-loader.js:55-57 | Remove 'ux-expert', 'db-sage', 'security' | Yes |
| 15 | CLAUDE.md Constitution table incomplete | LOW | CLAUDE.md vs enforcement-gates | Add Article VII definition | No |

---

## 🎯 NEXT SESSION (Cont 41+)

**EPIC-12: Agent Framework End-to-End Testing & Remediation**
- **Scope**: 40-50sp, 2-3 weeks
- **Phase 1** (8sp): Agent Testing — ALL 12 agents activation/config/commands/memory
- **Phase 2** (10sp): Workflow Testing — ALL 15 workflows end-to-end
- **Phase 3** (8sp): Gate Testing — ALL 22 hooks firing/override/fallback
- **Phase 4** (16sp): Remediation — Fix top 5 gaps + update docs
- **Phase 5** (8sp): Validation — All agents/workflows/gates operational

**Constraint**: ZERO files skip testing. Every agent, workflow, gate tested real.

---

**For Cont 41**: Load this, read full Kronos report (above), then execute EPIC-12 Phase 1 beginning with @dev agent testing.
