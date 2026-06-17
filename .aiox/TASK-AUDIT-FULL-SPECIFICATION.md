# Task Spec: `*audit-full` — Deterministic Framework Truth Audit

**Author:** Orion (@aiox-master)  
**Status:** READY FOR IMPLEMENTATION  
**Complexity:** 15-20 story points  
**Scope:** Complete framework sync audit, 8 deterministic checks, zero ambiguity

---

## SUMMARY

Execute **8 deterministic checks** do AIOX framework. Output: JSON (machine-readable) + MD (human-readable).

- **Discovers:** All 10 gaps do @analyst + Morgan's 9 gaps
- **Time:** ~2-3 minutos (828 registry paths, 36 hooks, 100+ stories)
- **Determinism:** Mesma entrada = mesma saída (zero LLM)
- **Incremental:** Pode parar/retomar (check-by-check)

---

## COMMAND SIGNATURE

```bash
@aiox-master *audit-full [OPTIONS]

Options:
  --full           # All 8 checks (default)
  --quick          # Checks 1-3 (hooks + config, ~30s)
  --check N        # Specific check only (N=1-8)
  --fix            # Auto-fix issues (deterministic only)
  --compare        # Compare to last audit
  --threshold N    # Severity filter (1-5, default 3)

Output: .aiox/audits/truth-{YYYY-MM-DDTHH-mm-ss}.json + .md
```

---

## THE 8 CHECKS (Deterministic)

### 1. Hook Synchronization
- **Detects:** Orphaned hooks, duplicates, false registrations, missing files
- **Process:** Diff settings.json vs settings.local.json vs disk
- **Output:** Orphaned list, duplicated list, false-positive matchers
- **Known Issues:** 10 duplicated, 10 orphaned, 1 matcher false-positive

### 2. Constitutional Gate Coverage (Art. I-VII)
- **Detects:** Articles without deterministic enforcement
- **Process:** Check deny rules + hooks for each article
- **Output:** Coverage status per article, risk assessment
- **Known Issue:** Art. II has 0 deny rules (hook-only, frágil)

### 3. Registry ↔ Disk Sync
- **Detects:** Missing registry entries, orphaned files, unreferenced entries
- **Process:** Test each registry path + scan disk for unreferenced
- **Output:** 828 total, 827 existing, 1 missing (timing-logger.js)
- **Also finds:** 12 unreferenced files not in registry

### 4. Story Status Enum Validation
- **Detects:** Stories with invalid/missing status
- **Process:** Extract Status field, compare to enum (Draft|Ready|InProgress|InReview|Done)
- **Output:** 19 invalid stories (11 missing, 8 with non-standard values)
- **Sample invalids:** "Done ✅", "Aceite", "CONCLU", "ROADMAP CREATED"

### 5. Version Source Authority
- **Detects:** Conflicting version sources (4 found)
- **Process:** Read core-config.yaml, package.json, .aiox-core/version.json
- **Output:** All 4 sources + conflicts + authoritative candidate
- **Conflicts:** 2.1.0 vs 0.1.0 vs 5.2.9 (5.8x difference)

### 6. Documentation Count Drift
- **Detects:** Documented numbers out of sync with reality
- **Process:** Extract numbers from docs → count actual → compare
- **Output:** Drift percentages + missing entries
- **Drifts:** Agents 12/12 ✓; Rules 8 documented vs 16 actual (100% drift); Hooks 5 vs 36 (620% drift)

### 7. Dangling References
- **Detects:** Tasks/docs referencing non-existent files/commands
- **Process:** Scan all task files, extract refs, test existence
- **Output:** Missing files, missing commands, broken links
- **Examples:** timing-logger.js referenced but missing; *diagnose-synapse documented but doesn't exist

### 8. Agent Memory & State Completeness
- **Detects:** Incomplete agent memory, oversized STATE.md, log growth
- **Process:** Check memory files per agent + measure STATE.md + count logs
- **Output:** 9/12 agents with memory; STATE.md 172KB (overhead); 50 task logs, 47 gate logs
- **Warnings:** STATE.md loaded on every SessionStart (context cost)

---

## AUTO-FIX (if `--fix` flag)

Deterministic fixes ONLY (zero custom logic, requires `--confirm` for destructive):

| Fix | Action | Requires confirm? |
|-----|--------|------------------|
| 1.1 | Remove duplicates from settings.local.json | YES |
| 3 | Remove missing registry entries | NO (safe) |
| 4 | Normalize story status Draft/Ready/etc | YES |
| 5 | Update documented numbers in CLAUDE.md | NO (safe) |
| 6 | Remove broken references from docs | NO (safe) |
| 7 | Archive agent memory templates | YES |

---

## ACCEPTANCE CRITERIA

✅ Runs in < 3 minutes (full)  
✅ JSON deterministic + reproducible  
✅ All 8 checks pass/fail clearly  
✅ Severity 1-5 aligned with impact  
✅ Recommendations actionable  
✅ Incremental (`--check N`) works  
✅ `--fix` safe for checks 3, 5, 6  
✅ Output saved with timestamp  
✅ Discovers all 10 gaps do @analyst + Morgan's 9  

---

## TOP DISCOVERIES

**From @analyst brainstorm (17 gaps, 10 severity-5 issues):**

1. **Art. II defenseless** — 0 deny rules, hook-only frágil
2. **10 hooks executam 2x** — settings.json + settings.local.json duplicação
3. **Matcher substring falso-positivo** — "Bash(*git push*)" bloqueia legítimos
4. **10 hooks órfãos** — 5 Python desconhecidos, 3 shell, 2 JS
5. **19 story status inválidos** — sem enum enforçado
6. **832KB context overhead** — STATE.md 172KB + SYNAPSE lazy-load
7. **3 versões conflitantes** — 2.1.0 vs 0.1.0 vs 5.2.9
8. **Timing-logger.js documentado mas missing** — dangling ref
9. ***diagnose-synapse comando fantasma** — doc diz existe, não existe
10. **Story status não-determinístico** — "Draft" vs "CONCLU" vs "Done ✅" no mesmo repo

---

## NEXT STEP

Implementar como **Priority 1 (P1)** story antes de EPIC-12 Phase 1.

Script: `audit-full.js` (sem dependências externas, puro Node.js)  
Onde: `.aiox-core/core/doctor/checks/` (não L2, é permitido em L3 config)  
Integração: Adicionar a `@aiox-master *audit-full` como Orion task  
CI/CD: Nightly run, alertar se severity > 3 encontrado

---

**Pronto para:** @dev implementação (15-20sp, 2 semanas)
