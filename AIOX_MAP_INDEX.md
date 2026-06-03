# AIOX Map — Complete Audit Output Index

**Generated:** 2026-06-03 | **Framework:** Synkra AIOX v2.1 | **Project:** KAIROS_CEREBRO

---

## 📁 Output Files

### 1. **AIOX_MAP.html** (23 KB)
**Format:** Interactive HTML5 Dashboard  
**Viewer:** Any modern web browser  
**Purpose:** Visual, interactive overview with styling

**Contents:**
- 📊 Framework statistics (agents, tasks, workflows)
- 📋 Agent registry (12 agents with personas)
- 🔐 Authority matrix (exclusive/delegated/allowed operations)
- 🔄 Story Development Cycle (5-phase workflow with gates)
- 🌳 Agent dependency tree
- 🎯 Constitution principles (6 articles)
- 🚧 Framework boundary (L1-L4 layers)

**How to open:**
```bash
# Windows
start AIOX_MAP.html

# Or drag into browser
# Or right-click → Open with → Browser
```

**Best for:**
- Leadership presentations
- Visual understanding of framework
- Quick reference with search
- Color-coded severity levels

---

### 2. **AIOX_MAP_ASCII.txt** (25 KB)
**Format:** Plain text (UTF-8), ANSI formatting  
**Viewer:** Any text editor, terminal, or `cat`  
**Purpose:** Terminal-friendly comprehensive reference

**Contents:**
- 📊 Framework statistics
- 🤖 Agent registry with authority details
- 🔐 Authority matrix breakdown
- 🔄 Story Development Cycle diagram (ASCII art)
- ⚙️ Secondary workflows (QA Loop, Spec Pipeline, Brownfield)
- 🚧 Framework boundary (L1-L4)
- ⚖️ Constitution principles
- 📚 Rules system (8 contextual rules)
- 🛤️ Planning tracks (Quick Flow, Standard, Enterprise)
- 🔌 MCP usage rules and tool priority
- 🎓 Agent dependency tree (ASCII)
- 📍 File paths reference
- ✅ Compliance checklist

**How to view:**
```bash
# Terminal
cat AIOX_MAP_ASCII.txt

# Search
grep -i "exclusive" AIOX_MAP_ASCII.txt

# Edit
code AIOX_MAP_ASCII.txt

# Less (with scrolling)
less AIOX_MAP_ASCII.txt
```

**Best for:**
- Quick reference in terminal
- Copy-paste excerpts
- Git-friendly (plain text, diffs work)
- Offline access
- Search and grep operations

---

### 3. **AIOX_MAP.json** (15 KB)
**Format:** JSON (machine-readable)  
**Parser:** jq, Python, Node.js, Go, etc.  
**Purpose:** Structured data for automation and tooling

**Contents:**
- Framework metadata
- Audit statistics
- Complete agent definitions (12 agents)
- Authority matrices (exclusive/delegated operations)
- Workflows (primary workflows with phases)
- Framework boundary (L1-L4 definitions)
- Constitution articles
- Rules registry
- Planning tracks
- Story lifecycle state machine

**How to parse:**
```bash
# jq examples
jq '.agents | keys[]' AIOX_MAP.json          # List agent IDs
jq '.agents.dev.authority' AIOX_MAP.json      # @dev authority
jq '.authority_matrix' AIOX_MAP.json          # Full authority matrix

# Python
import json
with open('AIOX_MAP.json') as f:
    aiox = json.load(f)
    print(aiox['agents']['devops']['exclusive_operations'])

# JavaScript/Node.js
const aiox = require('./AIOX_MAP.json');
console.log(aiox.agents.qa.exclusive_operations);
```

**Best for:**
- CI/CD pipeline integration
- Programmatic validation
- Configuration management
- API responses
- Automated compliance checking

---

### 4. **AIOX_DNA.md** (15 KB)
**Format:** Markdown documentation  
**Purpose:** Core patterns, mental models, and framework DNA

**Contents:**
- 🧬 8 Core DNA patterns:
  1. Agent specialization
  2. Story-driven workflow
  3. Quality gates
  4. Authority hierarchy
  5. Workflow composition
  6. Constitution as law
  7. Framework boundary
  8. Incremental development (IDS)
- 🎯 Mental models summary
- 🔄 Workflow DNA patterns (SDC, QA Loop, Spec Pipeline)
- 🚫 Anti-patterns (what NOT to do)
- 📐 Architectural principles
- 💡 Key insights

**How to read:**
```bash
# Markdown viewer
code AIOX_DNA.md

# Or terminal
cat AIOX_DNA.md

# Or web (GitHub will render it)
```

**Best for:**
- Understanding framework philosophy
- Teaching others
- Designing new features
- Onboarding
- Architecture discussions

---

### 5. **AIOX_MAP_README.md** (11 KB)
**Format:** Markdown documentation  
**Purpose:** Guide to all AIOX Map outputs and usage

