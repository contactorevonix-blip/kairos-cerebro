---
name: coderabbit-gatelog-false-positives
description: CodeRabbit flags .aiox/gate-logs & .aiox/task-logs runtime artifacts as source; the resulting CRITICAL/major findings are out-of-scope for @dev stories
metadata:
  type: project
---

CodeRabbit (`review --agent -t uncommitted`) reviews `.aiox/gate-logs/*.jsonl` and
`.aiox/task-logs/*.json` as if they were source code, even though they are gitignored
runtime artifacts. This produces recurring findings that are NOT @dev story scope:

- A **CRITICAL** on `art-iv-no-invention-*.jsonl` flagging the placeholder line
  "It MUST do magic." — that string is logged by some other story's spec/test activity,
  not authored code.
- A **major** on `art-v-vii-quality-boundary-*.jsonl` complaining `frameworkProtection`
  is false (see [[project_framework-boundary-toggle-noop]] in aiox-qa memory) — also a log line.
- **minor** findings on `task-logs/12.*.json` about duplicate task names
  (brownfield-create-story vs create-brownfield-story).

**Why:** these files live under `.aiox/` (runtime, gitignored) but appear in
`-t uncommitted` because the working tree has them modified/untracked.

**How to apply:** when reviewing CodeRabbit output for a Story, classify findings by
whether the file is in the story's File List. Findings on `.aiox/gate-logs/` and
`.aiox/task-logs/` are runtime noise — document as out-of-scope, never fix them inside
a feature/validation story (would violate "no files outside story scope"). Only act on
findings against files you actually authored. Observed during Story 12.2 (Art. II
agent-authority validation).
