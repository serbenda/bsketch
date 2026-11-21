# P27 — The `.sketch` format frozen, and 2.0.0

- **Stage:** S8
- **Status:** ⏳ in progress (the agent's part done; the `v2.0.0` release waits for the rest of S8)
- **Issue:** —
- **Dates:** 2026-11-21 → —
- **Owner approvals:** 2026-11-20 the road to 2.0; 2026-11-21 "Sí, empieza S8"

## Goal
A promise people can rely on: what they save today opens tomorrow. Format version 1 is written down, every file a
release saved is tested, and the rules for changing it later are fixed.

## Scope
**In:**
- `docs/FORMAT.md`: the file, every element field, how a file is read, and the compatibility promise.
- `tests/fixtures/format/sketch-<version>.sketch`: one rich drawing opened and saved by the engine of each release
  (1.0.0's version commit, `v1.1.0` to `v1.5.0`), made by `scripts/make-format-fixtures.mjs` from temporary worktrees.
- `tests/format.test.mjs`: each one opens with every element and field (except what is laid out again on opening),
  saves and opens again the same, and every field the format holds is documented.
- `SUPPORT.md`: which versions get fixes, what happens to drawings, where to report problems.
- [ADR 0007](../decisions/0007-format-version-1-frozen.md).

**Out:**
- The `v2.0.0` release (the owner, when P24–P26 and P19 are done).
- Files from before 1.0.0 (they had no release; the e2e test "a drawing saved by an older version is kept" covers
  the browser's oldest stored form).

## Acceptance criteria
- [x] A file saved by each release since 1.0.0 is in the tests and opens with nothing lost.
- [x] Dropping a field the format holds makes the tests fail (checked by removing `rounded` from the reader).
- [x] `docs/FORMAT.md` documents every field; a test checks it.
- [x] `npm test` passes.
- [ ] The `v2.0.0` release (owner).

## Security impact
- None: tests, documentation and a script that runs only on the owner's machine (git worktrees of release commits).

---

## Result
- **What was done:** the agent's part, as in *In*.
- **How it was tested:** `npm test` 77 pass; with `rounded` no longer read, four fixtures fail (1.2.0 onwards).
- **What was left out and why:** as in *Out*.
- **Lessons learned:** a fixture must be made by the old engine itself (its own parse and save), not written by
  hand: 1.0.0, for instance, dropped frames and pictures it did not know.
- **PR:** see the development → main PR.