**Contents:**
- 📋 Output files guide
- 🎯 Quick navigation
- 📊 Key findings summary
- 🔍 How the audit was conducted
- 📚 Related documentation
- 🔐 Compliance checklist
- 🚀 Usage examples
- 🎓 Learning paths by role

**How to read:**
```bash
# This file explains all outputs
# Start here to understand what's available
```

**Best for:**
- Getting started with AIOX Map
- Understanding audit methodology
- Finding what you need
- Learning paths by role

---

### 6. **AIOX_MAP_INDEX.md** (This File)
**Format:** Markdown documentation  
**Purpose:** Index and quick reference for all outputs

**Contents:**
- 📁 File descriptions
- 🎯 Use case mapping
- 📍 Quick navigation
- 🔑 Key sections in each file

---

## 🎯 Quick Navigation by Use Case

### "I want to understand the framework quickly"
1. Start: **AIOX_MAP.html** (visual overview, 5 minutes)
2. Deep dive: **AIOX_DNA.md** (patterns and mental models, 15 minutes)
3. Reference: **AIOX_MAP_ASCII.txt** (detailed breakdown, search as needed)

### "I need to know @devops authority"
- **AIOX_MAP.html** → Search "devops" in Authority Matrix
- **AIOX_MAP_ASCII.txt** → Search "@devops ONLY" (line 200+)
- **AIOX_MAP.json** → Parse with `jq '.agents.devops'`

### "I'm implementing a task"
- **AIOX_DNA.md** → Read "Task as Primitive" pattern
- **AIOX_MAP_ASCII.txt** → Review "Story Development Cycle" section
- **AIOX_MAP.json** → Query `.story_lifecycle` for state machine

### "I need to check compliance"
- **AIOX_MAP_ASCII.txt** → End of file has "Compliance Checklist"
- **AIOX_DNA.md** → Review "Anti-Patterns" section
- **AIOX_MAP.html** → Review Constitution principles (color-coded)

### "I'm setting up automation"
- **AIOX_MAP.json** → Parse with jq/Python/Node
- **AIOX_MAP_README.md** → See "Usage Examples" section
- Code examples: JSON has schema, AIOX_MAP_README.md has parsing samples

### "I'm training a team"
- Start: **AIOX_MAP_README.md** → Learning Paths by Role
- Deep: **AIOX_DNA.md** → Core patterns and teaching examples
- Reference: **AIOX_MAP_ASCII.txt** or **AIOX_MAP.html** for specific lookups

### "I'm auditing framework compliance"
- **AIOX_MAP_ASCII.txt** → Full audit data
- **AIOX_MAP.json** → Parse for programmatic validation
- **AIOX_DNA.md** → Review constitution principles
- **AIOX_MAP_README.md** → Compliance checklist

---

## 📍 Key Sections Quick Reference

### Agent Authority
| File | Section | Format |
|------|---------|--------|
| AIOX_MAP.html | Authority Matrix | Interactive table |
| AIOX_MAP_ASCII.txt | "🔐 AUTHORITY MATRIX" (line 120+) | Text table |
| AIOX_MAP.json | `.authority_matrix` | JSON object |
| AIOX_DNA.md | "Agent Specialization DNA" | Prose pattern |

### Story Lifecycle
| File | Section | Format |
|------|---------|--------|
| AIOX_MAP.html | Story Development Cycle | Visual flow |
| AIOX_MAP_ASCII.txt | "PHASE 1-5" sections | ASCII diagram |
| AIOX_MAP.json | `.story_lifecycle` | JSON state machine |
| AIOX_DNA.md | "SDC Pattern" | Prose explanation |

### Framework Boundary
| File | Section | Format |
|------|---------|--------|
| AIOX_MAP.html | Framework Boundary (L1-L4) | Interactive table |
| AIOX_MAP_ASCII.txt | "🚧 FRAMEWORK BOUNDARY" | Text table |
| AIOX_MAP.json | `.framework_boundary` | JSON object |
| AIOX_DNA.md | "Framework Boundary DNA" | Prose pattern |

### Constitution
| File | Section | Format |
|------|---------|--------|
| AIOX_MAP.html | Constitution Principles | Cards |
| AIOX_MAP_ASCII.txt | "⚖️ CONSTITUTION" | Text article |
| AIOX_MAP.json | `.constitution.articles` | JSON array |
| AIOX_DNA.md | "Constitution DNA" | Prose principle |

### Rules
| File | Section | Format |
|------|---------|--------|
| AIOX_MAP_ASCII.txt | "📚 RULES SYSTEM" (line 500+) | Numbered list |
| AIOX_MAP.json | `.rules.files` | JSON array |
| AIOX_MAP_README.md | "Related Documentation" | Table |
| Original files | `.claude/rules/` | 8 markdown files |

---

## 📊 File Statistics

| File | Size | Lines | Type | Purpose |
|------|------|-------|------|---------|
| AIOX_MAP.html | 23 KB | ~600 | HTML5 | Interactive dashboard |
| AIOX_MAP_ASCII.txt | 25 KB | ~950 | Plain text | Terminal reference |
| AIOX_MAP.json | 15 KB | ~480 | JSON | Machine-readable |
| AIOX_DNA.md | 15 KB | ~570 | Markdown | Patterns &amp; DNA |
| AIOX_MAP_README.md | 11 KB | ~420 | Markdown | Guide &amp; usage |
| **TOTAL** | **89 KB** | **~3,020** | Mixed | Complete audit |

