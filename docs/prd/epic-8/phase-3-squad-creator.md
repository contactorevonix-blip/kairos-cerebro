# EPIC-8 Phase 3: Squad Creator PRO — Detailed PRD

**Phase:** 3 of 4  
**Duration:** Jul 20 → Aug 2, 2026 (2 weeks)  
**Effort:** 15 story points  
**Stories:** 8.3.1 through 8.3.8  
**Success Metric:** Rapid specialist squad creation via agent DNA extraction (10 min vs 2h manual)

---

## Phase 3 Vision

Creating custom agent squads currently requires 2+ hours manual YAML/markdown editing. Phase 3 automates this via **DNA extraction**:

1. **Voice DNA** — Extract communication tone, vocabulary, emoji style, greeting patterns
2. **Thinking DNA** — Clone decision frameworks, workflow logic, command chains
3. **Squad Templates** — Auto-generate complete squad.yaml from mentor agent
4. **Validation** — Ensure cloned agents behave like mentor (95%+ parity tests)

**Outcome:** `*create-squad {mentor-agent}` command creates specialist squads in <10 minutes

**Use Cases:**
- Clone @dev into specialized developer squad (e.g., frontend-dev, backend-dev)
- Clone @architect into specialized architects (e.g., infra-architect, domain-architect)
- Create domain-specific squads from existing agent templates

---

## Research Foundation

**Source:** `docs/research/squad-creator-dna-patterns.md`

**Current Agent Structure (Observed):**
- Persona section: role, style, archetype, zodiac
- Communication: tone, vocabulary, emoji frequency, greeting
- Commands: 30-50 per agent, with visibility + description
- Dependencies: tasks, templates, scripts, checklists
- Authority matrix: exclusive operations per Article II

**Key Insight:** Agent DNA is extractable and cloneable — no need to rewrite

---

## User Stories

### 8.3.1: Voice DNA Extraction (2sp)

**Objective:** Extract and model agent communication patterns

**Acceptance Criteria:**
- [ ] Module: `.aiox-core/core/squad-creator/voice-dna.js`
  - Extracts from agent YAML: tone, vocabulary, emoji_frequency, greeting
  - Models communication style as JSON schema
  - Detects patterns: Which words are signature? Which phrases repeated?
- [ ] API: `extractVoiceDNA(agentYaml)` → DNA object
  - `tone: string` (direct, strategic, analytical, etc.)
  - `signature_vocab: [word1, word2, ...]` (top 10 words)
  - `emoji_style: {frequency: "low"|"medium"|"high", favorites: [...]}` 
  - `greeting_template: string` (with {placeholders})
- [ ] Testing: Clone @dev voice → test greeting matches tone (direct + pragmatic)
- [ ] Output: DNA stored as `.aiox/squad-dnas/{agent-id}-voice.json`

**Dependencies:** None

---

### 8.3.2: Thinking DNA Cloning (2sp)

**Objective:** Extract decision frameworks and workflow logic

**Acceptance Criteria:**
- [ ] Module: `.aiox-core/core/squad-creator/thinking-dna.js`
  - Extracts from commands + tasks: decision trees, branching logic
  - Models as state machine: {state: string, transitions: [{condition, action, next_state}]}
- [ ] API: `extractThinkingDNA(agentYaml)` → DNA object
  - `decision_framework: [{trigger, options, default}]`
  - `workflow_chains: {command: [task1, task2, ...]}` (execution order)
  - `error_recovery: {error_type: recovery_action}`
- [ ] Testing: Execute cloned agent → decisions match mentor (90%+ alignment)
- [ ] Output: DNA stored as `.aiox/squad-dnas/{agent-id}-thinking.json`

**Dependencies:** None (independent from 8.3.1)

---

### 8.3.3: Squad Template Generation (2sp)

**Objective:** Auto-generate squad.yaml from extracted DNA + customization

**Acceptance Criteria:**
- [ ] Module: `.aiox-core/core/squad-creator/squad-template-generator.js`
  - Input: Mentor agent + customizations (name, role, focus area)
  - Template engine: `.aiox-core/development/templates/squad-tmpl.yaml`
- [ ] Generated squad.yaml includes:
  - Agent definitions: Mentor voice/thinking + customization
  - Squad metadata: squad_id, focus_area, created_from (audit trail)
  - Dependencies: Clone mentor dependencies (tasks, scripts, etc.)
  - Authority: Copy from mentor (exclusive operations)
- [ ] CLI command: `aiox squad create --mentor {agent} --name {name} --focus {focus}`
- [ ] Output: `squads/{squad-id}/squad.yaml` ready for activation

**Dependencies:** 8.3.1, 8.3.2

**Example:**
```bash
aiox squad create --mentor dev --name frontend-squad --focus "frontend"
→ Creates: squads/frontend-squad/squad.yaml
```

---

### 8.3.4: Skill Mapping & Validation (1.5sp)

**Objective:** Map mentor skills to cloned squad + validate command chains

**Acceptance Criteria:**
- [ ] Registry: `.aiox/squad-dnas/{squad-id}-skills.json`
  - Skills inherited from mentor (subset or full)
  - Skill availability matrix: skill → command → task mapping
