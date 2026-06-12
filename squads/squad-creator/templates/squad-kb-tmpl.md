# Knowledge Base — {{squad-id}}

<!-- AIOX-KB-METADATA
{
  "squad_id": "{{squad-id}}",
  "mentor": "{{mentor}}",
  "assembled_at": "{{iso-timestamp}}",
  "generator": "squads/squad-creator/core/kb-assembler.js",
  "sources": {
    "mentor_agent": null,
    "project_kb": null,
    "domain_doc": null
  }
}
-->

> Assembled {{date}} · cloned from `@{{mentor}}`

## Agent Profile

{{agent-profile}}

## Skills

{{skills}}

## Commands

{{commands}}

## Dependencies

{{dependencies}}

## Rules

{{rules}}

## Project Context

{{project-context}}

<!--
Template reference for Story 8.3.6 (Knowledge Base Assembly).

NOTE ON LOCATION: This template was specced in AC1/File List at
`.aiox-core/development/templates/squad-kb-tmpl.md` (L2). That path is blocked by
the framework-boundary deny rule (Art. VI-VII) even for new files. Following the
precedent the @po set for the 8.3.x core modules (relocate blocked L1/L2 artefacts
to L4), it lives here under squads/squad-creator/templates/ (L4) instead. No logic
change — the kb-assembler emits this exact section order (AC4):
  Agent Profile · Skills · Commands · Dependencies · Rules · Project Context
An optional "Domain Documentation" section is appended when
docs/squad-domains/{{squad-id}}.md exists.
-->
