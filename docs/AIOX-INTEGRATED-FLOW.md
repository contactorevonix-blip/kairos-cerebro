# AIOX Integrated Flow — Complete Development Cycle

**Version:** 2.0  
**Last Updated:** 2026-06-03  
**Compliance:** ✅ Constitution Art. I-VI  

---

## 🏛️ Constitution Compliance Check

| Article | Principle | Status | Enforcement |
|---------|-----------|--------|------------|
| **I** | CLI First | ✅ | All features via CLI before UI |
| **II** | Agent Authority | ✅ | Exclusive ops blocked by gates |
| **III** | Story-Driven | ✅ | No code without story + AC |
| **IV** | No Invention | ✅ | Spec ← Requirements only |
| **V** | Quality First | ✅ | CodeRabbit + tests blocking |
| **VI** | Absolute Imports | ✅ | Linting enforces @/ aliases |

---

## 📊 The 4 Workflows

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AIOX DEVELOPMENT SYSTEM                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ WORKFLOW 1: STORY DEVELOPMENT CYCLE (SDC) — Default for all dev    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  @pm (Morgan)          @po (Pax)         @dev (Dex)      @qa (Quinn) │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐
│  │  PRD/Epic   │  │  Validate    │  │  Implement │  │  QA Gate     │
│  │  (context)  │  │  10-point    │  │  Story     │  │  7-point     │
│  │             │  │  checklist   │  │            │  │  checklist   │
│  │ → Create    │  │              │  │ → Code     │  │              │
│  │   Epic/PRD  │  │ → GO/NO-GO   │  │ → Tests    │  │ → PASS/FAIL  │
│  │             │  │              │  │ → Submit   │  │              │
│  └─────┬───────┘  └──────┬───────┘  └────┬───────┘  └──────┬───────┘
│        │                 │              │              │
│        └────────────────►│              │              │
│                          └──────────────►│              │
│                                         └──────────────►│
│                                                         │
│                                    @devops (Gage)
│                                    ┌────────────┐
│                                    │ Push to    │
│                                    │ Remote     │
│                                    │ (EXCLUSIVE)│
│                                    └────────────┘
│
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ WORKFLOW 2: QA LOOP — Iterative review-fix (max 5 iterations)      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  @qa (Quinn)                          @dev (Dex)                    │
│  ┌────────────┐                    ┌────────────┐                  │
│  │ Review     │  ──REJECT──►       │ Fix code   │                  │
│  │ Code       │                    │            │                  │
│  │            │                    └─────┬──────┘                  │
│  │ → APPROVE  │  ◄─────────────────────┘                           │
│  │ → REJECT   │                                                    │
│  │ → BLOCKED  │                                                    │
│  └────────────┘                                                    │
│                                                                      │
│  Auto-escalate after 5 iterations or BLOCKED verdict               │
│
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ WORKFLOW 3: SPEC PIPELINE — For complex features (complexity ≥ 9)   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  @pm    @architect    @analyst    @pm      @qa      @architect    │
│  ┌──┐  ┌────────┐   ┌───────┐  ┌──┐  ┌────────┐  ┌───────────┐  │
│  │Ga│  │Assess  │   │Researc│  │Wr│  │Critique│  │Plan       │  │
│  │th│  │Complex │   │h Tech │  │it│  │Spec    │  │Implement  │  │
│  │er│  │ity     │   │nology │  │e│  │Quality │  │ation      │  │
│  │  │  │        │   │Facts  │  │ │  │Gate    │  │           │  │
│  └──┘  └────────┘   └───────┘  └──┘  └────────┘  └───────────┘  │
│   │        │          │          │       │          │             │
│   └────────►──────────►──────────►──────►──────────►─────────┘   │
│                              │                                    │
│                          NO-GO? → Revise                          │
│                              │                                    │
│                           ┌─►─────────────────┐                  │
│                           │ Then: SDC Workflow│                  │
│                           └──────────────────┘                   │
│
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ WORKFLOW 4: BROWNFIELD DISCOVERY — Legacy assessment (10 phases)    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Phases 1-3: DATA COLLECTION                                        │
│    @architect  →  system-architecture.md                            │
│    @data-eng   →  SCHEMA.md + DB-AUDIT.md                          │
│    @ux-design  →  frontend-spec.md                                 │
│                                                                      │
│  Phases 4-7: DRAFT & VALIDATION (QA Gate)                          │
│    @architect  →  technical-debt-DRAFT.md                          │
│    @data-eng   →  db-specialist-review.md                          │
│    @ux-design  →  ux-specialist-review.md                          │
│    @qa         →  qa-review.md  [GATE: APPROVED/NEEDS_WORK]       │
│                                                                      │
│  Phases 8-10: FINALIZATION                                          │
│    @architect  →  technical-debt-assessment.md (final)             │
│    @analyst    →  TECHNICAL-DEBT-REPORT.md (executive)             │
│    @pm         →  Create epics + stories from findings             │
│                → Output: Roadmap + Sprint planning                 │
│
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🤝 Agent Authority Matrix