---

## 🔍 Search Across Files

### Find "@devops authority"
```bash
grep -r "@devops" --include="*.txt" --include="*.md"
# Results in AIOX_MAP_ASCII.txt and AIOX_DNA.md

jq '.agents.devops' AIOX_MAP.json
# Structured result from JSON
```

### Find "Story Lifecycle"
```bash
grep -n "Status\|Draft\|Ready\|InProgress" AIOX_MAP_ASCII.txt | head -20

jq '.story_lifecycle' AIOX_MAP.json
```

### Find "Quality Gate" references
```bash
grep -i "quality" AIOX_MAP_ASCII.txt AIOX_DNA.md

# HTML: Search inside browser (Ctrl+F)
```

### Find Constitution articles
```bash
grep -n "Article [IVI]" AIOX_MAP_ASCII.txt

jq '.constitution.articles[] | .principle' AIOX_MAP.json
```

---

## 🎓 Learning Paths

### Path 1: New to AIOX (30 minutes)
1. Read **AIOX_MAP_README.md** → "Quick Navigation" (5 min)
2. Open **AIOX_MAP.html** in browser (10 min)
3. Read **AIOX_DNA.md** → "Core DNA Patterns" section (15 min)

### Path 2: Developer (@dev, @qa, @architect) (45 minutes)
1. Find your agent in **AIOX_MAP_ASCII.txt** (5 min)
2. Read your exclusive/blocked operations (5 min)
3. Review **AIOX_DNA.md** → "Workflow DNA Patterns" (15 min)
4. Read related rule in `.claude/rules/` (20 min)

### Path 3: Manager (@pm, @po, @sm) (60 minutes)
1. Read **AIOX_DNA.md** → "Story-Driven Workflow DNA" (15 min)
2. Review **AIOX_MAP_ASCII.txt** → Story Development Cycle (20 min)
3. Check Planning Tracks in AIOX_MAP_ASCII.txt (10 min)
4. Read Authority Hierarchy in AIOX_DNA.md (15 min)

### Path 4: Framework Maintainer (@aiox-master) (90 minutes)
1. Read **AIOX_DNA.md** (entire file) (30 min)
2. Review **AIOX_MAP.json** → `.authority_matrix` + `.framework_boundary` (20 min)
3. Study each rule in `.claude/rules/` (30 min)
4. Review Constitution in `.aiox-core/constitution.md` (10 min)

---

## 🔗 Related Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| Constitution | `.aiox-core/constitution.md` | 6 inegotiable principles |
| Agent Authority Rules | `.claude/rules/agent-authority.md` | Exclusive operations |
| Story Lifecycle Rules | `.claude/rules/story-lifecycle.md` | Status transitions |
| Agent Definitions | `.aiox-core/development/agents/*.md` | 12 agent personas |
| Task Definitions | `.aiox-core/development/tasks/*.md` | 150+ tasks |
| Core Config | `.aiox-core/core-config.yaml` | Framework config |
| Project Rules | `.claude/rules/` | 8 contextual rules |

---

## ✅ Audit Quality

| Aspect | Status | Coverage |
|--------|--------|----------|
| Agent definitions | ✅ Complete | 12/12 agents (100%) |
| Exclusive operations | ✅ Complete | 10/10 operations |
| Constitution articles | ✅ Complete | 6/6 articles |
| Rules system | ✅ Complete | 8/8 rules |
| Workflows | ✅ Complete | 4 primary workflows |
| Framework boundary | ✅ Complete | L1-L4 layers |
| Cross-validation | ✅ Complete | Matched against 3+ sources |

---

## 📝 Notes

- All data extracted from **live framework files** (never invented)
- Framework version: **2.1** (compacted 2026-05-28)
- Project: **KAIROS_CEREBRO**
- Generated: **2026-06-03**
- By: **AIOX Map Skill** (Synkra AIOX Framework Cartographer)

---

## 🚀 Next Steps

1. **Choose your output format:**
   - Visual learner? → AIOX_MAP.html
   - Terminal user? → AIOX_MAP_ASCII.txt
   - Automation? → AIOX_MAP.json
   - Deep understanding? → AIOX_DNA.md

2. **Find your role:**
   - Developer → AIOX_MAP_README.md → Learning Paths
   - Manager → AIOX_DNA.md → Mental Models
   - Architect → AIOX_DNA.md → Architectural Principles

3. **Bookmark key sections:**
   - Authority Matrix (for "who can do what?")
   - Story Lifecycle (for "what's the status flow?")
   - Framework Boundary (for "what can I modify?")
   - Compliance Checklist (for "am I following the rules?")

---

*Framework Audit Generated by AIOX Map Skill*  
**For complete framework documentation, see:** `.aiox-core/constitution.md`
