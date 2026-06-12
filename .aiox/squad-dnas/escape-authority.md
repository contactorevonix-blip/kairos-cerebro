# Authority Matrix — ../escape

> Inherited from `@x` on 2026-06-11.
> Source: t

## Inherited Exclusive Operations

_None — the mentor declares no exclusive operations._

## Blocked Operations

_None._

## Allowed Operations

_None recorded._

## Constraints (No Privilege Escalation — AC3)

- This squad inherits authority from `@x` and MUST NOT exceed it.
- A cloned squad may DROP authority but may never ADD an exclusive operation the mentor lacks.
- Example: a squad cloned from `@devops` inherits the `git push` exclusive, but cannot create global CI/CD rules beyond the mentor scope.
