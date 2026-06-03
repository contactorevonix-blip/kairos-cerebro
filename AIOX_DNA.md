# AIOX DNA — Core Patterns &amp; Framework Mental Model

**Framework:** Synkra AIOX v2.1 | **Project:** KAIROS_CEREBRO | **Date:** 2026-06-03

This document extracts the core DNA (patterns, principles, and mental models) of Synkra AIOX without the operational details.

---

## 🧬 Core DNA Patterns

### 1. **Agent Specialization DNA**
The framework is built on **hyper-specialization with clear authority boundaries**.

**Pattern:**
```
Each agent owns a specific operational domain
└─ Exclusive operations = non-negotiable authority
└─ Delegations = hierarchical responsibility
└─ No cross-boundary violations allowed
```

**Mental Model:**
- Think of agents as **specialized professionals** (surgeon, engineer, architect, accountant)
- Each has a **legal authority** over their domain
- **Delegation is explicit, never assumed**
- **Authority violations are blocked** by gates, not by manual review

**Example:**
```
@devops (Gage) is the only authority for:
  - git push (repository integrity)
  - MCP management (system infrastructure)
  - CI/CD orchestration (deployment)

Even @dev cannot push; must delegate to @devops.
```

---

### 2. **Story-Driven Workflow DNA**
Every development task is **structured as a story** with **explicit lifecycle gates**.

**Pattern:**
```
Story = {
  requirement (AC),
  implementation (phases),
  quality (gates),
  lifecycle (status transitions)
}

Status flow: Draft -> Ready -> InProgress -> InReview -> Done
Each transition owned by specific agent with gating rules
```

**Mental Model:**
- Story is the **unit of work** (not PR, not task, not feature request)
- Status is the **source of truth** for workflow position
- **Transitions are explicit actions**, not implicit assumptions
- **Each phase is a gate** with specific quality criteria

**Example:**
```
@po validates story (Draft -> Ready)
  Requirement: >= 7/10 checklist

@dev implements story (Ready -> InProgress -> InReview)
  Requirement: CodeRabbit CRITICAL/HIGH resolved

@qa gates story (InReview -> Done or InProgress)
  Requirement: 7 quality checks passed

@devops pushes story (Dead prerequisite: Done status)
```

---

### 3. **Quality Gate DNA**
Quality is **non-negotiable** with **automatic self-healing** and **forced escalation**.

**Pattern:**
```
Quality gate = {
  automated checks (CodeRabbit, tests),
  severity levels (CRITICAL, HIGH, MEDIUM, LOW),
  self-healing (max 2-3 iterations),
  escalation (if self-healing fails)
}

Blocking condition: CRITICAL or HIGH unresolved
No override without explicit reason + documentation
```

**Mental Model:**
- **Quality is a gate, not advisory**
- **Automation before manual review** (CodeRabbit first)
- **Self-healing tries to fix** (up to limit)
- **Escalation is forced** (no silent failures)

**Example:**
```
Dev phase CodeRabbit:
  Iteration 0: Find CRITICAL → auto-fix
  Iteration 1: Re-check → if CRITICAL persist → HALT
  Result: Either CRITICAL resolved or manual intervention required

QA phase CodeRabbit:
  Same logic but max 3 iterations
  Then manual @qa analysis on top
```

---

### 4. **Authority Hierarchy DNA**
Authority is **nested and delegated**, with **clear escalation paths**.

**Pattern:**
```
@aiox-master (Framework governance)
  ├─ @pm (Epic/strategy decisions)
  │  └─ @sm (Story creation from epic)
  │     └─ @po (Story validation)
  │        └─ @dev (Implementation)
  │           ├─ @architect (Tech decisions)
  │           │  └─ @data-engineer (Schema/RLS)
  │           └─ @ux-designer (UI/UX)
  │
  ├─ @qa (Quality gates)
  │  └─ @dev (Fix loop if FAIL)
  │
  ├─ @devops (Git/release/infrastructure)
  │  └─ @dev (via explicit delegation)
  │
  └─ @analyst (Research, feeds @pm)
```

