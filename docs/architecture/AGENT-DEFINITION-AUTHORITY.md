# Agent Definition Authority Matrix

**Status:** Research Document (supports EPIC-13.1 implementation)  
**Created:** 2026-06-21  
**Owner:** @architect (mapping) + @dev (validation via 13.1)  
**Data Source:** Audit 2026-06-21 (real file counts + registry checksums)

---

## Executive Summary

Agent definitions exist in **4 locations** across L2-L3. This creates ambiguity about which is canonical, whether copies diverge silently, and what the 44 "expert clones" are.

**Finding:** L2 is source of truth for 12 canonical agents. L3 legacy status unclear. L3 generated has 44 mystery experts.

**Resolution path:** Verify sync, document L3a status, find origin of expert clones.

---

## The 4 Locations — Real Data

### L2: Framework Source (`.aiox-core/development/agents/`)

**Authority:** PRIMARY (read-only for L3 targets)  
**Mutability:** NEVER (L1-L2 protected)  
**Count:** 12 canonical agents  
**Last audit:** 2026-06-21

**Canonical agents (12):**
```
.aiox-core/development/agents/
├── aiox-master.md
├── analyst.md
├── architect.md
├── data-engineer.md
├── dev.md
├── devops.md
├── pm.md
├── po.md
├── qa.md
├── sm.md
├── squad-creator.md
└── ux-design-expert.md
```

**Checksum tracking:** Yes (in `.aiox-core/data/entity-registry.yaml`)  
**Example entry:**
```yaml
agents:
  architect:
    path: .aiox-core/development/agents/architect.md
    layer: L2
    checksum: sha256:badc8a9859cb313e908d4ea0f4c4d7bc1be723214e38f26d55c366689fe5e3f0
    lastVerified: 2026-06-01T17:32:24.879Z
```

---

### L3a: Legacy Shim (`.claude/agents/`)

**Authority:** UNCLEAR (verify before decisions)  
**Mutability:** Mutable (L3)  
**Count:** 11 files  
**Last audit:** 2026-06-21  
**Status:** ⚠️ **UNKNOWN** — could be fallback, deprecated, or unused

**Files found (11):**
```
.claude/agents/
├── aiox-analyst.md
├── aiox-architect.md
├── aiox-data-engineer.md
├── aiox-dev.md
├── aiox-devops.md
├── aiox-pm.md
├── aiox-po.md
├── aiox-qa.md
├── aiox-sm.md
├── aiox-ux.md
└── squad.md
```

