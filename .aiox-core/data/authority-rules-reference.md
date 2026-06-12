# Authority Rules Reference — Squad Creator (Story 8.3.5)

> **Layer:** L3 (project config / data, mutable).
> **Consumed by:** `squads/squad-creator/core/authority-matrix.js`.
> **Authoritative source:** `.claude/rules/agent-authority.md` (delegation matrix).

This file documents how the Authority Matrix extractor classifies a mentor
agent's operations, so cloned squads inherit authority constraints without
privilege escalation (Constitution Article II — Agent Authority).

## Operation Categories

| Category | Meaning | Source signal |
|----------|---------|---------------|
| **EXCLUSIVE** | Only this agent may perform the operation | Matrix cell contains `YES` / `Exclusive` in an "Exclusive?" column, or a global row names the agent as the only owner |
| **BLOCKED** | This agent is explicitly forbidden the operation | Matrix cell contains `BLOCKED` / `NO` / "does NOT own", or appears in a "Blocked" column |
| **ALLOWED** | This agent may perform the operation (non-exclusive) | "Allowed" column, or local-scope operations (e.g. local git) |

## Extraction Strategy

1. **Section-scoped tables** — the markdown heading naming `@{agent}` owns the
   first table beneath it. Two-column "Allowed | Blocked" tables (e.g. `@dev`)
   are bucketed by column header; "Operation | Exclusive?" tables (e.g.
   `@devops`, `@po`, `@sm`) are bucketed by classifying the verdict cell.
2. **Global exclusive rows** — any row that names the agent token and the words
   "exclusive"/"only" adds the operation to EXCLUSIVE.
3. **Agent YAML supplement** — `persona.exclusive_authority` (note/rationale)
   is captured as a free-text mentor note. It is never parsed into operations
   (no invention).

## Token Matching (No `@dev` ⊂ `@devops` collision)

Matching uses a whole-token test: `@dev` must NOT be immediately followed by a
word character, so it never matches `@devops`. This prevents @devops's
exclusive operations (git push, PR create/merge, MCP, CI/CD, release) from
being mis-attributed to @dev.

## No Privilege Escalation (AC3)

A cloned squad's authority MUST be a subset of its mentor's:

- A clone MAY drop authority (declare fewer operations than the mentor).
- A clone MUST NOT add an EXCLUSIVE operation the mentor does not hold.
- A clone MUST NOT add an ALLOWED operation the mentor neither allows nor holds
  exclusively.

`validateNoEscalation(mentorMatrix, cloneMatrix)` returns the list of
escalations; an empty list means the clone is within bounds.

### Example (AC5)

A squad cloned from `@devops` inherits the `git push` EXCLUSIVE and the
`gh pr create`/`gh pr merge` EXCLUSIVE, but it **cannot** add a new global
CI/CD-rule-authoring authority that the mentor scope does not grant — that
would be flagged as an escalation.

## Known Limitation

The dependency-free agent-YAML parser collapses the `persona.exclusive_authority`
list-of-maps into its first map. The authoritative operation list therefore
comes from `.claude/rules/agent-authority.md`, not the YAML. If that rule file
is unavailable, the extractor degrades to the YAML note signal only and records
`source` accordingly.
