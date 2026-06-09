# Context Registry Schema

**Version:** 1.0  
**Location:** `.synapse/context-registry.yaml`  
**Format:** YAML (key-value pairs)  
**Purpose:** Persistent storage of session context state for Pattern Reuse detection (Phase 5, IDS-CHECK)

---

## Registry Structure

Each entry is a key-value pair where the key is a session ID and the value is a context state object.

### Example

```yaml
session-2026-06-09-abc123:
  timestamp: "2026-06-09T14:30:00.000Z"
  intent_type: "feature"
  completeness: 0.95
  phase_4_passed: true
  gaps_detected:
    - "schema-context"
    - "workflow-context"
  context_sources:
    registry: ["entity-123"]
    project_md: ["PROJECT.md#section1"]

session-2026-06-10-def456:
  timestamp: "2026-06-10T08:00:00.000Z"
  intent_type: "bug"
  completeness: 1.0
  phase_4_passed: true
  gaps_detected: []
  context_sources: {}
```

---

## Context State Object Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | ISO 8601 string | YES | When context was collected (UTC) |
| `intent_type` | string | YES | One of: `feature`, `bug`, `refactor`, `config`, `framework`, `research` |
| `completeness` | float (0-1) | YES | Gap-filling ratio (Phases 2-3) |
| `phase_4_passed` | boolean | YES | Validation check passed (Phase 4) |
| `gaps_detected` | array[string] | NO | Gap source names (e.g., `schema-context`, `workflow-context`) |
| `context_sources` | object | NO | Map of source type → [entry IDs] (e.g., `registry: ["entity-123"]`) |

---

## Session ID Format

`session-{YYYY-MM-DD}-{hash}` where:
- `YYYY-MM-DD`: Session date
- `hash`: 6-8 character random hash (alphanumeric)

Example: `session-2026-06-09-abc123`

---

## Integration Points

### Phase 5: IDS-CHECK (Read)
```javascript
// Query all sessions of a given intent type
const sessions = registry.query('feature');
// Returns: [ { session_id, timestamp, completeness, ... }, ... ]
```

### Phase 10: PERSISTENCE (Write)
```javascript
// Write session state to registry
registry.write('session-2026-06-09-abc123', {
  timestamp: '2026-06-09T14:30:00.000Z',
  intent_type: 'feature',
  completeness: 0.95,
  phase_4_passed: true,
  gaps_detected: ['schema-context'],
  context_sources: { registry: ['entity-123'] }
});
```

---

## File Safety

- **Write:** Async-safe via atomic operation (write to temp file, then rename to final)
- **Read:** Synchronous (YAML.parse or JSON fallback)
- **Locking:** File-system level (no additional mutex needed for single-process)

---

## Performance Target

- **Query (< 100ms):** For files with 1000+ entries on typical hardware
- **Write (< 50ms):** Atomic append to registry YAML

---

## Validation Rules

On write, enforce:
1. `session_id` is non-empty string
2. `timestamp` is valid ISO 8601 format
3. `intent_type` is one of the allowed values
4. `completeness` is a number between 0 and 1
5. `phase_4_passed` is a boolean
6. `gaps_detected` is an array (can be empty)
7. `context_sources` is an object (can be empty)

If any required field is missing or invalid, reject the write and log an error.

---

## Registry Lifecycle

1. **Create:** On first engine run, `.synapse/context-registry.yaml` is created (empty if not exists)
2. **Write:** On Phase 10 (PERSISTENCE), session state is appended
3. **Read:** On Phase 5 (IDS-CHECK), all entries are loaded and filtered by intent_type
4. **Cleanup:** Manual (user deletes old entries if needed; no auto-expiration)

---

**Last Updated:** 2026-06-10  
**Status:** Active (used by engine.js Phase 5 + Phase 10)