- [ ] Validation: `aiox squad validate {squad-id}`
  - Check all referenced tasks exist
  - Check all command chains are valid
  - Check dependencies are installed (or documented as external)
- [ ] Report: `docs/squad-validations/{squad-id}-report.md`
  - ✅ Passed skills
  - ⚠️ Requires customization (e.g., domain-specific tasks)
  - ❌ Missing dependencies (human action required)

**Dependencies:** 8.3.3

---

### 8.3.5: Authority Matrix (1.5sp)

**Objective:** Extract + validate exclusive operations from mentor

**Acceptance Criteria:**
- [ ] Module: `.aiox-core/core/squad-creator/authority-matrix.js`
  - Extracts from mentor: exclusive operations (Article II)
  - Models as: {operation: [agent1, agent2, ...] (only these can do)}
- [ ] Validation: Cloned squad inherits mentor's authority constraints
  - Example: If mentor @devops can `git push`, cloned squad-dev cannot
  - Check: No authority escalation (cloned squad <unrestricted>)
- [ ] Documentation: `.aiox/squad-dnas/{squad-id}-authority.md`
  - Lists all inherited exclusive operations + constraints

**Dependencies:** 8.3.3

---

### 8.3.6: Knowledge Base Assembly (2sp)

**Objective:** Assemble squad-specific knowledge base from mentor + project context

**Acceptance Criteria:**
- [ ] KB assembly: Combine:
  - Mentor agent KB (from mentor's knowledge base)
  - Project context (from `.aiox-core/data/aiox-kb.md`)
  - Domain-specific docs (from `docs/guides/{focus-area}.md` if exists)
- [ ] Output: `squads/{squad-id}/.aiox-core/kb/{squad-id}-kb.md` (markdown)
- [ ] Format: Sections: Agent Profile, Skills, Commands, Dependencies, Rules
- [ ] Update: KB automatically updates when mentor KB or project docs change

**Dependencies:** 8.3.3

---

### 8.3.7: Rules System for Squad (1.5sp)

**Objective:** Inherit mentor rules + define squad-specific rule overrides

**Acceptance Criteria:**
- [ ] Rule inheritance: Copy mentor's `.claude/rules/` to squad context
- [ ] Customization: Allow squad to override specific rules
  - Example: Squad for UI work might override `absolute-imports.md` for CSS modules
- [ ] Validation: @qa gate checks no rule conflicts with framework
- [ ] File: `squads/{squad-id}/.claude/rules/squad-overrides.md`
  - Lists all inherited rules + documented overrides

**Dependencies:** 8.3.3

---

### 8.3.8: Integration Tests (2sp)

**Objective:** Validate cloned squad behaves like mentor (95%+ parity)

**Acceptance Criteria:**
- [ ] Test suite: `tests/squad-creator/squad-parity.test.js`
  - Voice parity: Greeting text matches tone ✅
  - Command parity: All mentor commands callable in cloned squad ✅
  - Workflow parity: Decision trees work identically ✅
  - Authority parity: Exclusive ops inherited correctly ✅
- [ ] Benchmark: Mentor vs cloned squad execution on sample workflow
  - Should reach 95%+ parity score
  - Differences documented (customizations OK)
- [ ] Regression: Parity tests run on every mentor KB update

**Dependencies:** 8.3.1-8.3.7

**Test Example:**
```javascript
const mentor = loadAgent('dev');
const cloned = loadSquad('frontend-squad');
expect(cloned.voice.tone).toEqual(mentor.voice.tone); // ✅
expect(cloned.commands.length).toBeGreaterThan(0); // ✅
```

---

## Handoff to Phase 4

**Trigger:** All Phase 3 stories DONE, parity tests PASS

**Deliverables:**
- ✅ `aiox squad create` command working
- ✅ Mentor DNA extraction 100% automated
- ✅ Cloned squads validated (95%+ parity)
- ✅ 3+ example squads created (proof)

**Carry-forward to Phase 4:**
- Squad creation metrics tracked (time saved, parity score)
- Auto-healing applied to squad creation (fix common errors)

---

## Success Metrics

| Metric | Target | Acceptance |
|--------|--------|-----------|
| `aiox squad create` time | <10 minutes | ✅ MUST |
| Parity score | >95% | ✅ MUST |
| Voice DNA accuracy | 100% (tone/vocab match) | ✅ MUST |
| Command chain validity | 100% (no broken chains) | ✅ MUST |
| Documentation complete | Full API + tutorial | ✅ MUST |

---

## Non-Scope

- **Not Modifying Mentor Agents:** Squad Creator clones but never modifies the original agent
- **Not Creating UI:** Squad creation is CLI-only
- **Not Auto-fixing Agent Bugs:** If mentor has bugs, cloned squad inherits them

---

## References

**Related Documents:**
- `docs/research/squad-creator-dna-patterns.md` — Research phase findings
- `docs/guides/squad-creator-pro-guide.md` — Usage guide (created post-Phase 3)
- `squads/{squad-id}/squad.yaml` — Generated template

---

*Phase 3 PRD — Ready for Story Creation*
