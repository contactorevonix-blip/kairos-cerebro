# AIOX Onboarding — Detailed Phase Content

## Phase 1: Foundation (10 minutes)

### What is AIOX?

Synkra AIOX is an **AI-Orchestrated System for Full Stack Development**. It's a meta-framework that:

- Orchestrates **13 specialized agents** through formal authority boundaries
- Enforces **6 Constitution articles** (non-negotiable principles)
- Uses **story-driven development** as the primary workflow
- Protects framework integrity through **L1-L4 layer boundaries**
- Implements **quality gates** at every step

**Key Insight:** AIOX is rigid foundation + creative freedom. The framework is strict (Constitution, boundaries), but what you build on top is completely free.

### The 13 Agents

| Agent | Persona | Role | Exclusive Ops |
|-------|---------|------|----------------|
| @dev | Dex | Implementation | git add, git commit |
| @qa | Quinn | Testing | *qa-loop |
| @architect | Aria | Architecture | Design decisions |
| @pm | Morgan | Epic Mgmt | *execute-epic |
| @po | Pax | Validation | *validate-story |
| @sm | River | Story Creation | *create-story |
| @analyst | Alex | Research | *research |
| @data-engineer | Dara | Database | Schema design |
| @ux-design-expert | Uma | UX/Design | Design decisions |
| @devops | Gage | CI/CD + Push | **git push** (EXCLUSIVE) |
| @aiox-master | Orion | Governance | Constitution enforcement |
| @squad-creator | Craft | Squad Design | Squad design |
| @business-chief | Chief | Strategy | Epic decisions |

### Core Concepts Intro

**Constitution:** 6 inviolable principles (CLI First, Agent Authority, Story-Driven, No Invention, Quality First, Absolute Imports)

**Story-Driven Development:** All code flows from stories with acceptance criteria. Stories are the contract.

**Authority:** Each agent has exclusive operations. Boundaries are enforced. No agent exceeds scope.

**Framework Boundaries:** 4 layers (L1 immutable core, L2 template-only, L3 conditional config, L4 runtime freedom)

---

## Phase 2: Mental Maps (15 minutes)

### 8 Core DNA Patterns

1. **Agent Specialization**
   - Each agent does one thing excellently
   - Exclusive operations per agent
   - No overlap, strict boundaries
   - Example: @devops only does git push

2. **Story-Driven Development**
   - Every feature flows from a story
   - Stories have acceptance criteria (ACs)
   - Progress tracked via checkboxes
   - Stories are source of truth

3. **Quality Gates Non-Negotiable**
   - 7 mandatory checks before merge
   - Gates block code that fails
   - Self-healing max 2-3 iterations
   - Escalation forced after max attempts

4. **Authority Hierarchy**
   - Exclusive ops > Delegated ops > Permitted ops
   - Agents cannot exceed boundary
   - Violation detection enforced
   - Escalation to @aiox-master if boundary crossed

5. **Framework Layer Immutability**
   - L1 Core: NEVER modify (deny rules protect it)
   - L2 Templates: NEVER modify (extend-only)
   - L3 Config: Conditional mutations (allow rules permit)
   - L4 Runtime: ALWAYS mutable (user freedom)

6. **No Invention Principle**
   - Specs derived ONLY from requirements
   - Zero invented features
   - Every statement traces to FR-*/NFR-* or research
   - Constitution Article IV: non-negotiable

7. **IDS Principle (REUSE > ADAPT > CREATE)**
   - Before creating: check existing artefacts
   - Reuse first → Adapt second → Only create if genuinely new
   - Prevents duplicate tools, patterns, components

8. **Task-First Execution**
   - Workflows are task chains, not agent chains
   - Tasks define inputs/outputs/prerequisites
   - Validated task is law
   - Tasks are executable, reusable, composable

### Constitution Articles Explained

| Article | Principle | Why It Matters |
|---------|-----------|----------------|
| I | CLI First | Truth must work via CLI before UI adds observation |
| II | Agent Authority | Clear boundaries prevent chaos and overlap |
| III | Story-Driven | Specs ensure consistency, traceability |
| IV | No Invention | Features only from requirements, never assumptions |
| V | Quality First | Gates catch issues before they reach prod |
| VI | Absolute Imports | Context management prevents broken refs |

### Thinking Pattern for Decisions

**When unsure, ask:**

1. **Constitution Compliant?** (Does it violate any of 6 articles?)
2. **Agent Authority Clear?** (Who has exclusive right to this?)
3. **Story-Driven?** (Does this flow from a story with ACs?)
4. **IDS Applied?** (Did I check REUSE > ADAPT > CREATE?)
5. **Layer Respecting?** (Does this cross framework boundaries?)

---

## Phase 3: Processing Maps (20 minutes)

### Story Development Cycle (SDC) — 5 Phases

**Phase 1: CREATE (@sm)**
- Input: PRD + epic context
- Task: `create-next-story`
- Output: story.md (Draft)
- Gate: None (creation is open)
- Time: 30 min - 2 hours

**Phase 2: VALIDATE (@po)**
- Input: story.md
- Task: `validate-next-story`
- Output: Go/NoGo + 10-point checklist
- Gate: ✅ MUST pass validation
- Time: 15-30 min