**Observations:**
- **Naming mismatch:** "aiox-" prefix (L2 doesn't use prefix)
- **Missing:** aiox-master, squad-creator
- **Extra:** squad.md (not in L2)
- **Size:** Comparable to L2 files (suggesting copies, not stubs)

**Questions (to answer in 13.1):**
1. Is `.claude/agents/` still used by anything?
2. Is it a fallback for when L2 unavailable? Or deprecated copy?
3. Can we delete it?
4. Why the "aiox-" naming convention?

---

### L3b: Generated Skills (`.claude/skills/AIOX/agents/*/SKILL.md`)

**Authority:** MIXED  
- Canonical 12: Generated from L2 (assume)
- Experts 44: Unknown origin

**Mutability:** Mutable (L3), but should be regenerated from L2  
**Count:** 56 files total (12 canonical + 44 mystery)  
**Last audit:** 2026-06-21  
**Status:** ⚠️ **PARTIALLY UNKNOWN**

**Canonical 12 (L2 match):**
```
.claude/skills/AIOX/agents/
├── aiox-master/SKILL.md
├── analyst/SKILL.md
├── architect/SKILL.md
├── data-engineer/SKILL.md
├── dev/SKILL.md
├── devops/SKILL.md
├── pm/SKILL.md
├── po/SKILL.md
├── qa/SKILL.md
├── sm/SKILL.md
├── squad-creator/SKILL.md
└── ux-design-expert/SKILL.md
```

**Checksum validation:** Can verify against L2 checksums in entity-registry.yaml  
**Status:** ✅ Should be in sync

---

**Expert Clones 44 (NOT in L2):**

| Group | Agents | Count | Category |
|---|---|---|---|
| **Deep Research Squad** | booth, cochrane, creswell, forsgren, gilad, higgins, ioannidis, kahneman, klein, sackett | 10 | Expert personas |
| **Domain Chiefs** | data-chief, design-chief, copy-chief, legal-chief, cyber-chief | 5 | Domain specialists |
| **Architects** | hooks-architect, project-integrator, roadmap-sentinel | 3 | Specialized architects |
| **AI/System Orchestrators** | mcp-integrator, swarm-orchestrator, tools-orchestrator, nano-banana-generator, sop-extractor, story-chief | 6 | System-level agents |
| **Design Experts** | brad-frost, dan-mall, design-system | 3 | Design personas |
| **Forge System** | forge-architect, forge-builder, forge-classifier, forge-planner, forge-researcher, forge-verifier | 6 | Code generation pipeline |
| **Squad Leadership** | squad-chief, dr-orchestrator, claude-mastery-chief, traffic-masters-chief | 4 | Squad coordination |
| **Utilities** | config-engineer, skill-craftsman, aiox-cerebro, aiox-ux, oalanicolas, pedro-valerio | 6 | Framework tooling + clones |

**Total expert clones:** 44  
**Verification status:** ❌ NOT IN REGISTRY (no L2 counterparts)

**Critical questions:**
1. **Where were these created?** Which PR/story?
2. **Are they maintained?** Do they drift from L2?
3. **Why only in SKILLS?** Why not registered as official agents?
4. **Are they documented?** What's their purpose?

---

## Authority Hierarchy — PROPOSED

```
L2 (`.aiox-core/development/agents/`)
  │
  ├── IS SOURCE OF TRUTH
  │   └── For canonical 12 agents only
  │
  └── Checksum: entity-registry.yaml tracks L2 → L3b sync
        
        ↓ (ideSync: L2 → L3b)
        
L3b (`.claude/skills/AIOX/agents/*/SKILL.md`)
  │
  ├── GENERATED from L2 (canonical 12)
  │   └── Verified via checksum match
  │
  ├── UNKNOWN origin (experts 44)
  │   └── Need to audit: created where? maintained how?
  │
  └── ideSync gate checks both (13.3)

        ↓ (override path?)
        
L3a (`.claude/agents/`)
  │
  ├── LEGACY FALLBACK? (UNKNOWN)
  │   └── If used, should mirror L2
  │   └── If deprecated, should delete
  │
  └── Needs decision in 13.1
```

---

## Sync Verification (For EPIC-13.1)

### AC1: Canonical 12 Checksum Match

**Test:** Compare L2 checksum (entity-registry) vs L3b file hash

```bash
# For each canonical agent:
agent="architect"

# Get L2 checksum from registry:
l2_checksum=$(grep -A5 "^  ${agent}:" .aiox-core/data/entity-registry.yaml | grep "checksum:" | awk '{print $NF}')

# Compute L3b checksum:
l3b_checksum=$(sha256sum ".claude/skills/AIOX/agents/${agent}/SKILL.md" | awk '{print $1}')

# Verify match:
if [ "$l2_checksum" == "$l3b_checksum" ]; then
  echo "✅ $agent: in sync"
else
  echo "❌ $agent: DRIFT DETECTED"
fi
```

**Expected outcome:** All 12 match (or document why they don't)

---

### AC2: L3a Legacy Status

**Questions to answer:**
1. Are any files in `.claude/agents/` referenced by active code?
   ```bash
   grep -r "\.claude/agents/" . --include="*.js" --include="*.md" --include="*.json"
   ```

2. Is L3a used as fallback if L3b unavailable?
   ```bash
   grep -r "\.claude/agents/" .claude/settings.json .claude/rules/ --include="*.json" --include="*.md"
   ```

3. Is deletion safe? (No broken references)
   ```bash
   # If answer to 1 & 2 is "no", safe to delete
   rm -rf .claude/agents/
   ```

**Expected outcome:** Clear decision — keep+sync or delete

---

### AC3: Expert Clones Origin & Status

**Investigation:**
1. **Find creation:** Search git log for agent skill creation
   ```bash
   git log --all --name-only --pretty=format: -- '.claude/skills/AIOX/agents/booth' | head -1
   git log --oneline -1 $(git log --all --name-only --pretty=format: -- '.claude/skills/AIOX/agents/booth' | grep -m1 'SKILL.md')
   ```

2. **Document each group:** Create entry in registry for all 44
   ```yaml
   agents:
     booth:
       path: .claude/skills/AIOX/agents/booth/SKILL.md
       layer: L3
       type: expert_clone
       created_by: [PR or story ID]
       origin: "[SynkraAI | local creation | clone from]"
       purpose: "Deep researcher in organizational psychology"
       maintenance: [active | deprecated | experimental]
       checksum: sha256:...
   ```

3. **Classify each:** active, deprecated, or experimental
   - Active: maintained, documented, used in squads
   - Deprecated: old, no longer used, marked for removal
   - Experimental: testing phase, feedback welcome

**Expected outcome:** All 44 documented + classified

---

## Recommendations for EPIC-13.1

### Priority 1: Sync Check
- [ ] Verify canonical 12 checksums match (L2 ↔ L3b)
- [ ] Document any drift
- [ ] If drift found: which is source of truth? Regenerate or update registry?

### Priority 2: L3a Status
- [ ] Answer: Is `.claude/agents/` used?
- [ ] If no: delete + remove from settings.json paths
- [ ] If yes: document usage + ensure sync with L2

### Priority 3: Expert Clones
- [ ] Find origin of all 44 agents
- [ ] Add entries to entity-registry.yaml
- [ ] Classify: active, deprecated, experimental
- [ ] Update documentation (where are they used?)

### Priority 4: Enforcement
- [ ] Create pre-commit gate `npm run validate-agent-sync`
- [ ] Detects: missing canonical, stale checksums, orphaned experts
- [ ] Integrated into CI/CD (blocks merge if drift found)

---

## Files Created / Modified by 13.1

**New:**
- `.aiox-core/data/agent-clone-registry.yaml` (44 experts documented)
- `.claude/hooks/validate-agent-sync.cjs` (sync verification gate)

**Modified:**
- `.aiox-core/data/entity-registry.yaml` (add experts + canonical checksums)
- `.claude/settings.json` (remove `.claude/agents/` if deprecated)

**Deleted (if safe):**
- `.claude/agents/` (if confirmed unused)

---

## Acceptance Criteria (EPIC-13.1)

- [ ] All canonical 12 checksums verified in sync
- [ ] L3a legacy status determined (keep/delete/sync)
- [ ] All 44 expert clones documented with origin + classification
- [ ] entity-registry.yaml updated with all agents + checksums
- [ ] Pre-commit validation gate implemented (`npm run validate-agent-sync`)
- [ ] CI/CD integrated: merge blocked if drift detected
- [ ] Dead code removed (if identified)
- [ ] Story status: InReview (ready for @qa gate)

---

*Authority matrix complete. Ready for EPIC-13.1 audit execution.*
