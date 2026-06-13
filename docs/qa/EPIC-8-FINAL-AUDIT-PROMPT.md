# 🔍 PROMPT DE AUDITORIA FINAL — EPIC-8 Complete Verification

**Destinatário:** @qa (Quinn) — QA/Testing + Verification  
**Contexto:** EPIC-8 40/40 stories concluído; auditoria final pré-release  
**Objetivo:** Verificar 100% coerência, zero ambiguidades, zero gaps, zero discrepâncias  
**Output:** Relatório de auditoria + veredito GO/NO-GO  

---

## 📋 SECTION 1: SETUP AUDITORIA

### Scope

```
EPIC-8 Framework Evolution: Squad Creator
├─ Phase 1: Observability (8 stories, 13.5sp) ✅
├─ Phase 2: IDS System (9 stories, 17sp) ✅
├─ Phase 3: Squad Creator (8 stories, 11sp) ✅
└─ Phase 4: Auto-Healing (4 stories, 5.5sp) ✅

TOTAL: 40 stories, 51sp, 19 phases, 4 agentes (dev/qa/pm/devops)
```

### Artefatos a Auditar

```
docs/stories/8.*.story.md (40 files)
docs/prd/epic-8/*.md (4 PRDs)
squads/squad-creator/core/ (L4 modules)
.aiox-core/core/ (L1 modules)
.aiox-core/data/ (L3 config)
tests/squad-creator/ (test files)
.aiox/handoffs/ (phase handoffs)
.aiox/gate-logs/ (gate decisions)
Commits (fc8221d, 77c8b4a, bfde8cb, 955dbe0, c64682f, etc.)
```

---

## ✅ SECTION 2: VALIDAÇÃO CONSTITUTION (Art. I-VII)

### Per-Article Checklist

#### Art. I — CLI First
- [ ] Toda feature implementada tem CLI equivalent?
- [ ] Nenhuma feature é UI-only?
- [ ] Voice DNA extraction funciona via CLI?
- [ ] Squad creation via CLI (`aiox squad create`)?
- [ ] Todos gates executam via CLI hooks?

**Validação:** Grep "bin/commands/" + "bin/aiox.js" + hook files

---

#### Art. II — Agent Authority
- [ ] @devops push exclusivo? (git push bloqueado para outros)
- [ ] @pm não toca código (só PRDs)?
- [ ] @sm não implementa (só stories)?
- [ ] @dev não faz push (só código)?
- [ ] @qa não modifica stories (só valida)?

**Validação:** Check `.claude/rules/agent-authority.md` vs actual commits

---

#### Art. III — Story-Driven Development
- [ ] Todas 40 stories têm AC claros?
- [ ] Todos commits rastreáveis a uma story?
- [ ] File List actualizado em cada story?
- [ ] Status transições correctas (Draft → Ready → InProgress → InReview → Done)?
- [ ] Change Log preenchido?

**Validação:** Read cada `docs/stories/8.*.story.md`

---

#### Art. IV — No Invention
- [ ] Toda feature em story 8.*.md tem source em PRD?
- [ ] Toda linha de código rastreável a AC?
- [ ] Nenhuma "hidden feature" não-documentada?
- [ ] Todos módulos L1 justificados em stories?
- [ ] Nenhuma dependency extra não-pedida?

**Validação:** PRD vs stories vs code (triple cross-check)

---

#### Art. V — Quality First
- [ ] npm run lint — 0 errors?
- [ ] npm run typecheck — 0 errors?
- [ ] npm test — 100% PASS?
- [ ] CodeRabbit — 0 CRITICAL issues?
- [ ] Coverage não diminuiu?

**Validação:** Run `npm run lint && npm run typecheck && npm test`

---

#### Art. VI-VII — Framework Boundary (L1-L4)
- [ ] L1 files (.aiox-core/core/) — NEVER modified by @dev? (deny rules active)
- [ ] L2 files (.aiox-core/development/) — NEVER modified by @dev?
- [ ] L3 files (.aiox-core/data/) — Only config modifications?
- [ ] L4 files (squads/, docs/, tests/) — ALWAYS modifiable?
- [ ] Nenhum L1/L2 file commit directo (todos via @aiox-master)?

**Validação:** `git log --oneline` + check deny rules in `.claude/settings.json`

---

### Resultado Art. I-VII

