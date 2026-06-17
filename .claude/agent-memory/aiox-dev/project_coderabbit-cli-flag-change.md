---
name: coderabbit-cli-flag-change
description: CodeRabbit CLI dropped --prompt-only; self-healing must use `review --agent -t uncommitted`
metadata:
  type: project
---

The CodeRabbit CLI in this environment (WSL `~/.local/bin/coderabbit`) no longer
accepts `--prompt-only`. The dev self-healing loop documented in
`dev-develop-story.md` and `coderabbit-integration.md` still uses the old flag,
which now fails with: `error: unknown option '--prompt-only'`.

Current working invocation (Windows → WSL):
`wsl bash -c 'cd /mnt/c/Users/lealp/KAIROS_CEREBRO && ~/.local/bin/coderabbit review --agent -t uncommitted'`
Add `--dir <subpath>` to scope the review to a story's changed area.
Findings stream as JSONL; each has `severity` (trivial/minor/major/...) and `fileName`.

**Why:** Observed first-hand during Story 11.1 (EPIC-11) on 2026-06-14 — the
documented `--prompt-only -t uncommitted` call errored, `review --agent` worked.
**How to apply:** Use `review --agent` for any @dev/@qa CodeRabbit self-healing
run until the framework tasks ([[project_phase4_stories_117_118_119]] siblings)
are updated. Verify the flag still exists via `coderabbit review --help` if it
fails again. The skill `.claude/skills/coderabbit-review` also references the old
flag and may need the same fix upstream via @aiox-master.
