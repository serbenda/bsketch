# 0007 — The `.sketch` format version 1 is frozen

- **Status:** accepted
- **Date:** 2026-11-21

## Context
2.0.0 means "final" (ROADMAP, S8): people must be able to trust that their drawings keep opening. Until now the
format grew with each release (frames, pictures, notes, routes…) with no written rule, although every change was
an optional field.

## Options
| Option | Pros | Cons |
|---|---|---|
| A. Freeze version 1: only optional fields may be added; anything else is version 2, and version 1 is always read | Matches how it already grew; old files keep working; nothing to migrate | Some future ideas will need a default that means "as before" |
| B. Start a version 2 for 2.0.0 with a cleaner layout | A tidier file | Migration code and risk, for no gain to users |
| C. No promise | Freedom | Not "final" |

## Challenge
Could an older version silently lose data when opening a newer file? Yes: it ignores what it doesn't know. That is
written in the promise (rule 4) instead of hidden; refusing such files would be worse for people with two devices.

## Decision
Option A, written down in [docs/FORMAT.md](../FORMAT.md) and enforced by tests with a file saved by each release.

## Consequences
- Every release adds a fixture (`node scripts/make-format-fixtures.mjs`); a release that can't open one doesn't ship.
- A field can't be renamed or removed, nor change meaning; a new field's absence must mean today's behaviour.
