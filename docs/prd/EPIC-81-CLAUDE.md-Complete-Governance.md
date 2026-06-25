# PRD: CLAUDE.md Complete Governance Optimization

**Epic:** EPIC-81-CLAUDE.md-Governance  
**Owner:** @pm (Morgan) + @architect (Aria)  
**Timeline:** 3 weeks (Cont 81-83)  
**Scope:** 26 story points, 3 stories  
**Status:** Draft (awaiting @pm/@architect review)

---

## 1. EXECUTIVE SUMMARY

**Problem:** CLAUDE.md v3.0 exists but lacks:
- Observalidade integration (no telemetry patterns)
- Audit trail specifications (no compliance logging)
- Hook metrics structure (incomplete metrics definition)
- Security hardening rules (no security-first patterns)
- Ambiguity gaps in agent authority (needs clarification)

**Solution:** CLAUDE.md v3.1 → comprehensive governance document:
- Foundation for observalidade (Tier 1-3)
- Compliance-ready audit logging (7 things to log)
- Security-first rules (OWASP top 10 validation)
- Crystal-clear agent authority matrix
- Zero ambiguities, zero gaps

**Outcome:** Pedro can deploy AI safely, audit-trail enabled, no surprises.

---

## 2. REQUIREMENTS

### FR-1: Observalidade Foundation
- **Req 1.1:** CLAUDE.md section "Observalidade Patterns"
  - Traces: agent activation, decision points, tool calls, handoffs
  - Metrics: agent.activations, tool.calls, tokens.used, decision.time, error.rate
  - Logs: structured JSON (timestamp, event_type, decision, reason, user, session)
- **Req 1.2:** Reference OpenTelemetry semantic conventions (from research)
- **Req 1.3:** Link to `.claude/hooks/` for automatic telemetry capture

### FR-2: Audit Trail Compliance
- **Req 2.1:** CLAUDE.md section "Audit & Compliance"
  - 7 things to log (from Superblocks research): model, inputs, outputs, user ID, approvals, data sources, errors
  - Compliance frameworks: EU AI Act, NIST, ISO/IEC 42001, SOC 2, HIPAA
  - Retention: minimum 6 months (EU AI Act)
- **Req 2.2:** `.aiox/audit-logs/` directory structure defined
  - agent-decisions.jsonl (every decision with verdict)
  - tool-calls.jsonl (every tool execution)
  - gate-verdicts.jsonl (every gate evaluation)
  - errors-overrides.jsonl (every error/override)
- **Req 2.3:** JSONL format specification (no gaps)

### FR-3: Hook Metrics Enhancement
- **Req 3.1:** `.synapse/metrics/hook-metrics.json` schema expanded
  - New fields: agent.decision_type, tool.latency_ms, gate.verdict, trace.span_id
  - Aggregation: daily rollup in `.aiox/metrics/daily-{YYYY-MM-DD}.json`
- **Req 3.2:** Metrics exported to OpenTelemetry (optional Prometheus exporter)
- **Req 3.3:** CLI command: `claude metrics --summary` shows real-time stats

### FR-4: Agent Authority Clarification
- **Req 4.1:** Update Agent Authority Matrix
  - @pm: PRD + epic orchestration (exclusive)
  - @sm: story creation (exclusive)
  - @po: story validation + backlog (exclusive)
  - @dev: implementation (exclusive, NEVER git push)
  - @qa: quality verdicts (exclusive, NEVER code changes)
  - @devops: git push/PR/release (exclusive, NEVER code)
  - @architect: design decisions (exclusive, delegates DDL to @data-engineer)
  - @data-engineer: schema/migrations (delegates to @architect for arch review)
  - @aiox-master: framework governance (delegates specialized work)
- **Req 4.2:** Clear escalation paths (who to call when stuck)
- **Req 4.3:** Handoff protocol documented (agent-handoff.md reference)

