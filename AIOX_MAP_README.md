# AIOX Map — Framework Audit &amp; DNA Extraction

**Generated:** 2026-06-03 | **Framework:** Synkra AIOX v2.1 | **Project:** KAIROS_CEREBRO

Complete audit and visualization of the Synkra AIOX framework, mapping all agents, tasks, workflows, authorities, and dependencies.

---

## 📋 Output Files

### 1. **AIOX_MAP.html** (Interactive Dashboard)
**Size:** ~24 KB | **Format:** HTML5 + CSS3 | **Browser:** Any modern browser

Visual dashboard with:
- **Agent Registry** — All 12 agents with personas, roles, and exclusive operations
- **Authority Matrix** — Complete delegation breakdown (exclusive, delegated, allowed)
- **Story Development Cycle** — 5-phase SDC workflow with gates
- **Framework Boundary (L1-L4)** — Layer separation and protection rules
- **Constitution Principles** — 6 articles with severity levels
- **Agent Dependency Tree** — Visual hierarchy of agent relationships
- **Planning Tracks** — Quick Flow, Standard, Enterprise processes
- **MCP Configuration** — Tool selection priority and governance

**How to use:**
```bash
# Windows
start C:\Users\lealp\KAIROS_CEREBRO\AIOX_MAP.html

# Or open in your preferred browser
```

Interactive styling with hover effects, color-coded severity levels, and responsive layout.

---

### 2. **AIOX_MAP_ASCII.txt** (Terminal-Friendly Report)
**Size:** ~26 KB | **Format:** Plain text (UTF-8) | **Viewer:** Any text editor

Terminal-friendly comprehensive report with:
- Framework statistics (agents, tasks, workflows, layers)
- Agent registry with detailed personas
- Authority matrix with exclusive/delegated/allowed operations
- Story Development Cycle workflow diagram
- Secondary workflows (QA Loop, Spec Pipeline, Brownfield)
- Framework boundary layers (L1-L4) with protection rules
- Constitution principles with gates
- Rules system (8 detailed rules)
- Planning tracks reference
- MCP usage rules and tool priority
- Agent dependency tree
- File paths reference
- Compliance checklist

**How to use:**
```bash
# View in terminal
cat AIOX_MAP_ASCII.txt

# Or open in text editor
code AIOX_MAP_ASCII.txt

# Or search
grep -i "exclusive" AIOX_MAP_ASCII.txt
```

Perfect for:
- Quick reference in terminal
- Copy-paste excerpts into documentation
- Git-friendly diff/version control
- Offline access

---

### 3. **AIOX_MAP.json** (Machine-Readable Data)
**Size:** ~15 KB | **Format:** JSON | **Parser:** jq, Python, Node.js, etc.

Structured machine-readable audit data with:
- Framework metadata (version, project, generated timestamp)
- Audit statistics
- Complete agent definitions (12 agents with authority matrices)
- Workflows (primary workflows with phases and gates)
- Authority matrix (exclusive operations by agent)
- Framework boundary (L1-L4 layer definitions)
- Constitution articles
- Rules registry
- Planning tracks
- Story lifecycle state machine
- All relationships and dependencies

**How to use:**
```bash
# Parse with jq
jq '.agents | keys[]' AIOX_MAP.json

# Count exclusive operations
jq '.authority_matrix.exclusive_operations | .[] | length' AIOX_MAP.json

# Get agent details
jq '.agents.dev' AIOX_MAP.json

# Python
import json
with open('AIOX_MAP.json') as f:
    aiox = json.load(f)
    print(aiox['agents']['devops']['authority']['exclusive'])
```

Perfect for:
- CI/CD pipeline integration
- Programmatic validation
- Tooling and automation
- API responses
- Configuration management

---

## 🎯 Quick Navigation

### For Understanding the Framework
**Start here:** AIOX_MAP.html (visual overview) → AIOX_MAP_ASCII.txt (detailed reference)

### For Leadership/Presentation
**Use:** AIOX_MAP.html (interactive dashboard with styling)

### For Developers
**Use:** AIOX_MAP_ASCII.txt (search-friendly, terminal-friendly)

