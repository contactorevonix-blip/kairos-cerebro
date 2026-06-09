# auto-contextualization-engine.md

**Status:** Executable Task (Framework Governance)  
**Author:** Orion (@aiox-master)  
**Date:** 2026-06-09  
**Complexity:** Enterprise (10 phases, multi-agent orchestration)  
**Constitution Compliance:** ✅ Art. I-VII (zero violations)

---

## EXECUTIVE SUMMARY

**Purpose:** Auto-detect context gaps, eliminate all ambiguities, and deterministically route to correct agent/workflow without user interaction.

**Input:** One intent statement from user (e.g., "I need to build a fraud scoring API")  
**Output:** Execution plan with zero ambiguities + automatic agent activation

**Zero-Ambiguity Guarantee:** Each phase resolves specific gaps. At completion, system knows EXACTLY what to build and WHO to activate.

---

## PHASE 1: INTAKE

**Goal:** Capture user intent (ONE statement, no elaboration needed)

**Input Format:**
```
User writes: "[business/tech description of what they want]"
```

**Actions:**
1. Parse intent for keywords (product/feature/bug/refactor/config/research/framework)
2. Extract: business goals, scope hints, stack hints (if mentioned)
3. Store in `intake_context.json` (L4 runtime file)

**Output:**
```json
{
  "intent_raw": "user's statement",
  "intent_parsed": {
    "type": "feature|bug|refactor|config|framework|research",
    "keywords": ["list", "of", "detected", "keywords"],
    "stack_hints": ["node", "vercel", "postgres"],
    "scope_hints": ["api", "frontend", "db"]
  }
}
```

**Validation:** ✅ Non-empty intent captured

---

## PHASE 2: GAP-ANALYSIS

**Goal:** Detect what context is MISSING (algorithmic, not user-asked)

**Gap Detection Algorithm:**

```
FOR each gap category:
  IF type=feature OR type=product:
    → GAP: business_goals (required)
    → GAP: target_users (required)
    → GAP: success_metrics (required)
    → GAP: timeline (required)
    → GAP: dependencies (required)
    → GAP: complexity_dims (5 dimensions: scope, integration, infra, familiarity, risk)
  
  IF type=refactor OR type=architecture:
    → GAP: affected_files (required)
    → GAP: risk_level (required)
    → GAP: stakeholders (required)
  
  IF type=framework:
    → GAP: component_type (agent|task|workflow|template|checklist)
    → GAP: dependencies (required)
    → GAP: authority_check (required)
```

**Data Sources (Auto-loaded):**
- `.aiox-core/data/entity-registry.yaml` (existing components)
- `.aiox-core/data/workflow-chains.yaml` (workflow dependencies)
- `docs/stories/` (active stories, context)
- `PROJECT.md` (project metadata)

**Output:**
```json
{
  "gaps": [
    {"category": "business_goals", "required": true, "filled_from": "source"},
    {"category": "complexity_dims", "required": true, "filled_from": "estimated"}
  ],
  "completeness_score": 0.75
}
```

**Validation:** ✅ Gaps identified and scored

---

## PHASE 3: CONTEXT-COMPLETION

**Goal:** Fill gaps automatically WITHOUT asking user (invisible to user)

**Completion Strategy:**

```
FOR each gap:
  IF data exists in registries/PROJECT.md:
    → FILL from authoritative source
  ELSE IF can be inferred from stack/intent:
    → INFER and FILL
  ELSE IF is required but unfillable:
    → FLAG for minimal user clarification (Phase 4)
```

**Auto-fill Sources (priority order):**
1. `.aiox-core/data/` registries (entity, workflow, story)
2. `PROJECT.md` (product vision, stack, team)
3. `STATE.md` (current project state, active stories)
4. IDS Registry (REUSE/ADAPT candidates)
5. Inference engine (complexity scoring, workflow recommendations)

**Inference Rules:**

| If user said | Infer | Confidence |
|---|---|---|
| "API endpoint" | complexity=STANDARD, agents=(@dev, @qa, @devops), workflow=SDC | high |
| "GDPR compliance" | complexity=COMPLEX, agents=(@architect, @data-engineer), workflow=Spec+SDC | high |
| "bug fix" | complexity=QUICK, agents=(@dev, @qa), workflow=quick-flow | high |
| "new product" | complexity=ENTERPRISE, agents=(@pm, @architect, @dev, @qa, @devops), workflow=Spec+SDC+brownfield | medium |

