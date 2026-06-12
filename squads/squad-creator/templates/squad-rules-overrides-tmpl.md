# Squad Rule Overrides — {{squad-id}}

> Generated {{date}}.
> Inherits the framework Constitution (Articles I–VII) and `.claude/rules/`.

## Inherited Rules

{{inherited-rules}}

## Documented Overrides

| Rule | Article | Change | Rationale |
|------|---------|--------|-----------|
{{overrides-table}}

## Constitutional Constraint (AC3)

Overrides may only relax SHOULD-level rules. NON-NEGOTIABLE and MUST articles
(I CLI First, II Agent Authority, III Story-Driven, IV No Invention,
V Quality First, VII Framework Boundary) cannot be overridden by a squad.

**Example permitted override (AC5):** a UI-focused squad may override
`absolute-imports.md` (Art. VI, SHOULD) to allow relative CSS-module imports.

<!--
Template reference for Story 8.3.7 (Rules System for Squad).

NOTE ON LOCATION: This template was specced in AC1/File List at
`.aiox-core/development/templates/squad-rules-overrides-tmpl.md` (L2). That path
is blocked by the framework-boundary deny rule (Art. VI-VII) even for new files.
Following the precedent the @po set for the 8.3.x core modules (relocate blocked
L1/L2 artefacts to L4), it lives here under squads/squad-creator/templates/ (L4).
No logic change — rules-inheritor.renderOverridesDoc() emits this exact shape.
-->