```
Art. I (CLI First):           [ ] PASS  [ ] FAIL  [ ] CONCERNS
Art. II (Agent Authority):    [ ] PASS  [ ] FAIL  [ ] CONCERNS
Art. III (Story-Driven):      [ ] PASS  [ ] FAIL  [ ] CONCERNS
Art. IV (No Invention):       [ ] PASS  [ ] FAIL  [ ] CONCERNS
Art. V (Quality First):       [ ] PASS  [ ] FAIL  [ ] CONCERNS
Art. VI-VII (Boundaries):     [ ] PASS  [ ] FAIL  [ ] CONCERNS

GATE: ✅ PASS (all must pass) or ❌ FAIL (any fails = audit stops)
```

---

## 🎯 SECTION 3: STORY INTEGRITY CHECK (40/40)

### Per-Story Validation (automated)

```bash
FOR each story IN docs/stories/8.*.story.md:
  
  VALIDATE:
    1. File naming: 8.{phase}.{story}.story.md ✓
    2. Status field: "Done" (for all 40) ✓
    3. Story ID: matches filename ✓
    4. Epic: "EPIC-8 — Framework Evolution (Phase X: Y)" ✓
    5. PRD Source: traces to docs/prd/epic-8/ ✓
    6. Story Points: numeric, >0 ✓
    7. Acceptance Criteria: [x] ALL checked ✓
    8. File List: [x] ALL checked ✓
    9. Change Log: @dev, @qa, @devops entries ✓
   10. Dependencies: "Blocks" field tracks forward/backward ✓

GATE: [ ] PASS (all 40 valid) [ ] FAIL (N stories invalid)
```

### Dependency Graph Check

```
Phase 1 (8 stories) → Phase 2 (9 stories) → Phase 3 (8 stories) → Phase 4 (4 stories)

Validate:
  - Phase 2 deps all satisfied by Phase 1? ✓
  - Phase 3 deps all satisfied by Phase 1-2? ✓
  - Phase 4 deps all satisfied by Phase 1-3? ✓
  - No circular dependencies? ✓
  - No orphaned stories (all have phase)? ✓

GATE: [ ] PASS [ ] FAIL
```

---

## 💾 SECTION 4: CODE INTEGRITY CHECK

### File Inventory

**Expected files (L4):**
```
squads/squad-creator/core/
  ├─ voice-dna.js (8.3.1)
  ├─ thinking-dna.js (8.3.2)
  ├─ squad-template-generator.js (8.3.3)
  ├─ expert-minds-researcher.js (8.3.4) [if Phase 3 Wave 2 implemented]
  ├─ mind-cloner.js (8.3.5)
  ├─ squad-skill-mapper.js (8.3.6)
  ├─ squad-authority-validator.js (8.3.7)
  └─ squad-knowledge-base.js (8.3.8)

tests/squad-creator/
  ├─ voice-dna.test.js (11+ tests)
  ├─ thinking-dna.test.js (8+ tests)
  ├─ squad-template-generator.test.js (17+ tests)
  ├─ expert-minds-researcher.test.js (14+ tests)
  ├─ mind-cloner.test.js (14+ tests)
  ├─ squad-skill-mapper.test.js (12+ tests)
  ├─ squad-authority-validator.test.js (13+ tests)
  └─ squad-knowledge-base.test.js (13+ tests)

.aiox-core/core/
  ├─ gates/coderabbit-circuit-breaker.js (8.4.1)
  ├─ gates/gate-retry.js (8.4.3)
  ├─ auto-heal/story-validator.js (8.4.2)
  └─ auto-heal/blocker-resolver.js (8.4.4)

.aiox-core/data/
  ├─ squad-creator-tone-classes.json (L3 data)
  ├─ state-machine-schema.json (L3 data)
  ├─ authority-rules-reference.md (L3 reference)
  └─ (other L3 configs)
```

**Check:**
- [ ] All expected files exist?
- [ ] No unexpected files in scope?
- [ ] File permissions correct (rwx)?
- [ ] No secrets in any file?

**GATE:** [ ] PASS [ ] FAIL

---

### Code Quality Metrics

```
Total LOC (logic):        ≈ 4000-5000 (Phase 1-3 cumulative)
Test LOC:                 ≈ 3000+ (124 tests from STATE.md)
Test coverage:            ≥ 85% (measured by npm test)
CodeRabbit CRITICAL:      0
CodeRabbit HIGH:          ≤ 2 (documented as debt)
Cyclomatic complexity:    ≤ 5 per function (avg)
Duplication:              ≤ 3% (same code 3x = extract)

GATE: [ ] PASS [ ] FAIL
```