### For Automation/Integration
**Use:** AIOX_MAP.json (structured data, parsing-friendly)

---

## 📊 Key Findings Summary

### Agent Authority Distribution
- **@devops:** 5 exclusive operations (git push, MCP, CI/CD)
- **@pm:** 2 exclusive operations (*create-epic, *execute-epic)
- **@po:** 1 exclusive operation (*validate-story-draft)
- **@sm:** 2 exclusive operations (*draft, *create-story)
- **@aiox-master:** 1 exclusive (Constitution enforcement)
- **@dev, @qa, @architect, @analyst, @data-engineer, @ux-designer, @squad-creator:** Allowed/delegated operations

### Workflow Architecture
- **Primary:** Story Development Cycle (SDC) — 5 phases, mandatory for all development
- **Secondary:** QA Loop (auto-healing, max 5 iterations), Spec Pipeline (3-6 phases by complexity), Brownfield (10 phases)
- **Gates:** 7+ verification gates across workflows with auto-escalation

### Framework Protection
- **L1 Core:** NEVER modify (constitution, core agents, CLI)
- **L2 Templates:** NEVER modify (tasks, templates, workflows, infrastructure)
- **L3 Config:** Mutable with allow rules (core-config.yaml, agent MEMORY.md)
- **L4 Runtime:** ALWAYS modify (docs/stories, packages, squads, project code)

### Constitution Enforcement
- **6 Articles** with inegotiable principles
- **5 Articles are NON-NEGOTIABLE/MUST** (CLI First, Agent Authority, Story-Driven, No Invention, Quality First)
- **Automatic gates** block violations during execution

### Rules System
- **8 contextual rules** automatically loaded by Claude Code
- **Paths-based activation:** Rules with `paths:` frontmatter only load when relevant files are edited
- **Agent handoff compaction:** Context reduced ~33% per agent switch via structured handoff artifacts

---

## 🔍 How the Audit Was Conducted

### Step 1: Framework Structure Scan
Located and catalogued all framework artefacts:
- 12 agent definitions (YAML/Markdown in `.aiox-core/development/agents/`)
- 150+ task definitions (Markdown in `.aiox-core/development/tasks/`)
- 4 primary workflow definitions
- 8 contextual rules (Markdown in `.claude/rules/`)

### Step 2: Agent DNA Extraction
For each agent, extracted:
- Name, persona, archetype, role
- Exclusive operations (if any)
- Allowed operations
- Blocked operations
- Task executors and dependencies

### Step 3: Authority Matrix Mapping
Cross-referenced:
- Agent authority rules from `.claude/rules/agent-authority.md`
- Constitution enforcement from `.aiox-core/constitution.md`
- Delegation patterns from agent definitions
- Exclusive operation gatekeeping

### Step 4: Workflow Dependency Analysis
Mapped:
- Story Development Cycle (5 phases, each with responsible agent)
- QA Loop iteration and escalation logic
- Spec Pipeline complexity-based branching
- Brownfield discovery 10-phase assessment
- Cross-workflow dependencies and handoff points

### Step 5: Framework Boundary Validation
Verified:
- L1-L4 layer separation
- Deny/allow rules in `.claude/settings.json`
- Framework vs. project runtime boundaries
- Protected paths and mutable paths

### Step 6: Output Generation
Generated three complementary outputs:
- HTML dashboard (visual, interactive)
- ASCII report (text-based, searchable)
- JSON structure (machine-readable, programmatic)

---

## 📚 Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Constitution | `.aiox-core/constitution.md` | 6 inegotiable principles with gates |
| Agent Authority Rules | `.claude/rules/agent-authority.md` | Exclusive operations matrix |
| Agent Definitions | `.aiox-core/development/agents/*.md` | 12 agent personas &amp; commands |
| Task Definitions | `.aiox-core/development/tasks/*.md` | 150+ executable workflows |
| Core Config | `.aiox-core/core-config.yaml` | Framework configuration |
| Project Rules | `.claude/rules/` | 8 contextual rules (auto-loaded) |
| Story Lifecycle | `.claude/rules/story-lifecycle.md` | Status transitions &amp; gates |
| Workflow Execution | `.claude/rules/workflow-execution.md` | 4 workflows detailed execution |

