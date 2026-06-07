# Agent Memory Lifecycle — Mermaid Diagram

```mermaid
graph TD
    A["📋 Phase 1: Discovery<br/>Query agent registry<br/>Check for missing MEMORY.md"]
    B["📝 Phase 2: Creation<br/>Create MEMORY.md file<br/>Setup frontmatter"]
    C["📚 Phase 3: Population<br/>Extract from personality<br/>Extract from skills<br/>Populate sections"]
    D["🔄 Phase 4: Synchronization<br/>Detect changes<br/>Merge updates<br/>Resolve conflicts"]
    E["✅ Phase 5: Validation<br/>Check frontmatter<br/>Validate entries<br/>Check token budget"]
    
    A -->|Agent missing MEMORY.md| B
    B -->|File created| C
    C -->|MEMORY.md populated| D
    D -->|Sync complete| E
    E -->|Validation pass| F["✨ Active Memory<br/>Ready for agent use"]
    E -->|Validation fail| G["⚠️ Fix Errors<br/>Back to Phase 2/3"]
    
    D -.->|Conflict detected| H["🔒 Conflict Resolution<br/>Lock memory<br/>Request manual review"]
    H -->|Resolved| D
    
    F -.->|Weekly sync| D
    
    style A fill:#e1f5ff
    style B fill:#e8f5e9
    style C fill:#fff3e0
    style D fill:#f3e5f5
    style E fill:#fce4ec
    style F fill:#c8e6c9
    style G fill:#ffcdd2
    style H fill:#fff9c4
```

---

## Detailed Flow

```mermaid
flowchart LR
    subgraph Discovery["Phase 1: Discovery"]
        D1["Enumerate agents<br/>from registry"]
        D2["Check MEMORY.md<br/>existence"]
        D3["Classify as<br/>has/needs memory"]
    end
    
    subgraph Creation["Phase 2: Creation"]
        C1["Create directory<br/>.claude/agents/{id}/"]
        C2["Create MEMORY.md<br/>with frontmatter"]
        C3["Set version & date"]
    end
    
    subgraph Population["Phase 3: Population"]
        P1["Read agent<br/>personality"]
        P2["Extract from<br/>skill files"]
        P3["Read CLAUDE.md<br/>if exists"]
        P4["Classify to memory<br/>types"]
        P5["Populate sections<br/>in MEMORY.md"]
    end
    
    subgraph Sync["Phase 4: Synchronization"]
        S1["Detect changes<br/>in sources"]
        S2["Check for<br/>conflicts"]
        S3["Merge updates<br/>by timestamp"]
        S4["Log all changes<br/>in audit trail"]
    end
    
    subgraph Validation["Phase 5: Validation"]
        V1["✓ Frontmatter valid"]
        V2["✓ Entries present"]
        V3["✓ Token budget OK"]
        V4["✓ No duplicates"]
    end
    
    D1 --> D2 --> D3
    D3 -->|needs memory| C1
    C1 --> C2 --> C3
    C3 --> P1
    P1 --> P2 --> P3 --> P4 --> P5
    P5 --> S1
    S1 --> S2 --> S3 --> S4
    S4 --> V1 --> V2 --> V3 --> V4
    V4 -->|Pass| Success["✨ Agent memory active"]
    V4 -->|Fail| Retry["⚠️ Fix issues"]
    
    style Discovery fill:#e1f5ff,stroke:#01579b
    style Creation fill:#e8f5e9,stroke:#1b5e20
    style Population fill:#fff3e0,stroke:#e65100
    style Sync fill:#f3e5f5,stroke:#4a148c
    style Validation fill:#fce4ec,stroke:#880e4f
    style Success fill:#c8e6c9,stroke:#2e7d32
    style Retry fill:#ffcdd2,stroke:#b71c1c
```

---

## State Machine

```mermaid
stateDiagram-v2
    [*] --> Discovery
    
    Discovery --> Creation: Agent needs memory
    Discovery --> Active: Memory exists
    
    Creation --> Population: File created
    Population --> Sync: Populated
    Sync --> Validation: Synced
    
    Validation --> Active: ✅ Pass
    Validation --> FixErrors: ❌ Fail
    
    FixErrors --> Population: Issues fixed
    
    Active --> Sync: Weekly sync trigger
    
    Sync --> ConflictCheck{Conflicts?}
    ConflictCheck --> Manual: Yes
    ConflictCheck --> Validation: No
    
    Manual --> Resolved{Resolved?}
    Resolved --> Sync: Yes
    Resolved --> Manual: No (waiting)
    
    Active --> [*]
```

---

## Timeline Example (4 Agents)

```mermaid
gantt
    title Agent Memory Lifecycle — Discovery & Creation (4 agents)
    
    section Discovery
    Enumerate agents :d1, 0, 1m
    Check missing :d2, after d1, 2m
    
    section sm Memory
    Create MEMORY.md :sm1, after d2, 1m
    Populate :sm2, after sm1, 3m
    Validate :sm3, after sm2, 1m
    
    section dev Memory
    Create MEMORY.md :dev1, after d2, 1m
    Populate :dev2, after dev1, 3m
    Validate :dev3, after dev2, 1m
    
    section qa Memory
    Create MEMORY.md :qa1, after d2, 1m
    Populate :qa2, after qa1, 3m
    Validate :qa3, after qa2, 1m
    
    section config-engineer Memory
    Create MEMORY.md :cfg1, after d2, 1m
    Populate :cfg2, after cfg1, 3m
    Validate :cfg3, after cfg2, 1m
    
    section Sync
    Full sync :sync, after sm3, 2m
```

---

## AC Coverage Map

| AC | Diagram Section | Details |
|----|-----------------|---------|
| **AC1:** Structure | State Machine, Timeline | Phases 1-2 show structure creation |
| **AC2:** Discovery | Discovery Flow, Timeline | Discovery Phase (1) fully detailed |
| **AC3:** Population Workflow | Population Flow, Timeline | Phase 3 shows extraction + population |
| **AC4:** Sync Rules | State Machine, Sync Flow | Phase 4 shows sync + conflict handling |

---

**All diagrams render in standard Mermaid format — embed in docs/diagrams/ or wiki**