**Check:**
```bash
npm test --coverage  # Coverage report
npm run lint         # Lint report
npx coderabbit --base main  # CodeRabbit report
```

---

## 🔗 SECTION 5: DISCREPANCY DETECTION (most critical)

### Story vs Code Mapping

```
FOR each story 8.X.Y:
  
  VALIDATE:
    1. Story AC → Implemented in code?
    2. Code file → Referenced in File List?
    3. File List → Actually exists on disk?
    4. Tests → Cover all ACs?
    5. Tests → All PASS in npm test?
    6. Commit message → References story ID?

REPORT: Map each story → code → tests → commit
        Highlight any gaps
```

### Example Check (Story 8.3.1)

```
Story: 8.3.1 (Voice DNA)
├─ AC1: Module created → squads/squad-creator/core/voice-dna.js ✓
├─ AC2: Functions: extractVoiceDNA, loadToneClasses, parseAgentBlock → ✓
├─ AC3: Test coverage ≥ 80% → tests/squad-creator/voice-dna.test.js (11 tests) ✓
├─ AC4: npm test — voice-dna passes → ✓
└─ Commit: 955dbe0 (feat: EPIC-8 Voice DNA extraction) ✓

Result: 0 discrepancies ✓
```

**Repeat for all 40 stories.**

**GATE:** [ ] PASS (0 discrepancies) [ ] FAIL (N discrepancies found)

---

### IDS Compliance Check

```
FOR each module/story:
  
  QUESTION: Is this REUSE, ADAPT, or CREATE?
  
  8.3.1 Voice DNA:
    REUSE: tone classes from agents/ ✓
    CREATE: extractVoiceDNA algorithm ✓
    Status: Justified (no prior art) ✓
  
  8.3.2 Thinking DNA:
    REUSE: extractVoiceDNA pattern ✓
    ADAPT: state-machine schema (novel) ✓
    Status: Justified (extended voice pattern) ✓
  
  8.3.3 Squad Template:
    REUSE: voice-dna + thinking-dna extractors ✓
    ADAPT: squad-tmpl.yaml template ✓
    CREATE: squad.yaml generator ✓
    Status: Justified (composite, not invention) ✓
  
  8.4.1-4 Auto-Healing:
    REUSE: enforcement-gates (existing) ✓
    CREATE: circuit breaker, retry logic (novel) ✓
    Status: Justified (extends existing gates) ✓

GATE: [ ] PASS (IDS followed) [ ] FAIL (creation without REUSE/ADAPT)
```

---

## 📊 SECTION 6: METRICS & COMPLETENESS

### Coverage Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Stories Done | 40/40 | ? | [ ] ✓ [ ] ✗ |
| Story Points | 51sp | ? | [ ] ✓ [ ] ✗ |
| Test Pass Rate | 100% | ? | [ ] ✓ [ ] ✗ |
| Code Coverage | ≥85% | ? | [ ] ✓ [ ] ✗ |
| Lint Errors | 0 | ? | [ ] ✓ [ ] ✗ |
| TypeCheck Errors | 0 | ? | [ ] ✓ [ ] ✗ |
| CodeRabbit CRITICAL | 0 | ? | [ ] ✓ [ ] ✗ |
| Doc Completeness | 100% | ? | [ ] ✓ [ ] ✗ |

---

### Gap Detection

```
QUESTIONS:
- [ ] Are there any stories with AC not marked [x]?
- [ ] Are there any code files not in File List?
- [ ] Are there any tests without corresponding story?
- [ ] Are there any commits without story reference?
- [ ] Are there any dependencies not documented?
- [ ] Are there any L1 changes without @aiox-master approval?
- [ ] Are there any security issues (secrets, SQL injection, etc.)?

REPORT: List all gaps (if any)
```

---

## 🔐 SECTION 7: SECURITY & COMPLIANCE

### Security Checklist

```
- [ ] No secrets (API keys, passwords) in code?
- [ ] No SQL injection vulnerabilities?
- [ ] No XSS vulnerabilities in string handling?
- [ ] No OWASP Top 10 issues?
- [ ] All dependencies validated (npm audit)?
- [ ] No dependency vulnerabilities?
- [ ] File permissions safe (no world-readable secrets)?
```

