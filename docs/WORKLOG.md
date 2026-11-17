# Worklog

> The **context** of each change: what, why, what was rejected, commits, how it was tested and what is pending.
> Maintained by the agent with the `record-changes` skill. New entries **on top**.
> In full mode, user-visible changes go once per phase in [CHANGELOG.md](../CHANGELOG.md); the current status is in [STATE.md](STATE.md).

<!--
## YYYY-MM-DD — Short title of the change
- **Phase / issue:** P03 · #12 (or "—")
- **What:**
- **Why:**
- **Rejected:**
- **Files:**
- **Commits:**
- **Tested:**
- **Pending:**
-->

## 2026-11-17 — Adopt project-template 1.0.0; everything in English
- **Phase / issue:** P01
- **What:**
  - The interface, code, comments, tests, docs and the desktop app translated to English. Files renamed:
    `js/scene.js` (was `escena.js`), `js/stroke.js` (`trazo.js`), `js/render.js` (`pintar.js`),
    `css/styles.css` (`estilos.css`), `tests/scene.test.mjs`, `desktop/smoke-test.mjs`. HTML ids and CSS classes
    in English. The font family is now "Sketch Hand".
  - The browser storage key is `sketch.current`; a drawing kept under the old `sketch.actual` is read and moved
    the first time (new e2e test).
  - The template's docs filled in: VISION, STATE, ROADMAP (S0–S2 done, S3 in progress), ARCHITECTURE,
    THREAT_MODEL, RISKS, SETUP, DEFINITION_OF_DONE (web block only), ADRs 0002–0004 and phase P01.
  - README and CHANGELOG rewritten in English; SECURITY.md from the template; CONTRIBUTING.md, the old
    `docs/SEGURIDAD.md` and `docs/claude-settings-global.json` removed; `.gitignore` from the template plus the
    desktop build output (the separate `desktop/.gitignore` is gone).
  - The guardrail files (template sync, merged settings, CI, Dependabot, `AGENTS.md`, `CLAUDE.md`, OWNER,
    CODEOWNERS, dev container, workflows in English) prepared as one patch and rehearsed on a copy. The owner
    asked the agent in chat to apply and commit it (`GUARDRAILS_OWNER_CHANGE=1`, commit `fb94aad`), so the
    owner's review of those files happens on the `development → main` PR.
  - The smoke test's two WebDriver requests to `tauri-driver` (plain HTTP on `127.0.0.1:4444`) go through one
    `driver()` function, so SAST has a single line to report (`react-insecure-request`, the same finding as in
    Snowlog); the `nosemgrep` with its reason is the owner's to commit. Two Spanish strings left in
    `tests/scene.test.mjs` translated.
  - The owner asked the agent to commit the guardrail follow-ups (`GUARDRAILS_OWNER_CHANGE=1`): the smoke test's
    `nosemgrep` with its reason, the issue templates in English, and lychee told to skip `sketch-portable.html`
    (it only exists once the Pages workflow builds it, so the offline link check reported it missing).
- **Why:** the owner asked for sketch to adapt to the current template and for everything to be in English
  ([ADR 0004](decisions/0004-adopt-project-template-in-english.md)).
- **Rejected:** keeping Spanish with an ADR (the records check, commands, agents and PR template are English and
  are replaced on every sync); light mode (sketch is deployed and its engine ends up in Snowlog); applying only
  the hooks (two ways of working side by side).
- **Files:** js/*, css/*, index.html, sw.js, manifest.webmanifest, package.json, scripts/build-portable.mjs,
  tests/*, desktop/*, README.md, CHANGELOG.md, SECURITY.md, .gitignore, .claude/launch.json, docs/*
- **Commits:** bab3b8b, d8767e2, fb94aad (guardrails), d868eaa, the smoke-test fix, and this record's updates.
- **Tested:** `npm test` 17 pass; `npm run test:e2e` 8 pass (2,000 elements: 16.8 ms per frame at 100%).
  On a copy with the guardrails applied: shellcheck, `test-guard.sh`, `test-check-records.sh`,
  `test-githooks.sh` 160 cases and actionlint, all pass.
- **Pending:** `setup-repo.sh` for the rules of `main`; the owner's review of the PR. The Formatting step's
  `editorconfig-checker` downloads its binary through GitHub's API without a token and can hit the runner's rate
  limit (it failed twice that way): if it keeps happening, pin and checksum the binary as the template does for
  actionlint.

## 2026-11-13 — Recorded afterwards: the work before the template (S0–S2)
- **Phase / issue:** — (PRs #2 to #5)
- **What:** the whiteboard and its editor, text inside shapes, attached arrows, rotation, groups, alignment,
  keyboard use, offline use, the portable file and the Tauri desktop builds. Details in the CHANGELOG.
- **Why:** to keep the worklog's history continuous from the day the project adopted the template.
- **Rejected:** writing phase files after the fact (they would be invented history).
- **Files:** see the PRs.
- **Commits:** see the PRs.
- **Tested:** unit tests and Chrome walkthroughs in CI on every PR; desktop builds with a WebDriver smoke test on Linux.
- **Pending:** —
