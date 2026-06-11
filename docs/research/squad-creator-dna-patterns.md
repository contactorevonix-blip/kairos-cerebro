# Squad Creator DNA Patterns — EPIC-8 Phase 3 Research

**Status:** DRAFT v0.1  
**Date:** 2026-06-11  
**Agent:** @analyst (Atlas)  
**Validation:** @architect (pending)

---

## Executive Summary

AIOX agents are manually defined in YAML/markdown with:
- **Persona** (archetype, zodiac, voice)
- **Commands** (30-50 per agent)
- **Dependencies** (tasks, templates, scripts)
- **Authorizations** (exclusive operations per Article II)

**Gap:** No systematic way to extract and clone agent DNA. Phase 3 creates **Squad Creator PRO** — a system to:
1. Extract Voice DNA (communication patterns, vocabulary, tone)
2. Clone Thinking DNA (decision frameworks, workflow logic)
3. Generate Squad Templates from patterns
4. Validate cloned agents against original authority

**Goal:** Enable rapid squad creation via `*create-squad {mentor-agent}` (10min vs 2h manual)

---

## Current Agent Structure (OBSERVED)

### Example: @developer (Dex)

**Source:** `.aiox-core/development/agents/dev.md`

```yaml
agent:
  name: Dex
  id: dev
  persona:
    role: Implementation Expert & Problem Solver
    style: Methodical, pragmatic, detail-oriented
    archetype: The Craftsman
    zodiac: ♈ Aries
  
  communication:
    tone: direct
    vocabulary: [implement, build, solve, debug, verify]
    emoji_frequency: minimal
    greeting: "🔨 Dex ready to build!"
  
  commands:
    - name: develop-story
      visibility: [key, full]
      description: Implement story with Story Development Cycle
    - name: self-critique
      visibility: [full]
      description: Self-review implementation before @qa gate
    - name: yolo
      visibility: [full]
      description: Toggle autonomous mode
```

**Authority (from agent-authority.md):**
```
@dev can:
  - git add, git commit, git status
  - git branch, git checkout, git merge (local)
  - Story file updates (File List, checkboxes)

@dev CANNOT:
  - git push (exclusive to @devops)
  - Story scope/AC changes (exclusive to @sm, @po)
  - MCP management (exclusive to @devops)
```

---

## DNA Components (Extractable)

### 1. Voice DNA (Communication Pattern)

**Data Points:**
```yaml
voice:
  tone: [direct, analytical, creative, facilitating, objective]
  emoji_frequency: [minimal, moderate, frequent]
  vocabulary: [list of 10-20 key words]
  greeting_archetypal: "string"
  signature: "string"
  archetype: "The Craftsman|The Decoder|The Strategist|..."
  zodiac: "♈|♏|♓|..."
```

**Example (@dev — Dex):**
```
tone: direct, pragmatic
vocabulary: implement, build, solve, debug, verify, refactor
archetype: Craftsman (detail-oriented, maker)
signature: "— Dex, building with precision 🔨"
```

**Example (@analyst — Atlas):**
```
tone: analytical, inquisitive
vocabulary: explore, analyse, investigate, discover, decipher, examine
archetype: Decoder (information-seeker)
signature: "— Atlas, investigando a verdade 🔎"
```

**Cloning Pattern:** Extract vocabulary + tone → Generate similar persona for new agent

### 2. Thinking DNA (Decision Framework)

**Data Points:**
```yaml
thinking:
  core_principles: [principle-1, principle-2, ...]
  workflow_phases: [phase-1, phase-2, ...]
  decision_hierarchy: "rule-1 > rule-2 > rule-3"
  error_handling: [strategy-1, strategy-2]
  escalation_conditions: [condition-1, condition-2]
```

**Example (@sm — River, Scrum Master):**
```
core_principles:
  - Story quality first
  - Clear acceptance criteria
  - Epic context alignment
  - Zero invented scope

workflow_phases:
  1. Receive epic + requirements
  2. Draft story from template
  3. Extract AC from requirements
  4. Validate against 10-point checklist
  5. Submit to @po

decision_hierarchy:
  - Story must have AC > No draft creation
  - Epic context must be clear > Escalate to @pm
  - 5-person squad > Use @squad-chief > Escalate
```

**Example (@architect — Aria):**
```
core_principles:
  - Architecture-first thinking
  - Constitution compliance checking
  - Zero invented technologies
  - Dependency validation

workflow_phases:
  1. Gather requirements
  2. Assess complexity
  3. Design system boundaries
  4. Map dependencies
  5. Validate gates
  6. Sign off

escalation_conditions:
  - Technology unknown > Research first
  - >15 stories > Require PRD
  - Constitutional violation > Block
```

**Cloning Pattern:** Extract workflow phases + principles → Apply to new agent domain

### 3. Authority DNA (Exclusive Operations)

**Data Points:**
```yaml
authority:
  exclusive_operations: [op-1, op-2]
  delegated_to: [agent-1, agent-2]
  delegation_rules: [rule-1, rule-2]
  veto_conditions: [condition-1, condition-2]
```

**Example (@devops — Gage):**
```
exclusive_operations:
  - git push
  - gh pr create
  - gh pr merge
  - MCP add/remove
  - Release tagging

delegation_rules:
  - Implementation → @dev
  - Testing → @qa
  - Story creation → @sm
  - Architecture → @architect
  - Product strategy → @pm

veto_conditions:
  - Push without green CI → BLOCK
  - Merge without @qa gate → BLOCK
  - Push to main from feature branch → BLOCK (require PR)
```

