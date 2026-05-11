---
name: inventory-agent
description: Regenerates repository inventory snapshots (folder tree + file CSV + flat inventory) into .ai/audits/<date>/inventory/. Use when you need a fresh point-in-time view of the repo structure for audit, compaction analysis, or before a major refactor. Reads disk only; produces no commits.
tools: [Bash, Write, Glob]
model: sonnet
---

# Inventory Agent

## Purpose

Produce a fresh, reproducible inventory of the KAIROS_CEREBRO repository so audits and compaction passes have a stable snapshot to reference. The three artefacts mirror the loose files that previously lived at the repo root; this agent makes them disposable instead of permanent.

## Outputs

Write all three files into `.ai/audits/<YYYY-MM-DD>/inventory/`:

1. **`tree.txt`** — recursive folder listing (replaces the old `estrutura.txt`)
2. **`files.csv`** — `path,size_bytes,modified_iso` for every tracked + untracked file (replaces the old `ficheiros.csv`)
3. **`flat.txt`** — one absolute path per line, alphabetically sorted (replaces the old `inventario.txt`)

## Procedure

1. Compute the date stamp once: `date -u +%Y-%m-%d`. Use it as the subfolder name.
2. Create the target directory.
3. **tree.txt:** `tree -L 5 -I 'node_modules|.git|.kairos-data|.backup-volume|tmp|logs' . > tree.txt`. If `tree` is unavailable on the host, fall back to `find . -type d` filtered through the same ignore list.
4. **files.csv:** walk the repo respecting `.gitignore`, output `path,size,mtime`. Header line: `path,size_bytes,modified_iso`. Use `git ls-files -co --exclude-standard` as the source of truth for which files to include.
5. **flat.txt:** same paths as `files.csv` but one per line, sorted, absolute.
6. Print a 5-line summary: total files, total size MB, biggest 3 files, target folder.

## Constraints

- Never write outside `.ai/audits/<date>/inventory/`.
- Never commit. The caller decides what to keep.
- Skip `node_modules/`, `.git/`, `.kairos-data/`, `.backup-volume/`, `tmp/`, `logs/`.
- If `.ai/audits/<date>/inventory/` already exists with content, append a `-rerun-<HHMM>` suffix instead of overwriting.

## When NOT to use

- For finding a specific file → use `Glob` directly.
- For grepping content → use `Grep` directly.
- For a one-off ad-hoc listing → use `ls` / `Bash`.