**Mental Model:**
- **Authority flows down** (framework → epic → story → implementation)
- **Each level has **veto authority** on level below
- **Escalation is defined** (if @dev cannot proceed → @aiox-master)
- **No peer authority** (agents don't negotiate horizontally)

**Example:**
```
@po says story AC is unclear → NO-GO
  @sm cannot force story into Ready
  @dev must wait for fixes
  @qa will refuse to gate unclear stories

@qa says CRITICAL security issue → FAIL
  @dev must fix (no override)
  @pm cannot say "ship anyway"
```

---

### 5. **Workflow Composition DNA**
Complex workflows are **composed of tasks** with **clear dependencies**.

**Pattern:**
```
Workflow = sequence of tasks
Task = {
  executor (agent),
  inputs (files, context),
  outputs (files, status changes),
  gates (pre-conditions, post-conditions),
  escalation (if fails)
}

Workflows are NOT agent chains, they're task chains.
Agent is just the executor of the task.
```

**Mental Model:**
- **Task is the primitive** (not agent)
- **Each task has explicit inputs/outputs**
- **Pre-conditions are verified** before execution
- **Post-conditions trigger next task** (or escalation)

**Example:**
```
SDC Workflow:
  Task 1: create-next-story.md (executor: @sm)
    Input: epic.md
    Output: story.md (status: Draft)
    Post: Ready for validation

  Task 2: validate-next-story.md (executor: @po)
    Input: story.md (Draft)
    Gate: 10-point checklist >= 7
    Output: story.md (status: Ready) OR NO-GO
    Post: Ready for implementation

  Task 3: dev-develop-story.md (executor: @dev)
    Input: story.md (Ready)
    Gate: CodeRabbit max 2 iter
    Output: code + story.md (status: InReview)
    Post: Ready for QA

  ...and so on
```

---

### 6. **Constitution DNA**
Framework principles are **enforced as code**, not guidelines.

**Pattern:**
```
Constitution = {
  articles (6 principles),
  severity (NON-NEGOTIABLE vs MUST vs SHOULD),
  gates (automatic enforcement),
  violations (blocked with error)
}
```

**Mental Model:**
- **Constitution is the law** (not suggestions)
- **Gates are automatic** (not manual review)
- **Violations are blocked** (before they happen)
- **Exceptions require explicit override** with reason

**Example:**
```
Article I (CLI First): Violation = all workflows must start in CLI
  Gate: Automatic (framework blocks non-CLI entry)

Article II (Agent Authority): Violation = @dev tries git push
  Gate: Automatic (permission denied + error message)

Article IV (No Invention): Violation = spec has invented features
  Gate: G5 (QA) + G6 (CI/CD) block merge
```

---

### 7. **Framework Boundary DNA**
Framework and project are **strictly separated** with **layer-based protection**.

**Pattern:**
```
L1 Core (NEVER modify)        Deny rules block all modifications
  ├─ Constitution
  ├─ Agent definitions
  └─ Core orchestration

L2 Templates (NEVER modify)   Deny rules block modifications
  ├─ Task definitions
  ├─ Workflow templates
  └─ Infrastructure templates

L3 Config (Mutable)           Allow rules conditionally permit
  ├─ core-config.yaml
  ├─ Agent MEMORY.md
  └─ Data definitions

L4 Runtime (ALWAYS modify)    No protection
  ├─ docs/stories/
  ├─ packages/
  ├─ squads/
  └─ All project code
```

**Mental Model:**
- **Framework is immutable** (L1-L2)
- **Config is conditional** (L3)
- **Project is free** (L4)
- **Boundary is enforced** by deny/allow rules

---

### 8. **Incremental Development DNA (IDS)**
Development avoids reinvention through **systematic reuse**.

**Pattern:**
```
REUSE (>= 90% match)
  └─ Use directly, no modification

ADAPT (60-89% match)
  └─ Modify if adaptability >= 0.6
  └─ Change < 30%, don't break consumers

CREATE (no match)
  └─ Full justification required
  └─ Registry entry within 24h
```

**Mental Model:**
- **Reuse is the default** (not create)
- **Adaptation is controlled** (with limits)
- **Creation is justified** (with traceability)
- **Registry is the source of truth** (for reuse candidates)

**Example:**
```
Need a validation task?
  1. Check registry for similar tasks (G2 gate)
  2. >= 90% match? Use it (REUSE)
  3. 60-89% match? Adapt it (ADAPT)
     - Changes < 30%? OK
     - Breaks consumers? Stop, must redesign
  4. No match? Create it (CREATE)
     - Why existing patterns don't fit?
     - What unique capability?
     - Register within 24h
```

---

## 🎯 Mental Models Summary

| Mental Model | Core Idea | Implication |
|---|---|---|
| **Agent as Professional** | Each agent is a specialist with exclusive authority | Hyper-specialization, no cross-boundary work |
| **Story as Unit of Work** | Story is the atomic unit with explicit lifecycle | Status-driven workflows, no implicit assumptions |
| **Quality as Gate** | Quality is non-negotiable and automatic | Self-healing first, escalation forced |
| **Authority as Nested** | Authority flows down with veto power at each level | Hierarchical, not peer-based, clear escalation |
| **Task as Primitive** | Tasks are executable workflows, agents just execute | Task dependencies matter more than agent chains |
| **Constitution as Law** | Framework principles are enforced as code | Violations blocked automatically, no override |
| **Boundary as Layer** | Framework/project separation is layer-based | L1-L2 immutable, L3 conditional, L4 free |
| **Reuse as Default** | Always prefer existing artifact over creating new | Registry query, adaptation rules, justified creation |

---

## 🔄 Workflow DNA Patterns

### SDC Pattern (Story Development Cycle)
```
Create → Validate → Implement → QA Gate → Push

Create:   @sm transforms PRD/epic into story
Validate: @po checks 10-point checklist (GO/NO-GO)
Impl:     @dev codes with CodeRabbit self-healing (max 2)
QA Gate:  @qa runs 7 checks (PASS/CONCERNS/FAIL/WAIVED)
Push:     @devops pushes only if QA ✓

Key DNA: Each phase is a gate, each gate has owner, no skipping
```

### QA Loop Pattern (Iterative Review-Fix)
```
@qa review → verdict → @dev fixes → re-review (max 5)

Each iteration:
  - @qa finds issues
  - @dev fixes
  - @qa re-reviews
  - If max reached OR verdict blocked → escalate
  - If verdict PASS/CONCERNS → proceed

Key DNA: Self-healing loop with forced escalation, max 5 tries
```

### Spec Pipeline Pattern (Requirements → Spec)
```
Gather → Assess → Research → Write → Critique → Plan

Complexity class determines which phases:
  SIMPLE (<=8): Gather, Write, Critique
  STANDARD (9-15): All 6 phases
  COMPLEX (>=16): All 6 + revision cycle

Gate (Article IV): Every spec statement traces to FR-*/NFR-*/CON-*

Key DNA: Complexity-driven branching, constitutional constraint, no invention
```

---

## 🚫 Anti-Patterns (What NOT to Do)

### Anti-Pattern 1: Cross-Boundary Authority
```
❌ @dev tries to git push (NOT their authority)
❌ @pm tries to write code (NOT their authority)
❌ @qa tries to decide epic scope (NOT their authority)

✅ Delegate to authorized agent
```

### Anti-Pattern 2: Skipping Gates
```
❌ Code ready before @po validates story
❌ Pushing code before @qa gate
❌ Changing story AC after @dev starts

✅ Respect gate sequence: Create → Validate → Implement → QA
```

### Anti-Pattern 3: Implicit Assumptions
```
❌ Assuming story is Ready without @po verdict
❌ Assuming QA passed without written verdict
❌ Assuming @dev can push when they code

✅ Explicit status transitions, explicit gates, explicit authority
```

### Anti-Pattern 4: Inventing Features
```
❌ Adding feature that's not in story AC
❌ Implementing design that's not in spec
❌ Creating pattern that's not traced to requirement

✅ Everything traces to FR-*, NFR-*, CON-* or research
```

### Anti-Pattern 5: Bypassing Quality
```
❌ "Just ship it, we'll fix later"
❌ Merging despite CRITICAL CodeRabbit issues
❌ Waiving QA gate without documented reason

✅ Quality gates are non-negotiable, escalate if stuck
```

---

## 🎓 Teaching the DNA

### For Beginners: Story-Driven Workflow
> "Think of a story like a package being shipped. Each phase (Create, Validate, Implement, QA, Push) is a checkpoint. No checkpoint can be skipped, and each checkpoint is owned by a specialist."

### For Developers: Task Execution
> "Tasks are executable workflows. Follow the task instructions exactly. If a task says 'CodeRabbit max 2 iterations', stop after 2 and escalate. Don't improvise."

### For Managers: Authority Hierarchy
> "Authority flows down: Framework → Epic → Story → Implementation. Each level can say 'no' to the level below. There's no peer negotiation."

### For Architects: System Design
> "The framework enforces separation of concerns through agents. Each agent is a subsystem with clear inputs/outputs and no cross-boundary coupling."

---

## 📐 Architectural Principles

### 1. **Separation of Concerns**
- Each agent owns a specific operational domain
- No agent does work outside their authority
- Dependencies are explicit, not implicit

### 2. **Explicit Over Implicit**
- Status transitions are explicit (not assumed)
- Authority is explicit (not negotiated)
- Gates are explicit (not advisory)

### 3. **Fail-Safe Over Permissive**
- Gates block violations
- Escalation is forced (not optional)
- Exceptions require explicit override with reason

### 4. **Composition Over Inheritance**
- Workflows are composed of tasks
- Tasks are composed of checkpoints
- No agent hierarchy is implicit

### 5. **Audit Over Trust**
- Every status change is logged
- Every gate decision is recorded
- Constitution violations are blocked (not ignored)

---

## 🔮 DNA in Action

**Example: A developer (@dev) tries to git push**

```
@dev executes: git push origin main

System checks:
  1. Article II (Agent Authority) → @dev pushing?
     ❌ NO, @devops is the only authorized agent
  
  2. Gate trigger: Permission denied
     Error: "Agent authority violation: @dev cannot execute 'git push'"
     Resolution: "Delegate to @devops *push"

@devops executes: @devops *push {storyId}

System checks:
  1. Story status is Done? (QA gate required)
     ✓ YES (prerequisite check)
  
  2. CodeRabbit CRITICAL/HIGH resolved?
     ✓ YES (from earlier @dev phase)
  
  3. Article II (Agent Authority) → @devops pushing?
     ✓ YES, authorized
  
  4. Execute: git push + gh pr create
     ✓ Success
```

---

## 💡 Key Insights

1. **AIOX is opinion-driven, not flexible.** It enforces specific patterns because it's designed for safety, auditability, and predictability.

2. **Gates are more important than agents.** Agents are just executors; gates are the control mechanisms.

3. **Status is the source of truth.** What matters isn't what the PR title says, it's what the story status field says.

4. **Escalation is a feature, not a failure.** When a loop hits max iterations, that's the system working correctly (forcing visibility).

5. **Framework/project boundaries matter.** You can't modify L1-L2, so know what you're allowed to change and where.

6. **Constitution is code, not culture.** You can't "negotiate" Article IV (No Invention); the gates block it automatically.

---

*Framework DNA extracted from: Synkra AIOX Constitution &amp; Agent Authority Rules*  
*Patterns validated against: 12 agents, 150+ tasks, 4 primary workflows, 6 constitution articles*  
*Generated:** 2026-06-03 | **For:** Understanding the core mental models of AIOX