### FR-5: Security-First Rules
- **Req 5.1:** New "Security by Default" section
  - NEVER commit secrets (explicit patterns: .env, .env.local, *.key, credentials.*)
  - NEVER log sensitive data (PII, tokens, API keys, passwords)
  - NEVER use mock data if reals exist (traceability requires real data)
  - VALIDATE input external (SQL injection, XSS, OWASP top 10)
  - ENCRYPT audit logs (consider encryption at rest for compliance)
- **Req 5.2:** OWASP top 10 checklist (self-serve for @dev)
- **Req 5.3:** Secrets management link (Railway/Vercel secrets docs)

### FR-6: Decision Clarity (Zero Ambiguities)
- **Req 6.1:** IDS Decision Hierarchy explicit
  - Query registry BEFORE every CREATE
  - REUSE ≥90% (use directly, no changes)
  - ADAPT 60-89% (changes <30%, no breaking)
  - CREATE (no match, register in 24h)
- **Req 6.2:** Gate severity levels crystal-clear
  - BLOCK (stops execution, requires fix)
  - WARN (allows proceed, logged)
  - INFO (logged only)
- **Req 6.3:** Override syntax executable (not ambiguous)
  - `git push --skip-devops-check` (logged, audit trail)
  - `git commit -m "msg [no-story-req]"` (config-only, audit trail)
  - `git merge --force-gate` (documented reason, audit trail)

### FR-7: Documentation Structure (No Gaps)
- **Req 7.1:** CLAUDE.md organized in 15 sections (no scattered rules)
  1. Who is Pedro (1 section)
  2. Language & Framework (1 section)
  3. Constitution 7 Articles (1 section)
  4. Agent Authority Matrix (1 section)
  5. Story-Driven Cycle (1 section)
  6. Observalidade Patterns (1 section — NEW)
  7. Audit & Compliance (1 section — NEW)
  8. Hook Metrics Schema (1 section — NEW)
  9. Security by Default (1 section — NEW)
  10. IDS Decision Hierarchy (1 section)
  11. Quality Gates (1 section)
  12. Critical Commands (1 section)
  13. Tool Usage Patterns (1 section)
  14. Git Conventions (1 section)
  15. NEVER/ALWAYS Rules (1 section)
- **Req 7.2:** Target: 120-150 lines (comprehensive, not bloated)
- **Req 7.3:** Every rule prevents a real mistake (no fluff)
- **Req 7.4:** All 20 `.claude/rules/*.md` files referenced (no duplication)

---

## 3. NON-FUNCTIONAL REQUIREMENTS

**NFR-1: Maintainability**
- CLAUDE.md is human-readable (not machine-generated)
- Rules are verifiable (can be tested against hooks)
- Auto-loaded in SessionStart hook (no manual updates needed)