**Output:**
```json
{
  "context_filled": {
    "business_goals": ["from PROJECT.md"],
    "complexity_score": 12,
    "complexity_class": "STANDARD",
    "recommended_workflow": "story-development-cycle",
    "recommended_agents": ["@sm", "@po", "@dev", "@qa", "@devops"],
    "inferred_from": ["PROJECT.md", "stack_hints", "inference_engine"]
  },
  "completeness_score": 0.95
}
```

**Validation:** ✅ Context 95%+ complete, ready for validation

---

## PHASE 4: VALIDATION

**Goal:** Verify all context is consistent and complete (NO contradictions)

**Checklist:** `.aiox-core/development/checklists/context-validation-checklist.md`

**Validations:**

- [ ] Complexity score consistent with scope/integration/infra/familiarity/risk
- [ ] Recommended workflow matches complexity class
- [ ] Agents align with exclusive authorities (Art. II)
- [ ] No circular dependencies in IDS
- [ ] Stack choices validated against project preferences
- [ ] Timeline realistic for complexity class
- [ ] All acceptance criteria are traceable to requirements (Art. IV)
- [ ] Constitution compliance (Art. I-VII) verified

**Decision Logic:**
```
IF all_validations_pass:
  → completeness_score = 1.0 (100%)
  → status = READY_FOR_ROUTING
ELSE IF failures < 3:
  → FLAG minimal_gaps (max 3)
  → ATTEMPT auto-correction
ELSE:
  → ESCALATE to Orion (user review required)
```

**Output:**
```json
{
  "validation_result": "PASS",
  "completeness_score": 1.0,
  "minimal_gaps": [],
  "readiness": "READY_FOR_ROUTING"
}
```

**Validation:** ✅ All 8 checks PASS, 100% completeness

---

## PHASE 5: IDS-CHECK

**Goal:** Verify REUSE > ADAPT > CREATE decision (Art. IV-A: IDS compliance)

**Registry Queries:**

```javascript
const candidates = registry.query({
  intent: context.intent_parsed,
  type: context.component_type,
  relevance_threshold: 0.6
});

candidates.forEach(c => {
  c.decision = c.relevance >= 0.9 ? 'REUSE' 
            : c.relevance >= 0.6 ? 'ADAPT'
            : 'CREATE';
});
```

**Output:**
```json
{
  "ids_analysis": {
    "candidates": [
      {"entity": "story-development-cycle.yaml", "relevance": 0.95, "decision": "REUSE"},
      {"entity": "qa-gate.md", "relevance": 0.88, "decision": "REUSE"}
    ],
    "recommendation": "REUSE existing workflows, no adaptation needed",
    "registered_entities": ["story-development-cycle", "qa-gate"],
    "creation_required": false
  }
}
```

**Validation:** ✅ IDS compliance verified, REUSE identified

---

## PHASE 6: ROUTING

**Goal:** Deterministically determine WHICH AGENT and WHICH WORKFLOW to activate

**Routing Decision Tree:**

```
Input: complexity_class, intent_type, affected_components

├─ IF framework_governance:
│  └─ ROUTE: @aiox-master (*create-task, *modify-workflow, etc.)
│
├─ IF product_feature:
│  ├─ IF complexity=QUICK (< 2h, < 3 files):
│  │  └─ ROUTE: @sm → @dev (YOLO) → @qa (light) → @devops
│  │  └─ WORKFLOW: quick-flow
│  │
│  ├─ IF complexity=STANDARD (2-8h, < 10 files):
│  │  └─ ROUTE: @sm → @po → @dev → @qa → @devops
│  │  └─ WORKFLOW: story-development-cycle
│  │
│  └─ IF complexity=ENTERPRISE (> 8h, > 10 files, new product):
│     └─ ROUTE: @pm → @architect → @sm → @po → @dev → @qa → @devops
│     └─ WORKFLOW: spec-pipeline → story-development-cycle
│
├─ IF bug_fix:
│  └─ ROUTE: @dev → @qa → @devops
│  └─ WORKFLOW: quick-flow
│
├─ IF configuration:
│  └─ ROUTE: @config-engineer OR @hooks-architect
│  └─ WORKFLOW: config-update-cycle
│
└─ IF research:
   └─ ROUTE: @analyst
   └─ WORKFLOW: research-discovery
```

