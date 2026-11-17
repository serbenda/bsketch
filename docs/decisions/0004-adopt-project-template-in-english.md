# 0004 — Adopt project-template 1.0.0 in full mode, with everything in English

- **Status:** accepted
- **Date:** 2026-11-17

## Context
sketch was created from an older, Spanish version of [project-template](https://github.com/serbenda/project-template).
The template's 1.0.0 brings a stronger guard hook, git hooks, more CI jobs (SAST, dependencies, records), a
documented way of working (vision, state, worklog, phases, decisions) and a rule that the whole repository is in
English. The owner asked for sketch to adapt to the template and for everything to be in English.

## Options
| Option | Pros | Cons |
|---|---|---|
| A. Adopt 1.0.0 fully, everything in English (UI included) | One set of rules across projects; the template's English-only files fit | A one-off translation; the agent can no longer change `.github/`, `.claude/`, hooks or its own instructions |
| B. Only the template-owned files (hooks, guard, agents) | Smaller change | Two ways of working side by side; records and docs missing |
| C. Keep Spanish, deviating from the template | No translation | The records check, commands, agents and PR template are English and are replaced on every sync |

## Challenge
Two independent challengers reviewed the plan (lenses: "living with it in two years" and "what breaks, and
security"). Main objections and how they were handled:
- *The agent can't touch `.github/` any more, so every CI tweak needs the owner* (High): accepted as the price of
  the guardrails; the agent writes the exact change and the owner applies it.
- *Spanish doesn't fit the template* (High): resolved by the owner's choice of English for everything.
- *A deployed project in light mode contradicts the template* (Medium): sketch goes to full mode, with a threat model.
- *The transition order could leave the agent blocked or two hooks side by side* (Medium): one atomic owner commit
  for all guardrails, rehearsed on a copy first.
- *Untested new controls could break the tests or the e2e in the sandbox* (High): rehearsed on a copy with the
  template's hook and git-hook suites, the unit tests and the e2e; SAST and OSV run for the first time in CI.

## Decision
Option A, in full mode.

## Consequences
- The interface, code, comments, tests, docs and commit messages are in English; files were renamed
  (`scene.js`, `stroke.js`, `render.js`, `styles.css`). The browser storage key moved to `sketch.current`, with a
  one-time migration from `sketch.actual`.
- Guardrail files are committed only by the owner, with `GUARDRAILS_OWNER_CHANGE=1`.
- Every PR that changes more than documentation needs a `docs/WORKLOG.md` entry.
- Snowlog copies the engine with `scripts/update-sketch.mjs`, which needs the new file names when Snowlog is
  migrated in turn.