**NFR-2: Clarity**
- No ambiguities (if unclear, add example)
- No circular references (rule A doesn't reference rule A)
- Links to source of truth (.claude/rules/*, .aiox-core/constitution.md)

**NFR-3: Compliance**
- Audit trail requirements met (7 things + compliance frameworks)
- OpenTelemetry alignment (traces, metrics, logs)
- Enterprise-ready (SOC 2, HIPAA, GDPR, EU AI Act compatible)

---

## 4. ARCHITECTURE DECISIONS

### AD-1: Observalidade Model
**Decision:** Structured logging (not dashboard-first)
**Rationale:** Constitution Art. I (CLI First) — observability is CLI, dashboards observe
**Impact:** `.aiox/audit-logs/` JSONL files, queryable via CLI `jq`
**Alternative Rejected:** Centralized observability backend (too complex for solo founder)

### AD-2: Hook Integration
**Decision:** Leverage existing `.claude/hooks/` (SessionStart, PreToolUse, PostToolUse, etc.)
**Rationale:** 11 hooks already active, reuse instead of creating new infrastructure
**Impact:** Zero new dependencies, automatic telemetry capture
**Alternative Rejected:** Custom telemetry middleware (reinvention)

### AD-3: Audit Trail Format
**Decision:** JSONL (JSON Lines) — one JSON object per line
**Rationale:** Streamable, queryable with standard tools (jq, awk), append-only (no locks)
**Impact:** `.aiox/audit-logs/agent-decisions.jsonl` grows continuously, rotated daily
**Alternative Rejected:** Database (adds complexity for solo dev)

### AD-4: Agent Authority Clarity
**Decision:** Explicit exclusivity matrix (yes/no per operation)
**Rationale:** NEVER ambiguous — who can do X?
**Impact:** One matrix source of truth, all agents check before action
**Alternative Rejected:** Implicit authority (causes violations)

### AD-5: Security by Default
**Decision:** Whitelist dangerous patterns, NEVER allow by default
**Rationale:** Constitution Art. IV (No Invention) applies to security too
**Impact:** CLAUDE.md explicitly blocks: secrets in git, mock data, SQL injection, unvalidated input
**Alternative Rejected:** Trust defaults (leads to breaches)

---

## 5. ACCEPTANCE CRITERIA (Definition of Done)

### AC-1: Content Complete
- [ ] CLAUDE.md v3.1 has 15 sections (no missing sections)
- [ ] 120-150 lines (comprehensive, not bloated)
- [ ] Every rule prevents a real mistake (can cite past incident or potential risk)
- [ ] Zero ambiguities (tested against edge cases)

### AC-2: Observalidade Integrated
- [ ] "Observalidade Patterns" section exists
- [ ] Traces, metrics, logs defined (not abstract)
- [ ] OpenTelemetry semantic conventions referenced
- [ ] `.claude/hooks/` integration documented

### AC-3: Audit Trail Specified
- [ ] "Audit & Compliance" section exists
- [ ] 7 things to log enumerated (with examples)
- [ ] `.aiox/audit-logs/` JSONL schema defined (4 files)
- [ ] Compliance frameworks listed (EU AI Act, NIST, ISO, SOC 2, HIPAA)
- [ ] Retention policy documented (6 months minimum)

### AC-4: Hook Metrics Defined
- [ ] `.synapse/metrics/hook-metrics.json` schema expanded
- [ ] 12+ new fields documented
- [ ] Daily rollup structure specified
- [ ] Example JSON provided (no ambiguity)

### AC-5: Agent Authority Crystal-Clear
- [ ] Matrix updated (9 agents, 3 new clarifications)
- [ ] Every operation has owner (no gaps)
- [ ] Escalation paths documented
- [ ] @devops git authority non-negotiable (repeated 3x for clarity)

### AC-6: Security Hardened
- [ ] "Security by Default" section added
- [ ] 5 security-first rules listed with examples
- [ ] OWASP top 10 checklist referenced
- [ ] Secrets management patterns explicit

### AC-7: Gates Passed
- [ ] npm run lint passes (CLAUDE.md is valid markdown)
- [ ] CodeRabbit review clean (if applicable)
- [ ] All 20 `.claude/rules/*.md` files still referenced
- [ ] Git commit passes pre-commit hooks (story validation)

---

## 6. IMPLEMENTATION ROADMAP

### Story 1: CLAUDE.md v3.1 Content + Structure (13 points)
**Agent:** @architect (design) + @dev (implement)
**Tasks:**
- [ ] Design governance structure (15 sections)
- [ ] Write Observalidade section (with OTel reference)
- [ ] Write Audit & Compliance section (7 things + frameworks)
- [ ] Write Security by Default section
- [ ] Clarify Agent Authority matrix
- [ ] Update IDS Decision Hierarchy
- [ ] Update Quality Gates section
- [ ] Verify no gaps (20 rule files still referenced)
- [ ] Target: 120-150 lines, zero ambiguities
**Success:** CLAUDE.md v3.1 ready for review

### Story 2: Audit Trail JSONL Schema + Examples (8 points)
**Agent:** @architect (design) + @dev (implement)
**Tasks:**
- [ ] Define `.aiox/audit-logs/` directory structure
- [ ] Define agent-decisions.jsonl schema (example: `{timestamp, decision_type, verdict, reason, user, session, impact}`)
- [ ] Define tool-calls.jsonl schema (example: `{timestamp, tool, args, result, duration_ms, user, session}`)
- [ ] Define gate-verdicts.jsonl schema (example: `{timestamp, article, decision, override, reason, user, session}`)
- [ ] Define errors-overrides.jsonl schema (example: `{timestamp, error_type, override_applied, reason, user, session}`)
- [ ] Create example JSONL files (no ambiguity)
- [ ] Document CLI query examples (`jq` commands to inspect logs)
**Success:** Schema so clear that any agent can implement without questions

### Story 3: Hook Metrics Expansion + OpenTelemetry Base (5 points)
**Agent:** @dev (implementation only, schema from @architect)
**Tasks:**
- [ ] Expand `.synapse/metrics/hook-metrics.json` structure (add 12+ fields)
- [ ] Update `.aiox-core/core-config.yaml` with metrics section
- [ ] Create example metrics JSON
- [ ] Create daily rollup script (`.aiox/metrics/daily-{YYYY-MM-DD}.json`)
- [ ] Create CLI command: `claude metrics --summary` (shows real-time stats)
- [ ] Create optional Prometheus exporter (reference, not required)
**Success:** Metrics queryable, real data flowing, zero guessing

---

## 7. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| CLAUDE.md becomes bloated (>200 lines) | Hard to read, rules ignored | Strict 120-150 line budget; remove duplicates of `.claude/rules/` |
| Ambiguities remain (gaps in authority) | Violations continue | Test every rule against edge cases before shipping |
| Observalidade overhead slows development | Adoption resistance | Start with minimal logging; expand incrementally |
| Audit trail data explosion | Storage issues | Daily rotation; 6-month retention policy |
| Security rules missed (incomplete) | Breach risk | OWASP top 10 checklist; security-first mindset from start |

---

## 8. SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| CLAUDE.md clarity | 0 ambiguities | All rules testable against edge cases |
| Audit trail adoption | 100% of decisions logged | grep -c "decision_type" .aiox/audit-logs/* > 0 |
| Hook metrics coverage | 12+ fields tracked | wc -l .synapse/metrics/hook-metrics.json ≥ 12 |
| Agent authority violations | 0 | Pre-commit hook blocks unauthorized actions |
| Security incidents | 0 | No secrets in git, no mock data, no injection |
| Documentation gaps | 0 | All 15 sections present, all 20 rule files referenced |

---

## 9. TIMELINE & DEPENDENCIES

**Week 1 (Cont 81):** Story 1 — CLAUDE.md v3.1 complete
- @architect: governance design (2 days)
- @dev: content creation (3 days)
- Review: @pm approval (1 day)

**Week 2 (Cont 82):** Story 2 — Audit Trail Schema
- @architect: schema design (2 days)
- @dev: JSONL files + CLI (3 days)
- QA: testing + examples (1 day)

**Week 3 (Cont 83):** Story 3 — Metrics Expansion
- @dev: hook metrics + script (3 days)
- QA: validation (2 days)

**Total: 3 weeks, 26 story points**

---

## 10. OWNER HANDOFF

**@pm (Morgan):** Create epic, prioritize stories, track delivery
**@architect (Aria):** Design governance structure, JSONL schema, security patterns
**@dev (Dex):** Implement all 3 stories per spec
**@qa (Quinn):** Validate AC, test edge cases, security review
**@devops (Gage):** Pre-commit hook enforcement, metrics export (optional)

---

## 11. REFERENCES

**Research (from 2026-06-25 investigation):**
- CLAUDE.md Best Practices: https://medium.com/@bijit211987/the-complete-guide-to-claude-md-memory-rules-loading-and-cross-tool-compression-97cc12ed037b
- Observalidade/AI Agents: https://opentelemetry.io/blog/2025/ai-agent-observability/
- Audit Trail Compliance: https://www.superblocks.com/blog/ai-audit-trail

**Internal:**
- `.aiox-core/constitution.md` (v1.1.0)
- `.claude/rules/` (20 files, auto-loaded)
- `.synapse/metrics/hook-metrics.json` (current)
- `CLAUDE.md` (v3.0, baseline)

---

**Status:** Draft → Ready for @pm/@architect review
**Last Updated:** 2026-06-25
**Next Step:** @pm creates epic + 3 stories from this PRD