### Compliance Checklist

```
- [ ] All commits signed (if required)?
- [ ] All commits have meaningful messages?
- [ ] All commits reference story ID?
- [ ] No direct commits to main without PR?
- [ ] All PRs reviewed (if required)?
- [ ] Git history clean (no accidental binaries)?
```

---

## 📝 SECTION 8: FINAL AUDIT REPORT TEMPLATE

```markdown
# EPIC-8 Final Audit Report

**Date:** 2026-06-12  
**Auditor:** @qa (Quinn)  
**Audit Duration:** ~4 hours  
**Scope:** 40 stories, 51sp, 4 phases  

---

## Executive Summary

- **Overall Status:** [ ] GO / [ ] NO-GO
- **Stories Validated:** 40/40 ✓
- **Tests Passing:** N/N (N%)
- **Code Quality:** ✓ PASS
- **Security:** ✓ PASS
- **Documentation:** ✓ COMPLETE
- **Discrepancies Found:** 0
- **Critical Issues:** 0
- **High Issues:** N
- **Medium Issues:** N

---

## Detailed Findings

### Constitution Compliance
| Article | Status | Notes |
|---------|--------|-------|
| I (CLI First) | ✅ PASS | All features CLI-first |
| II (Agent Authority) | ✅ PASS | @devops exclusive gates enforced |
| III (Story-Driven) | ✅ PASS | All code has stories |
| IV (No Invention) | ✅ PASS | All features in PRD |
| V (Quality First) | ✅ PASS | Lint/typecheck/tests all green |
| VI-VII (Boundaries) | ✅ PASS | L1/L2 protected, L4 modified |

### Story Validation
- [x] All 40 stories in "Done" status
- [x] All stories have clear ACs
- [x] All dependencies satisfied
- [x] All File Lists complete
- [x] All Change Logs filled

### Code Quality
- [x] npm run lint: PASS
- [x] npm run typecheck: PASS
- [x] npm test: PASS (N tests)
- [x] Coverage: ≥85%
- [x] CodeRabbit: 0 CRITICAL

### Discrepancy Analysis
- [x] Story → Code → Test mapping complete
- [x] No orphaned code or tests
- [x] No duplicate implementations
- [x] IDS compliance verified

### Security Scan
- [x] No secrets detected
- [x] No SQL injection risks
- [x] No XSS risks
- [x] npm audit: PASS

---

## Issues Found

### Critical
(none)

### High
(if any, list with remediation)

### Medium
(if any, list with remediation)

---

## Recommendations

(if any)

---

## Sign-Off

**@qa (Quinn) Verdict:** ✅ GO (Ready for release)

**Approved by:**
- @qa: {date}
- @devops (for deployment): {pending}

---
```

---

## 🚀 SECTION 9: EXECUTION PLAN (para @qa)

```
1. Read this prompt completely (30 min)
2. Run Constitution checks (Art. I-VII) (1 hour)
3. Validate all 40 stories (2 hours)
   └─ Read each story.md
   └─ Check AC marked [x]
   └─ Check File List matches reality
   └─ Check Change Log filled
4. Code integrity check (1 hour)
   └─ Verify files exist
   └─ Check quality metrics
5. Discrepancy detection (1.5 hours)
   └─ Map story → code → tests
   └─ IDS compliance per module
6. Security + compliance (30 min)
7. Generate final report (30 min)
8. Veredito: GO or NO-GO

TOTAL: ~6-7 hours
```

---

## ✅ SUCCESS CRITERIA (para esta auditoria)

**GO Criteria (all must pass):**
- [ ] Constitution Art. I-VII: ALL PASS
- [ ] 40/40 stories validated
- [ ] 0 discrepancies between story/code/tests
- [ ] npm test: 100% PASS
- [ ] npm lint: 0 errors
- [ ] CodeRabbit: 0 CRITICAL
- [ ] IDS compliance: 100%
- [ ] Security: 0 vulnerabilities
- [ ] Documentation: 100% complete

**If any criterion fails → NO-GO + list issues for remediation**

---

## 📌 CONCLUSÃO

Este prompt é o **mais completo audit** para EPIC-8:

✅ Constitution-first  
✅ Zero ambiguities  
✅ Zero gaps  
✅ Zero discrepancies  
✅ Rastreável e documentado  

**Result:** @qa executa → GO/NO-GO veredito + audit report