```
EXCLUSIVE OPERATIONS (NOBODY ELSE CAN DO THESE):

@devops (Gage)
├─ git push / git push --force
├─ gh pr create / gh pr merge
├─ Release management + tagging
└─ CI/CD pipeline configuration

@pm (Morgan)
├─ *execute-epic
├─ *create-epic
├─ Spec pipeline orchestration
└─ Requirements gathering

@po (Pax)
├─ *validate-story-draft (10-point checklist)
├─ Epic context management
└─ Backlog prioritization

@sm (River)
├─ *draft / *create-story (from epic/PRD)
└─ Story template selection

SHARED OPERATIONS (With delegation):

@architect (Aria)
├─ System architecture decisions
├─ Technology selection
├─ High-level data model design
├─ Infrastructure planning
└─ Delegate to @data-engineer for: schema design, query optimization, RLS

@dev (Dex)
├─ Code implementation
├─ Unit testing
├─ Story file updates (File List, checkboxes)
└─ Delegates to @devops for: git push, PR creation

@qa (Quinn)
├─ Story validation (format, AC clarity)
├─ Code quality review
├─ Integration testing
├─ QA gate decisions (PASS/FAIL/CONCERNS)
└─ Delegates to @dev for: fixes after FAIL verdict

@analyst (Alex)
├─ Market research
├─ Competitive analysis
├─ Data analysis
└─ Research-driven recommendations

@data-engineer (Dara)
├─ Schema design (detailed DDL)
├─ Query optimization
├─ RLS policies
├─ Migration planning
└─ Delegates to @architect for: overall data strategy
```

---

## 📖 Story Lifecycle (Complete Flow)

```
START: Epic + Requirements
  │
  ├─► @sm *draft
  │   └─► Story created (DRAFT status)
  │       ├─ Title ✅
  │       ├─ Description ✅
  │       ├─ Acceptance Criteria ✅
  │       ├─ Scope (IN/OUT) ✅
  │       ├─ Dependencies ✅
  │       ├─ Complexity estimate ✅
  │       ├─ Business value ✅
  │       ├─ Risks documented ✅
  │       ├─ Criteria of Done ✅
  │       └─ Alignment with PRD ✅
  │
  ├─► @po *validate-story-draft
  │   ├─ 10-point checklist review
  │   └─ Decision: GO (≥7/10) or NO-GO (<7/10)
  │
  ├─ If NO-GO: Return to @sm for fixes
  │ If GO: Update status → READY
  │
  ├─► @dev *develop-story
  │   ├─ Update status: READY → IN_PROGRESS
  │   ├─ Implement code
  │   ├─ Write unit tests
  │   ├─ Update File List
  │   ├─ CodeRabbit review (auto-fix CRITICAL/HIGH)
  │   └─ Update status: IN_PROGRESS → IN_REVIEW
  │
  ├─► @qa *qa-gate
  │   ├─ 7-point quality check
  │   └─ Verdict:
  │       ├─ PASS → Update status: IN_REVIEW → DONE
  │       ├─ CONCERNS → Update status: IN_REVIEW → DONE (documented)
  │       ├─ WAIVED → Update status: IN_REVIEW → DONE (rare)
  │       └─ FAIL → Update status: IN_REVIEW → IN_PROGRESS
  │           └─ Return to @dev with feedback
  │               └─ Max QA Loop: 5 iterations
  │
  └─► @devops *push
      ├─ Story status MUST be DONE
      ├─ git add + commit + push
      ├─ Create PR (if workflow requires it)
      └─ Merge to main

END: Story merged, deployed
```

---

## ⚡ Quick Decision Tree (Which Workflow?)

```
Is it a complex feature (Complexity ≥ 9)?
├─ YES → Spec Pipeline (6 phases) THEN SDC
└─ NO → SDC only

Is it a bug fix (< 2 hours)?
├─ YES → SDC with YOLO mode (minimal ceremony)
└─ NO → SDC with Interactive mode (questions + checkpoints)

Is it an existing codebase assessment?
├─ YES → Brownfield Discovery (10 phases)
└─ NO → SDC or Spec Pipeline

Do we have a QA FAIL verdict?
├─ YES → QA Loop (iterative fix, max 5 rounds)
└─ NO → Continue to @devops push

---

RULE: Never invent features not in Spec/Requirements
RULE: CLI > Observability > UI (always)
RULE: @devops ONLY can push to remote
RULE: Story MUST have AC before @dev starts
RULE: No story status update without agent authority
```

---

## 🚨 Constitution Violation Detection

### Violation: Agent Authority Breach
```
IF: @dev tries to git push
THEN: BLOCKED by deny rule in .claude/settings.json
FIX: Delegate to @devops *push

IF: @sm modifies Story AC (should be @po only)
THEN: BLOCKED by file permissions (immutable field)
FIX: @po updates AC, @sm updates File List only

IF: @architect creates story directly
THEN: BLOCKED by agent-authority.md rule
FIX: @architect → @sm *draft (proper delegation)
```