---

## 🔐 Compliance Checklist

Before executing ANYTHING in the framework, verify:

- [ ] **Article I (CLI First):** Is this a CLI-first operation?
- [ ] **Article II (Agent Authority):** Is the right agent doing it?
- [ ] **Article III (Story-Driven):** Does it trace to a story in `docs/stories/`?
- [ ] **Article IV (No Invention):** Does it trace to requirements (FR-*, NFR-*, CON-*)?
- [ ] **Article V (Quality First):** Will it pass quality gates?
- [ ] **Article VI (Absolute Imports):** Are agent memories loaded?

---

## 🚀 Usage Examples

### Example 1: Understanding @devops Authority
```bash
# View in HTML
# Open AIOX_MAP.html → Search "devops" → See Authority Matrix

# Or with jq
jq '.agents.devops' AIOX_MAP.json

# Or with grep
grep -A 20 "@devops" AIOX_MAP_ASCII.txt
```

### Example 2: Check Story Lifecycle
```bash
# Terminal view
grep -A 50 "PHASE 1" AIOX_MAP_ASCII.txt

# Or JSON
jq '.story_lifecycle' AIOX_MAP.json

# Or HTML
# Open AIOX_MAP.html → Scroll to "Story Development Cycle"
```

### Example 3: Verify Authority Before Action
```bash
# Check if @dev can git push
jq '.agents.dev.authority.blocked[]' AIOX_MAP.json | grep "git push"
# Output: "git push" → @dev is BLOCKED, needs @devops

# Check @qa responsibilities
jq '.agents.qa.exclusive_operations' AIOX_MAP.json
```

### Example 4: Find All Exclusive Operations
```bash
jq '.authority_matrix.exclusive_operations | .[][]' AIOX_MAP.json
# Lists all exclusive operations by agent
```

---

## 🎓 Learning Path

### For Beginners (New to AIOX)
1. Read AIOX_MAP_ASCII.txt (sections: Agent Registry, Story Development Cycle, Constitution)
2. Open AIOX_MAP.html (visual overview)
3. Read `.aiox-core/constitution.md` (full principles)

### For Implementers (@dev, @qa, @architect)
1. Find your agent in AIOX_MAP_ASCII.txt
2. Note your exclusive/blocked operations
3. Review your task executor in `.aiox-core/development/tasks/`
4. Understand Story Lifecycle in `.claude/rules/story-lifecycle.md`

### For Managers (@pm, @po, @sm)
1. Review the Story Development Cycle (AIOX_MAP_ASCII.txt)
2. Understand the Planning Tracks (Quick Flow, Standard, Enterprise)
3. Reference the Authority Matrix for delegation
4. Review Constitution principles for governance

### For Platform/Framework Maintainers (@aiox-master, @devops)
1. Review Framework Boundary (L1-L4)
2. Understand all 8 Rules in `.claude/rules/`
3. Study Constitution enforcement gates
4. Reference Agent Authority Matrix

---

## 📝 Notes

- **Generated automatically** by AIOX Map skill
- **Source of truth:** All data extracted from live framework files (never invented)
- **Framework version:** 2.1 (compacted 2026-05-28)
- **Audit coverage:** 100% of agent definitions, 100% of exclusive operations, 100% of constitutional articles
- **Validation:** Cross-referenced with `.claude/rules/agent-authority.md` and `.aiox-core/constitution.md`

---

## 🔗 Related Outputs

- **AIOX_MAP.html** — Visual dashboard (this was generated with `--graph` flag)
- **AIOX_MAP_ASCII.txt** — Terminal report (searchable, offline-friendly)
- **AIOX_MAP.json** — Machine-readable structure (for automation/tooling)

---

*Generated by AIOX Map Skill — Synkra AIOX Framework Cartographer*  
**Pedro Leal | KAIROS_CEREBRO v2.1 | 2026-06-03**

For complete framework documentation, see: `.aiox-core/constitution.md`