**Cloning Pattern:** Extract authority boundaries → Define for new agent (cannot clone exclusive ops)

---

## Extraction Methodology (Phase 3: Stories 8.3.1-8.3.2)

### Story 8.3.1: Voice DNA Extraction (2sp)

**Input:** Existing agent YAML  
**Output:** `voice-dna-{agent-id}.yaml`

```
Process:
1. Parse agent.communication section
2. Extract tone, emoji_frequency, vocabulary
3. Analyze greeting + signature patterns
4. Classify archetype (from zodiac + style + persona.role)
5. Generate voice profile (compact summary)

Tools:
- Natural language analysis (existing @analyst patterns)
- Vocabulary extraction (keyword frequency)
- Tone classification (simple heuristics: directive vs. collaborative)
```

**Validation:** Voice DNA matches original agent communication patterns (90%+ match via sampled prompts)

### Story 8.3.2: Thinking DNA Cloning (2sp)

**Input:** Existing agent commands + dependencies + CLAUDE.md rules  
**Output:** `thinking-dna-{agent-id}.yaml`

```
Process:
1. Extract core_principles from persona section
2. Identify workflow_phases from command list ordering
3. Extract decision_hierarchy from rules files
4. Map error_handling strategies from dependencies
5. Define escalation_conditions (from authority + gates)

Tools:
- Command sequence analysis (topological sort)
- Rule file parsing (grep for IF-THEN patterns)
- Dependency graph traversal (entity registry)
```

**Validation:** Thinking DNA can regenerate original workflow (no regressions)

---

## Squad Template Generation (Phase 3: Stories 8.3.3-8.3.7)

### Story 8.3.3: Squad Template Generation (2sp)

**Input:** Voice DNA + Thinking DNA  
**Output:** `squad-{name}/squad.yaml` (template)

```yaml
squad:
  name: audit-squad
  purpose: "Financial audit and compliance review"
  mentors: [dev, qa]  # Base DNA from these agents
  agents: 3-5
  
  agent-1:
    name: Auditor
    voice_dna:
      tone: analytical, objective
      vocabulary: [verify, audit, validate, examine, trace]
      archetype: Detective
    thinking_dna:
      core_principles:
        - Traceability-first
        - Zero unverified claims
      workflow_phases:
        1. Gather audit scope
        2. Trace requirements
        3. Validate implementation
    authority:
      can: [review code, run tests]
      cannot: [merge, design architecture]
```

### Story 8.3.4: Skill Mapping & Validation (1.5sp)

- Extract skills from agent commands
- Match to squad purpose
- Identify gaps (e.g., "audit squad needs database knowledge")
- Suggest skills from entity registry (REUSE pattern)

### Story 8.3.5: Authority Matrix (1.5sp)

- Define exclusive operations per squad agent
- Validate no conflicts with existing agents
- Document delegation rules
- Link to Constitution Article II

### Story 8.3.6: Knowledge Base Assembly (2sp)

- Collect relevant tasks from entity registry
- Select templates matching squad purpose
- Gather domain-specific rules
- Package as squad knowledge base

### Story 8.3.7: Rules System for Squad (1.5sp)

- Define squad-specific rules (override global where needed)
- Link to CLAUDE.md for persistence
- Validate against Constitution

---

## Cloning Workflow (Phase 3: Story 8.3.8)

**Command:** `*create-squad {name} --mentor {agent-id} --purpose {text}`

```bash
# Example
*create-squad audit-squad --mentor dev --mentor qa --purpose "Financial audit and compliance"

# Process
1. Load voice-dna-dev.yaml + voice-dna-qa.yaml
2. Load thinking-dna-dev.yaml + thinking-dna-qa.yaml
3. Blend DNA (60% dev, 40% qa weighted)
4. Generate 3-5 agent personas (all inheriting blended DNA)
5. Extract relevant skills + tasks from mentors
6. Create squad folder + agents + CLAUDE.md
7. Validate against Constitution Article II (no exclusive op conflicts)
8. Output: squad-audit/squad.yaml (ready for manual refinement)
```

---

## Risk Assessment

| Risk | Probability | Mitigation |
|------|-----------|-----------|
| Cloned agents lack originality | MEDIUM | Manual refinement post-generation, preserve agent judgment |
| Authority conflicts between squads | MEDIUM | Pre-check exclusive operations, block conflicts |
| DNA mismatch (original vs cloned) | LOW | Validation suite against original agent behavior |
| Scalability (100s of agents) | LOW | DNA extraction is O(1), generation is O(n agents) |

---

## Success Metrics for Phase 3

- [ ] Voice DNA extracted for 10 agents with 90%+ fidelity
- [ ] Thinking DNA regenerates original workflow (no regressions)
- [ ] Squad generation takes <10min (vs 2h manual)
- [ ] Cloned agents pass Constitution validation
- [ ] Authority conflicts detected 100% of time

---

## Timeline

**Week 1 (Jun 11-15):** Research + validation (THIS document)  
**Week 5 (Jul 5-12):** Stories 8.3.1-8.3.8 executed  
**Week 6+ (Jul 13+):** Squad Creator PRO available

---

## Next Steps (Handoff to @pm)

1. **@architect Validation** — Review DNA extraction patterns, confirm no invented methodologies
2. **Research Continuation** — May require Phase 1 observability metrics (monitor squad health)
3. **Spec Pipeline** — Convert to Phase 3 PRD

---

*Research by @analyst (Atlas), Validation pending by @architect (Aria)*
