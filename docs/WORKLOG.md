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

## 2026-11-17 — Close P01
- **Phase / issue:** P01 · PR #5
- **What:** P01 closed: its last criterion (CI green on the PR) checked on PR #5's head, where every job passed;
  *Result* filled in, ✅ in ROADMAP and the phases index, STATE brought up to date (P03 next, the billing block
  gone), R-004 mitigated (Snowlog's update script now uses the new file names), the logo line in CHANGELOG.
  `main` merged into `development` first (only PR #5's merge commit was missing).
- **Why:** the owner asked for the next PR; P01's work was already merged in PR #5 but the phase was still open.
- **Rejected:** leaving P01 open until the next PR (its work is on `main` already).
- **Files:** docs/phases/P01-adopt-project-template.md, docs/phases/README.md, docs/ROADMAP.md, docs/STATE.md,
  docs/RISKS.md, CHANGELOG.md
- **Commits:** bab3b8b, d8767e2, fb94aad, d868eaa, 27eaae3, 3de5b8d, fd63352, d45f5b9 (P01); this close.
- **Tested:** the *Verify* commands: shellcheck, `test-guard.sh`, `test-check-records.sh`, `test-githooks.sh`,
  `npm test` 17 pass, `npm run test:e2e` 8 pass; the DoD reviewer's verdict for sections 1–5: OK.
- **Pending:** —

## 2026-11-17 — Plan P03: the options menu
- **Phase / issue:** P03
- **What:** the plan for an options menu (appearance light/dark/system, canvas background swatches, a transparent
  export toggle next to PNG/SVG), with P04 for the grid; ROADMAP lists both.
- **Why:** the owner wants the canvas white without changing the system theme, and options inside the app.
- **Rejected:** grid in the same phase, a free colour picker, a remembered hidden transparent export, Alt to skip the
  snap (from the challenge on the plan).
- **Files:** docs/phases/P03-options-menu.md, docs/ROADMAP.md
- **Commits:** 63962d2.
- **Tested:** n/a (plan only, no code).
- **Pending:** the owner's approval of the plan.

## 2026-11-17 — README banner; the logo on night blue
- **Phase / issue:** —
- **What:** a banner at the top of the README (`docs/images/banner.png`, 1280×400): the logo, "sketch" in the
  app's handwriting font, the tagline and a small hand-drawn diagram (a hachured box, an arrow, a circle). The logo's
  background changes from near-black to night blue (`#1d2b53`), and the banner uses the same colour; the desktop
  icon and the README screenshots are rendered again.
- **Why:** the owner asked for a nice banner and for another background colour, and chose night blue among six.
- **Rejected:** the other five backgrounds (near-black, slate green, plum, terracotta, bright blue); a pencil doodle
  in the banner (read as an odd shape at that size).
- **Files:** README.md, icon.svg, desktop/icon.png, docs/images/*
- **Commits:** 3318bee.
- **Tested:** banner and logo checked by eye at full size; the header in both themes in the screenshots.
- **Pending:** the banner can also be the repository's social preview (Settings → General → Social preview, the
  owner's setting; GitHub suggests 1280×640).

## 2026-11-17 — New logo: a hand-drawn "s"
- **Phase / issue:** —
- **What:** a new `icon.svg`: one cream marker stroke shaped as an "s" on a near-black rounded square, with an orange
  dot where the pen starts and two faint echo lines, the double stroke of a sketch. The same drawing is the favicon,
  the installed app's icon, the header logo, the portable file's icon (built from `icon.svg`) and the desktop icon
  (`desktop/icon.png`, 1024 px, rendered from the SVG). The service worker cache moves to `sketch-v3` so installed
  copies pick it up; the README screenshots are taken again because they show the header.
- **Why:** the owner didn't like the old logo. Three directions were drawn (a mini diagram, an "s", a sheet with a
  pencil) and challenged from a brand and UX lens: the mini diagram explains the app best but turns into a smudge
  at 16 px and borrows the look of the app it is modelled on; the "s" reads at every size, in light and dark
  tabs, and sits next to Snowlog's icon (a light symbol on a dark square) as a sibling. The owner asked for the
  best one from the UX side and then for the logo.
- **Rejected:** the mini diagram (unreadable in a tab; a simplified small version would make two icons); the
  hachured box alone (reads as a hazard sign); the sheet and pencil (looks like any document app); keeping the old
  purple background.
- **Files:** icon.svg, desktop/icon.png, sw.js, docs/images/screenshot-light.png, docs/images/screenshot-dark.png
- **Commits:** c7d4f9c.
- **Tested:** rendered at 16, 32, 64 and 220 px on light and dark tab backgrounds; the site header checked in both
  themes; `npm test` 17 pass; `npm run build:portable` embeds the new icon.
- **Pending:** the interface's accent colour is still the old purple (`--accent` in `css/styles.css`); changing it
  to match the logo is a separate decision.

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
- **Commits:** 35d95f1.
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