**Phase 3: IMPLEMENT (@dev)**
- Input: Validated story + ACs
- Task: `dev-develop-story`
- Output: Code + File List
- Gate: Self-critique mandatory
- Time: Depends on complexity

**Phase 4: QA GATE (@qa)**
- Input: Code
- Task: `qa-gate`
- Output: PASS / CONCERNS / FAIL
- Checks: 7 mandatory quality checks
- Gate: ✅ MUST pass or fix

**Phase 5: PUSH (@devops)**
- Input: Approved code
- Task: `git push` + merge
- Output: Commit on main
- Authority: @devops EXCLUSIVE
- Gate: ✅ MUST only be @devops

### Workflow Decision Tree

```
Do you need to start a new feature?
├─ YES → Story Development Cycle (SDC)
│   ├─ CREATE (via @sm)
│   ├─ VALIDATE (via @po)
│   ├─ IMPLEMENT (via @dev)
│   ├─ QA GATE (via @qa)
│   └─ PUSH (via @devops)
│
├─ Is this a complex feature with many stories?
│   └─ YES → Start with Spec Pipeline FIRST
│       ├─ Gather requirements
│       ├─ Assess complexity
│       ├─ Research solutions
│       ├─ Write specification
│       ├─ Critique spec
│       └─ Plan implementation → then SDC
│
└─ Is this a small bug fix or config change?
    └─ YES → Quick Flow (skip @sm/@po, @dev direct) → still gate everything
```

### Quality Gates Explained

**7 Mandatory Checks:**

1. ✓ `npm run lint` (no errors)
2. ✓ `npm run typecheck` (no errors)
3. ✓ `npm test` (no failures)
4. ✓ `npm run build` (success)
5. ✓ CodeRabbit review (no CRITICAL issues)
6. ✓ No secrets in code
7. ✓ Story status = Done or Ready for Review

**All 7 MUST pass before merge.** If any fails:
- @qa sends back to @dev with feedback
- @dev fixes + resubmits
- @qa re-reviews (max 5 iterations)
- If still failing after 5: escalate to @aiox-master

---

## Phase 4: Mastery (25 minutes)

### Real-World Scenario 1: Story Creation Flow

**Question:** You're assigned to implement a new feature: "Add email notifications." What's your workflow?

**Answer:**
1. @sm reads the epic context + requirements
2. @sm creates a story with:
   - Title: "Implement email notification service"
   - Acceptance Criteria: 3-4 clear, testable criteria
   - File List: Expected files to create/modify
3. @po validates the story (10-point checklist)
4. You (@dev) get the validated story
5. You create a branch: `feature/email-notifications`
6. You implement according to ACs
7. You self-critique using the checklist
8. You commit and request @qa review
9. @qa runs 7-gate checks
10. If pass: @devops merges to main
11. If fail: back to step 6

**Key Learning:** Story DRIVES implementation. You're not inventing; you're executing.

### Real-World Scenario 2: Authority Question

**Question:** You want to push your code to main. What do you do?

**Answer:** You DON'T. Only @devops can `git push`. Here's what you do:

1. You create a commit locally
2. You create a PR (or ask @devops to)
3. @qa reviews and approves
4. @devops merges to main

**Key Learning:** Authority boundaries are strict. You can't exceed your scope, even if you wanted to.

### Real-World Scenario 3: Workflow Selection

**Question:** You have 23 stories to implement. Which workflow?

**Answer:** Enterprise Flow:
1. @pm creates EPIC with 23 stories
2. @pm executes EPIC breakdown
3. Spec Pipeline (full 6 phases)
4. Then SDC for each of 23 stories in sequence
5. Coordination across team

**Key Learning:** Different scopes = different workflows. Don't use Quick Flow for epics.

### Real-World Scenario 4: Boundary Violation

**Question:** You notice @qa is writing code. Is this allowed?

**Answer:** No. @qa's scope is testing, not implementation. Here's what to do:

1. Politely point out the boundary
2. Suggest @dev should implement
3. If they push back: escalate to @aiox-master
4. @aiox-master enforces Constitution

**Key Learning:** Everyone respects boundaries. If violated, escalation is clear.

### Self-Assessment

**Can you answer these?**

- Name all 13 agents and their exclusive operations ✓
- Explain the 5 phases of SDC ✓
- List 7 quality gate checks ✓
- Explain 4 of 8 DNA patterns ✓
- Resolve a real-world scenario ✓
- Decide which workflow to use ✓

**If YES to 5+:** You're ready for AIOX production use.

---

## Next Steps After Mastery

1. **Deep Dive:** Read `.aiox-core/constitution.md` (full Constitution)
2. **Rules Reference:** Read `.claude/rules/agent-authority.md` (detailed authority matrix)
3. **Real Practice:** Create your first story using `/aiox-onboarding all --scenario`
4. **Ask Questions:** Use the skill to clarify edge cases as you encounter them
5. **Teach Others:** Explain AIOX to a teammate (best way to internalize)

---

*Crafted by Anvil — AIOX Master Educator*
