# Constitution Sync Guard — Protection Procedure

**Document:** Constitution Protection Mechanism  
**Effective:** 2026-06-24 | **Article:** VII (Framework Amendment)  
**Severity:** MUST (non-negotiable protection)

---

## Purpose

Prevent `.aiox-core/constitution.md` from accidental overwrite during auto-syncs with the official AIOX repository. The Constitution contains local amendments (Article VII) that must be preserved.

---

## When Protection Applies

**Protection activates when:**
- Developer runs `aiox sync` command
- CI/CD auto-sync workflow executes (future feature)
- Team sync operations trigger

**Exclusion list is defined in:**
```yaml
.aiox-core/core-config.yaml:
  sync:
    excludePaths:
      - .aiox-core/constitution.md
      - .aiox-core/data/entity-registry.yaml
```

---

## Protected Assets

| File | Why Protected | Responsibility |
|------|---------------|-----------------|
| `.aiox-core/constitution.md` | v1.1.0 contains Article VII (local amendment, 2026-06-09) | Framework steward (AIOX maintainer) |
| `.aiox-core/data/entity-registry.yaml` | Domain-specific to KAIROS_CEREBRO; upstream has different registry | Project maintainer |

---

## How to Modify Protected Constitution

### Scenario: Need to Update Constitution Locally

1. **Create amendment**
   - Edit `.aiox-core/constitution.md` directly
   - Document change in file header (Article + date)
   - Add to Change Log: `| YYYY-MM-DD | agent | Change description |`

2. **Peer review required**
   - Sync guard prevents accidental overwrites
   - Manual amendments require @architect review
   - Create PR with amendment rationale

3. **After merge**
   - Constitution file is now at new version
   - Sync guard continues protecting the updated version
   - Upstream merges are always manual (never force-synced)

### Example Amendment

```markdown
<!-- Local Amendment: Article VII added 2026-06-09 by @architect -->
<!-- Future syncs: preserve Article VII when merging official updates -->

## Article VII — Framework Sovereignty (LOCAL AMENDMENT)

This article was added locally to KAIROS_CEREBRO...
```

---

## Override Procedure (Official Merge Required)

If official AIOX Constitution must be merged with local version:

1. **Disable protection temporarily** (requires @devops)
   ```bash
   # Edit .aiox-core/core-config.yaml
   sync:
     excludePaths: []  # Temporarily empty
   ```

2. **Run manual merge**
   ```bash
   aiox sync --resolve-conflicts manual
   ```

3. **Re-apply local amendments**
   - Add Article VII back to merged constitution
   - Document merge point in Change Log

4. **Re-enable protection**
   ```bash
   sync:
     excludePaths:
       - .aiox-core/constitution.md
       - .aiox-core/data/entity-registry.yaml
   ```

5. **Create PR**
   - Title: `fix: restore local constitutional amendments post-sync [Story 1.21]`
   - Link to original amendment history

---

## Testing

Sync guard is tested via:

1. **Unit test** — exclusion list respected by sync logic
2. **Integration test** — run sync, verify constitution unchanged
3. **Edge case** — constitution modified locally + sync attempted → no regression

Tests: `tests/sync/exclude-logic.test.js`

---

## Related

- **Constitution:** `.aiox-core/constitution.md` (v1.1.0, triple-signed)
- **Story:** 1.21 — Constitution Sync Guard (framework protection)
- **Config:** `.aiox-core/core-config.yaml` (sync section)
- **Article VII:** Local amendment protecting KAIROS_CEREBRO sovereignty

---

## FAQ

**Q: Can I modify constitution.md without going through sync guard?**  
A: Yes — sync guard only affects sync operations. Direct edits are always possible (but require peer review via PR).

**Q: What if official AIOX releases a critical constitution update?**  
A: Use the override procedure above. It's manual and documented to ensure intentional merges.

**Q: Does sync guard affect other files?**  
A: No — only files in `excludePaths` are protected. Other L1/L2 files sync normally.

---

**Created by:** Story 1.21 | **Date:** 2026-06-24
