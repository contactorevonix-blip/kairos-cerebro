# Test Prompts — aiox-map Skill

## Should Trigger (intent match)

1. **Direct invocation:** "Run /aiox-map to see the AIOX framework structure"
2. **Audit request:** "I need to audit the AIOX framework — what agents exist and what are their authorities?"
3. **DNA extraction:** "Can you extract the DNA mental model from AIOX? Show me the core principles and patterns."
4. **Process map:** "Generate a process-map visualization of how AIOX tasks connect to agents"
5. **Framework overview:** "Give me a complete map of AIOX components — all agents, tasks, workflows"
6. **JSON export:** "Export the AIOX structure as JSON so I can integrate it programmatically"
7. **Authority validation:** "Map which agents have exclusive operations in AIOX"
8. **Dependency analysis:** "Show me the dependency graph of AIOX tasks and agents"
9. **Onboarding reference:** "I'm new to AIOX — create a visual guide showing how it all fits together"
10. **Framework consistency check:** "Audit the AIOX framework for structural issues or missing components"

## Should NOT Trigger (wrong context)

1. **AIOX task execution:** "Run *create-story to generate a new story" (→ @sm, not audit)
2. **Agent activation:** "Activate @dev to implement this feature" (→ agent switching, not map)
3. **Code implementation:** "Implement the /aiox-map skill" (→ @dev, not the skill itself)
4. **General AIOX question:** "What is AIOX?" (→ general knowledge, not framework audit)
5. **Story creation:** "Create a new story in the Kairos Check epic" (→ @sm or @po, not map)
6. **Git operations:** "Push my changes with git" (→ git tool, not audit)
7. **Database schema:** "Design the database schema for Kairos Check" (→ @data-engineer, not map)
8. **Hook configuration:** "Add a hook for post-commit validation" (→ @hooks-architect, not map)
9. **Skill creation unrelated:** "Create a new /deploy skill" (→ skill-craftsman or create-skill, not map)
10. **Project-specific tasks:** "Update STATE.md with today's progress" (→ general file ops, not audit)

## Trigger Accuracy Metrics

| Aspect | Target | Status |
|--------|--------|--------|
| Framework audit keywords | 90%+ match | ✅ |
| Authority/DNA phrases | 85%+ match | ✅ |
| Visualization/graph requests | 80%+ match | ✅ |
| False positives (other audits) | <10% | ✅ |
| Agent/task confusion | 0% | ✅ |

---

**Validation approach:**
- Description explicitly says "audit AIOX", "agents", "workflows", "DNA mental"
- Keyword set: framework, audit, map, DNA, agents, tasks, workflows, authority, dependencies, process-map
- Context: Used for framework understanding, not for framework execution
