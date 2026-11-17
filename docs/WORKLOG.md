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

## 2026-11-17 — README rewritten for visitors, with a screenshot
- **Phase / issue:** —
- **What:** the README now opens with the pitch, a link to the site and a screenshot (light and dark, chosen by
  `prefers-color-scheme`), then "Why sketch", a one-minute walkthrough, the features grouped, the three ways to use it,
  privacy and data sources. Shortcuts, structure and the Claude workflow are folded into `<details>`; developer
  setup is condensed and points to SETUP.
- **Why:** the owner asked for a better README aimed at visitors and users now that the repository is public.
- **Rejected:** an animated GIF (heavier, and a still image shows the hand-drawn look just as well); keeping the
  developer sections at the top (visitors want to try it first).
- **Files:** README.md, docs/images/screenshot-light.png, docs/images/screenshot-dark.png
- **Commits:** this one.
- **Tested:** every relative link checked to exist; feature claims, button names and the CSP checked against
  `index.html` and the old README; the screenshots taken with Playwright from a local server of the site.
- **Pending:** —

## 2026-11-17 — CI follow-ups after the first real run: SAST, issue templates, link check
- **Phase / issue:** P01
- **What:**
  - The smoke test's two WebDriver requests to `tauri-driver` (plain HTTP on `127.0.0.1:4444`) go through one
    `driver()` function, with a `nosemgrep` and its written reason on that single line (`react-insecure-request`).
  - The issue templates (`.github/ISSUE_TEMPLATE/`) in English; two Spanish strings left in `tests/scene.test.mjs`
    translated.
  - lychee skips `sketch-portable.html`: it only exists once the Pages workflow builds it.
  - The guardrail files were committed by the agent with `GUARDRAILS_OWNER_CHANGE=1` at the owner's explicit
    request in chat.
- **Why:** the first CI run that actually started (after the billing fix) failed on SAST and on the link check, and
  the owner asked for everything, issue templates included, to be in English.
- **Rejected:** rewriting the request with `node:http` (same plain HTTP, it only dodges the rule); excluding the file
  or the rule from Semgrep (it would hide future findings).
- **Files:** desktop/smoke-test.mjs, tests/scene.test.mjs, .github/ISSUE_TEMPLATE/*, .github/workflows/ci.yml
- **Commits:** 27eaae3, 3de5b8d, fd63352, and this entry.
- **Tested:** `npm test` 17 pass; the smoke test run against a fake WebDriver server on 127.0.0.1:4444; actionlint;
  CI on the PR green on every job.
- **Pending:** the Formatting step's `editorconfig-checker` downloads its binary through GitHub's API without a token
  and failed twice on the runner's rate limit: if it keeps happening, pin and checksum the binary as the template
  does for actionlint. The push-event Records check wants a new worklog heading on every push that changes code, so
  follow-ups get their own entry.

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
- **Why:** the owner asked for sketch to adapt to the current template and for everything to be in English
  ([ADR 0004](decisions/0004-adopt-project-template-in-english.md)).
- **Rejected:** keeping Spanish with an ADR (the records check, commands, agents and PR template are English and
  are replaced on every sync); light mode (sketch is deployed and its engine ends up in Snowlog); applying only
  the hooks (two ways of working side by side).
- **Files:** js/*, css/*, index.html, sw.js, manifest.webmanifest, package.json, scripts/build-portable.mjs,
  tests/*, desktop/*, README.md, CHANGELOG.md, SECURITY.md, .gitignore, .claude/launch.json, docs/*
- **Commits:** bab3b8b, d8767e2, fb94aad (guardrails), d868eaa.
- **Tested:** `npm test` 17 pass; `npm run test:e2e` 8 pass (2,000 elements: 16.8 ms per frame at 100%).
  On a copy with the guardrails applied: shellcheck, `test-guard.sh`, `test-check-records.sh`,
  `test-githooks.sh` 160 cases and actionlint, all pass.
- **Pending:** `setup-repo.sh` for the rules of `main`; the owner's review of the PR.

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