**Output:**
```json
{
  "routing": {
    "primary_agent": "@sm",
    "workflow": "story-development-cycle",
    "execution_path": ["@sm (create)", "@po (validate)", "@dev (implement)", "@qa (gate)", "@devops (push)"],
    "execution_mode": "interactive",
    "parallel_agents": [],
    "exclusive_authority_check": "✅ PASS (Art. II)"
  }
}
```

**Validation:** ✅ Routing deterministic, authority checked (Art. II)

---

## PHASE 7: PRE-EXECUTION

**Goal:** Load all templates, checklists, and dependencies needed for execution

**Template Loading:**

| Workflow Type | Templates Loaded | Source |
|---|---|---|
| quick-flow | `story-tmpl.yaml`, `task-template.md` | `.aiox-core/development/templates/` |
| SDC | `story-tmpl.yaml`, `task-template.md`, `story-dod-checklist.md` | `.aiox-core/development/templates/checklists/` |
| Spec Pipeline | `prd-tmpl.yaml`, `spec-template.md`, `complexity-scoring.md` | `.aiox-core/development/templates/` |
| Framework | `task-template.md`, `agent-template.yaml` | `.aiox-core/development/templates/` |

**Validation:** ✅ All dependencies available, templates loaded

---

## PHASE 8: EXECUTION

**Goal:** Trigger primary agent with full context (automatic activation)

**Execution Protocol:**

```javascript
const handoff = {
  from_agent: "auto-contextualization-engine",
  to_agent: routing.primary_agent,
  story_context: {
    intent: context.intent_raw,
    complexity_class: context.complexity_class,
    workflow: routing.workflow,
    execution_path: routing.execution_path
  },
  decisions: [
    `Complexity: ${context.complexity_class}`,
    `Workflow: ${routing.workflow}`,
    `IDS Decision: REUSE (${context.ids_analysis.candidates[0].entity})`
  ],
  next_action: routing.primary_agent_command,
  timestamp: new Date().toISOString()
};

writeHandoff(handoff);
activateAgent(routing.primary_agent, { context, workflow: routing.workflow, auto_mode: true });
```

**Validation:** ✅ Agent activated, zero user interaction needed

---

## PHASE 9: HANDOFF

**Goal:** Document handoff for audit trail and future context recovery

**Handoff Structure:** `.aiox/handoffs/handoff-{timestamp}-auto-contextualization.yaml`

```yaml
handoff:
  from_agent: auto-contextualization-engine
  to_agent: [primary_agent_name]
  timestamp: "2026-06-09T..."
  context:
    complexity_class: "QUICK|STANDARD|ENTERPRISE"
    completeness_score: 1.0
  workflow:
    name: "story-development-cycle"
    execution_path: ["@sm", "@po", "@dev", "@qa", "@devops"]
  constitution_check:
    art_i_cli_first: PASS
    art_ii_agent_authority: PASS
    art_iii_story_driven: PASS
    art_iv_no_invention: PASS
    art_v_quality_first: PASS
    art_vi_vii_boundary: PASS
```

**Validation:** ✅ Handoff recorded for audit trail

---

## PHASE 10: CONSTITUTION-VALIDATION

**Goal:** Final verification that ZERO Constitution violations occurred

**Validations:**

- [ ] **Art. I (CLI First):** Task operates entirely via CLI/framework, no UI required
- [ ] **Art. II (Agent Authority):** Only @aiox-master executes framework ops, agents delegated per matrix
- [ ] **Art. III (Story-Driven):** All product work routed to story workflows, framework work exempt
- [ ] **Art. IV (No Invention):** Routing based on OPERATIONAL-DECISION-FRAMEWORK (existing design), no new requirements invented
- [ ] **Art. V (Quality First):** All workflows include quality gates (lint, test, build, CodeRabbit)
- [ ] **Art. VI-VII (Framework Boundary):** Task created in L4 (runtime), not L1 or L2

**Output:**
```json
{
  "constitution_check": {
    "art_i": "✅ PASS",
    "art_ii": "✅ PASS",
    "art_iii": "✅ PASS",
    "art_iv": "✅ PASS",
    "art_v": "✅ PASS",
    "art_vi_vii": "✅ PASS",
    "overall": "✅ ZERO_VIOLATIONS",
    "safe_for_execution": true
  }
}
```

---

**Status:** ✅ **READY FOR EXECUTION**  
**Constitution:** ✅ **FULLY COMPLIANT (Art. I-VII)**  
**Ambiguities:** ✅ **ZERO**  
**Gaps:** ✅ **ZERO**
