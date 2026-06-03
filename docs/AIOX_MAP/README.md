# AIOX Framework Cartography — Interactive Dashboard

**Interactive visual map and audit of Synkra AIOX v2.1**

## 📂 Files Location

```
C:\Users\lealp\KAIROS_CEREBRO\docs\
├── AIOX_MAP.html          ← Open this in browser (complete dashboard)
└── AIOX_MAP_README.md     ← This file
```

## 🚀 How to Use

### Option 1: Open in Browser (Recommended)

```bash
# Windows
start docs\AIOX_MAP.html

# macOS
open docs/AIOX_MAP.html

# Linux
xdg-open docs/AIOX_MAP.html
```

Or simply double-click `AIOX_MAP.html` in file explorer.

### Option 2: View in Claude Code

Use the `/aiox-map` skill directly:

```
/aiox-map              # Markdown report
/aiox-map --json       # JSON export
/aiox-map --graph      # Interactive visualization
```

---

## 📊 Dashboard Sections

### 1. **Overview** 📊
- Framework statistics (13 agents, 120+ tasks, 8 workflows)
- Quick reference table
- Framework purpose and architecture

### 2. **Agents** 👥
- Complete agent registry
- All 13 agents with personas and roles
- Exclusive operations per agent
- Searchable interface

### 3. **Authority Matrix** 🔐
- Exclusive operations (non-delegable)
- Delegation patterns visualization
- Authority flow diagram
- Blocked operations

### 4. **Workflows** ⚙️
- **Story Development Cycle (SDC):** Create → Validate → Implement → QA → Push
- **Spec Pipeline:** Gather → Assess → Research → Write → Critique → Plan
- **QA Loop:** Iterative review-fix cycle (max 5 iterations)
- **Brownfield Discovery:** 10-phase technical debt assessment

### 5. **DNA Patterns** 🧬
- Core mental models extracted from framework
- 8 key patterns: Agent Specialization, Story-Driven, Quality Gates, Authority Hierarchy, etc.
- Framework philosophy and principles

### 6. **Framework Layers** 🏛️
- **L1 Core** (NEVER modify) — Protected by deny rules
- **L2 Templates** (extend-only) — Framework templates
- **L3 Config** (conditional) — Project configuration
- **L4 Runtime** (always mutable) — Project work

### 7. **Audit Results** ✔️
- Structural validation results
- Passed/Warning/Failed items
- Compliance checklist
- Overall framework health

---

## 🎯 Use Cases

### For Onboarding
1. Open AIOX_MAP.html
2. Go to **Agents** tab — understand who does what
3. Go to **Authority Matrix** — see exclusive operations
4. Go to **Workflows** — follow the Story Development Cycle

### For Architecture Understanding
1. Go to **Overview** — get statistics
2. Go to **Framework Layers** — understand protection model
3. Go to **DNA Patterns** — learn core principles
4. Go to **Audit Results** — verify consistency

### For Compliance Checking
1. Go to **Audit Results** tab
2. Check the **Compliance Checklist**
3. Verify all items are PASS
4. Review **Observations** section

### For Delegation Questions
1. Go to **Authority Matrix** tab
2. Find the operation in "Exclusive Operations" table
3. See which agent owns it
4. Check "Delegation Patterns" for flow

---

## 🔍 Feature Highlights

### ✨ Interactive Elements

- **Tab Navigation:** Click tabs to switch between sections
- **Agent Search:** Type in the search box to filter agents
- **Color-Coded Badges:**
  - 🔵 Blue = Developer (@dev)
  - 🟢 Green = QA (@qa)
  - 🔴 Red = DevOps (@devops)
  - 🟣 Purple = Product Manager (@pm)
  - 🟠 Orange = Product Owner (@po)
  - 🔵 Cyan = Scrum Master (@sm)

### 📱 Responsive Design
- Works on desktop, tablet, mobile
- Dark theme for extended viewing
- Optimized readability
- Copy-friendly text

### 📋 Data Accuracy
- All data sourced from real `.aiox-core/` files
- Authority matrix from `.claude/rules/agent-authority.md`
- Framework structure verified in real-time
- No invented components

---

## 📚 Quick Reference

### Agent Personas

| Agent | Persona | Key Operation |
|-------|---------|----------------|
| @dev | Dex | `git add`, `git commit` |
| @qa | Quinn | `*qa-loop` |
| @pm | Morgan | `*execute-epic` |
| @po | Pax | `*validate-story` |
| @sm | River | `*create-story` |
| @architect | Aria | Architecture decisions |
| @data-engineer | Dara | Schema design |
| @ux-design-expert | Uma | Design decisions |
| @analyst | Alex | `*research` |
| @devops | Gage | `git push` (EXCLUSIVE) |

### Exclusive Operations
- **@devops:** `git push`, `gh pr create/merge`, MCP management
- **@pm:** `*execute-epic`, `*create-epic`
- **@po:** `*validate-story-draft`
- **@sm:** `*create-story`, `*draft`

### Story Development Cycle Phases
1. **Create** (@sm) → story.md (Draft)
2. **Validate** (@po) → Go/NoGo + checklist
3. **Implement** (@dev) → Code + File List
4. **QA Gate** (@qa) → PASS/CONCERNS/FAIL
5. **Push** (@devops) → Commit on main

---

## 🔧 Technical Details

### Framework Details
- **Framework:** Synkra AIOX v2.1
- **Components:** 13 agents, 120+ tasks, 8 workflows, 6 checklists
- **Constitution:** 6 articles (all NON-NEGOTIABLE)
- **Protection:** L1-L2 immutable (deny rules), L3-L4 conditional/mutable

### File Information
- **Format:** HTML5 + CSS3 + Vanilla JavaScript
- **Size:** ~45 KB (optimized)
- **Dependencies:** None (fully standalone)
- **Compatibility:** All modern browsers (Chrome, Firefox, Safari, Edge)

### Generated From
- `.aiox-core/development/agents/` — Agent definitions
- `.aiox-core/development/tasks/` — Task index
- `.claude/rules/agent-authority.md` — Authority matrix
- `.claude/rules/workflow-execution.md` — Workflow definitions
- `.aiox-core/constitution.md` — Framework principles

---

## 🚀 Next Steps

1. **Open the dashboard:** `docs/AIOX_MAP.html`
2. **Explore the tabs** to understand framework structure
3. **Reference the Agent Search** when unsure who does what
4. **Check Authority Matrix** before delegating operations
5. **Review DNA Patterns** to understand core philosophy

---

## 💡 Tips

- **Bookmark the page** for quick reference during development
- **Use Ctrl+F (Cmd+F)** to search within sections
- **Share with team members** for onboarding
- **Update with `/aiox-map --graph`** if framework changes significantly

---

## 📞 Questions?

- For agent authority questions → Check **Authority Matrix** tab
- For workflow details → Check **Workflows** tab
- For framework understanding → Check **DNA Patterns** tab
- For compliance verification → Check **Audit Results** tab

---

**Generated:** 2026-06-03  
**Source:** Synkra AIOX v2.1  
**Tool:** `/aiox-map` skill (Anvil the Artificer)

*Interactive dashboard. All data real. No invention.*