### Violation: Story-Driven Code
```
IF: @dev writes code without story
THEN: BLOCKED by IDS gate (Entity Registry check)
FIX: Create story first (must have AC + acceptance criteria)

IF: Story has vague acceptance criteria
THEN: @po *validate-story-draft will return NO-GO
FIX: Rewrite AC as Given/When/Then format
```

### Violation: No Invention
```
IF: Spec includes features not in Requirements
THEN: @qa *critique will flag as Art.IV violation
FIX: Remove from spec, or add requirement

IF: Task estimates don't track to Requirements
THEN: @architect *assess-complexity will flag inconsistency
FIX: Document missing requirement
```

---

## 📋 Sprint Planning Integration

### Step 1: Load Brownfield Findings
```
Inputs: TECHNICAL-DEBT-REPORT.md + SPRINT-ROADMAP-DEBT-FIX.md
Outputs: 10 epics (S1-S3 + Q2 backlog)
```

### Step 2: Create Epics (Via @pm)
```
@pm *create-epic "EPIC-SPRINT-1-CRITICAL-FIX"
  ├─ Stories: S1.1 - S1.5
  ├─ Effort: 19 story points
  ├─ Deadline: 2026-06-24
  └─ Acceptance Criteria: (5 AC from Brownfield findings)

@pm *create-epic "EPIC-SPRINT-2-SECURITY"
  ├─ Stories: S2.1 - S2.3
  ├─ Effort: 16 story points
  ├─ Deadline: 2026-07-08
  └─ Depends on: EPIC-SPRINT-1

@pm *create-epic "EPIC-SPRINT-3-QUALITY"
  ├─ Stories: S3.1 - S3.2
  ├─ Effort: 24 story points
  ├─ Deadline: 2026-07-22
  └─ Depends on: EPIC-SPRINT-1 + EPIC-SPRINT-2
```

### Step 3: Draft Stories (Via @sm)
```
@sm *draft "EPIC-SPRINT-1-CRITICAL-FIX"
  └─ Creates: S1.1.story.md, S1.2.story.md, ... S1.5.story.md
     (With full AC, dependencies, File List)

Repeat for Sprints 2 + 3
```

### Step 4: Validate (Via @po)
```
@po *validate-story-draft "S1.1.story.md"
  ├─ Check: Clear title, complete description, testable AC
  ├─ Check: Scope defined, dependencies mapped
  ├─ Decision: GO (≥7/10) or NO-GO (<7/10)
  └─ Update status: Draft → Ready (if GO)

Repeat for all Sprint 1-3 stories
```

### Step 5: Execute Sprints (Via @dev + @qa + @devops)
```
Week 1-2: Sprint 1 execution (SDC workflow × 5 stories)
  ├─ @dev implements S1.1-S1.5
  ├─ @qa validates each story
  ├─ @devops pushes to production
  └─ Post-mortem + metrics

Week 3-4: Sprint 2 execution
Week 5-6: Sprint 3 execution
```

---

## 🎯 Constitution Compliance in Sprint Planning

| Principle | How Enforced in Sprint Flow |
|-----------|---------------------------|
| **CLI First** | All stories implement backend CLI before UI |
| **Agent Authority** | @pm ← epic creation, @sm ← story draft, @po ← validation |
| **Story-Driven** | No code without story; story must have AC |
| **No Invention** | Specs trace to Brownfield findings + Requirements |
| **Quality First** | CodeRabbit blocks CRITICAL, tests block merge |
| **Absolute Imports** | ESLint enforces @/ aliases in all code stories |

---

## 📊 KAIROS_CEREBRO Development Pipeline (Complete)

```
QUARTER 2026-Q2:
├─ Week 1 (Jun 10-16):  SPRINT-1 execution + daily standup
├─ Week 2 (Jun 17-23):  SPRINT-1 validation + production prep
├─ Week 3 (Jun 24-30):  SPRINT-2 start + SPRINT-1 monitoring
├─ Week 4 (Jul 1-7):    SPRINT-2 execution
├─ Week 5 (Jul 8-14):   SPRINT-3 start + SPRINT-2 validation
├─ Week 6 (Jul 15-21):  SPRINT-3 execution
└─ Week 7 (Jul 22-28):  Production scale-out to 100K+ users

PARALLEL:
├─ KAIROS Check: Resume EPIC-KCC stories 4.2-4.4
├─ AIOX Academy: Complete stories 1.3 + 1.4
└─ Observability: Setup monitoring + alerting
```

---

## ✅ Validation Checklist

- ✅ Constitution Art. I-VI enforced at every step
- ✅ Agent Authority gates prevent violations
- ✅ Story-Driven enforced by @po validation
- ✅ No Invention checked by @qa *critique
- ✅ Quality First blocking CodeRabbit + tests
- ✅ All 4 workflows integrated + documented
- ✅ Sprint planning tied to Brownfield findings
- ✅ Escalation paths defined for each violation

---

**STATUS: READY FOR SPRINT 1 EXECUTION**
**Compliance: GREEN ✅**

*Generated: 2026-06-03 (Brownfield + Sprint Planning Integration)*
