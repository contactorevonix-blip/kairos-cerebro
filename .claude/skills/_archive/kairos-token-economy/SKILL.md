# Kairos Check — Token Economy Skill

Activate on every interaction in kairos-cerebro.
Goal: maximize useful work per token consumed.

## Search before exploration
Before reading any file:
1. Is the answer in CLAUDE.md? Read it.
2. Is the answer in .ai/PROJECT_BRIEFING.md or STRATEGY_LOCK.md? Read.
3. Is it findable with grep -r "pattern" ./? Use grep first.
4. Only THEN view actual files.

## File reading rules
- NEVER cat files >200 lines without view_range
- Always view specific ranges when investigating
- For large JSONL/log files: head/tail/grep, never cat
- Use wc -l first to estimate file size

## Tools by efficiency (prefer in order)
1. grep / ag (content search)
2. ast-grep (structural code search)
3. find (filenames only)
4. tree -L 2 (max depth 2 for structure)
5. wc -l (size estimate)
6. view with range (inspection)
7. cat (last resort, small files only)

## What NOT to do
- tree -L 5+ on whole repo (massive output)
- Read node_modules/, .git/, .aiox-core/ (read-only large)
- npm ls, pip freeze (huge output)
- Dump JSON when 1 field needed (use jq)
- Read full audit logs (grep + tail)
- Read .lock files
- Paste entire file content unless ASKED

## Repetition is waste
- Info in SKILL.md: don't re-derive
- Info in last 10 messages: don't re-state
- Info in CLAUDE.md: reference, don't quote

## Compression patterns
For Pedro:
- Tables > prose for comparing options
- Lists > paragraphs for sequential steps
- Code blocks > prose explanations of code
- Commit messages ≤50 chars subject

## /compact triggers (suggest to Pedro)
Suggest /compact if:
- Session crossed ~250k tokens (estimate)
- Current task done, next task unrelated
- Major context switch
NEVER suggest /clear unless /compact failed.

## Output economy
- One question per response max
- One next action max
- Validate-then-execute, not execute-then-explain
- Stop after the deliverable, no extra ramble

## When generating code
- Comments only for "why", never for "what"
- Don't restate function signatures in surrounding text
- Inline simple variables, name complex ones

## When debugging
- Read error message FIRST
- Read indicated line, not full file
- Don't read whole stack trace if first line is clear
- Don't run "ls" 3x to verify same thing

## Tool call cost awareness
- Each tool call: ~500-2000 tokens roundtrip
- Each file view: 500-50000 tokens
- Each bash output: variable, can be huge
- Aim for high signal-per-call ratio

## Self-audit before responding
"Did each tool call produce information actually used?"
"Could I have answered without reading X?"
"Was response length proportional to question?"
