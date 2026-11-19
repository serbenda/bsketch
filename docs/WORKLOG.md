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

## 2026-11-19 — Security audit: fixes in the engine, the rest for the owner
- **Phase / issue:** P02
- **What:** a full security audit (the repo's `security-audit` skill; artifacts outside the repo). Fixed here:
  coordinates and points capped at ±1e6 in `cleanElement` (`MAX_COORD`); `hachurePath` widens its gap so one shape
  never draws more than 2,000 lines; `wrap()` finds where to split a long word by halving; `toSvgString` forces every
  number it writes to a number.
- **Why:** confirmed findings: a 144-byte file (`w=h=1e9`, hachure fill) hung the tab and, being saved before the
  first paint, froze it on every reload (Medium); a ~10 kB word inside a shape took millions of measures (Low).
  Needs-validation: numeric fields interpolated raw into SVG when an embedder passes an unvalidated scene.
- **Rejected:** dropping the hachure for big shapes (would change how drawings look); validating every scene in
  `setScene`/`mergeScenes` (the SVG fix covers the sink; the embedder's side is Snowlog's).
- **Not fixed here (owner's files):** the guard hook lets an unsandboxed `git` run a foreign repo's config
  (`core.fsmonitor`, `diff.external`) — High, in `.claude/hooks/guard.sh`; `sync-from-template.sh --apply` runs
  `.git/config` filter drivers on the host (Medium) and writes through a predictable temp name (Low); gh api
  denylist gaps in the guard (to validate). These come from project-template and belong there too.
- **Files:** js/scene.js, js/stroke.js, js/render.js, tests/scene.test.mjs, docs/THREAT_MODEL.md, CHANGELOG.md
- **Commits:** this one.
- **Tested:** `npm test` 29 pass (three "security: …" tests); against the old engine the same inputs kept
  `w=1e9`, made 353,554 hachure commands for a 1e6 box, 561,377 measures for a 3,000-letter word and a `<script>` in
  the SVG. `npm run test:e2e` 14 pass.
- **Pending:** the owner's items above.

## 2026-11-18 — Toward 10/10: accent colour, measures, audits, P02 prepared
- **Phase / issue:** P02
- **What:** the accent colour comes from the logo (blue, AAA contrast in both themes; dark icon on the dark
  theme's active tool; `theme_color` night blue); the zoom button is at least 32 px tall. P02's phase file with the
  owner's device checklist and the release steps. A repo posture review (read-only) and a full security audit.
- **Why:** the owner asked to prepare everything for a 10/10.
- **Rejected:** the logo's orange as the accent (too little contrast on white for outlines and text).
- **Measures:** Lighthouse could not be downloaded here (npm is unreachable from this session), so the same
  things were measured in Chrome over DevTools: on a phone with slow 4G and a 4x slower CPU, first paint and LCP
  0.58 s, CLS 0, 183 kB in 12 requests; every control has a name, images have alt text, `lang` and viewport set,
  no tap target under 24 px after the fix.
- **Repo posture (owner's settings):** `main` unprotected; secret scanning, push protection, Dependabot alerts and
  private vulnerability reporting off; Pages builds the legacy way from the whole `main` (the portable file is a
  404 and `CLAUDE.md` is served); actions not restricted. Listed in STATE → Next.
- **Files:** css/styles.css, css/sketch.css, js/editor.js, manifest.webmanifest, sw.js, CHANGELOG.md,
  docs/phases/P02-owner-tests-and-release.md, docs/ROADMAP.md, docs/phases/README.md, docs/STATE.md
- **Commits:** this one, on `feat/v1-prep`.
- **Tested:** `npm test` 26 pass; `npm run test:e2e` 14 pass; contrast computed; light and dark checked by eye.
- **Pending:** the security audit's findings; the owner's GitHub settings and device checklist; `v1.0.0`.

## 2026-11-18 — P06: text fonts
- **Phase / issue:** P06
- **What:** a Font choice (Hand, Normal, Code) in the style panel; `font` on text elements, validated, measured,
  painted and exported with it; imported from Excalidraw's `fontFamily`.
- **Why:** the owner asked to change the text font, with only a few fonts.
- **Rejected:** downloading more font files (heavier site and portable file); a free font picker.
- **Files:** js/scene.js, js/render.js, js/editor.js, tests/scene.test.mjs, tests/e2e/editor.e2e.mjs, README.md,
  CHANGELOG.md, docs/ROADMAP.md, docs/phases/
- **Commits:** acd721e (PR #11).
- **Tested:** `npm test` 26 pass; `npm run test:e2e` 14 pass; by eye in a clean browser.
- **Pending:** —

## 2026-11-18 — The name: bsketch, with an SB logo
- **Phase / issue:** — ([ADR 0005](decisions/0005-rename-to-bsketch.md))
- **What:** the name the user sees becomes bsketch: page title and header, PWA manifest, portable file
  (`bsketch-portable.html`), Tauri product name and window title, the Rust package (so the executable is
  `bsketch`), README and SETUP links to `serbenda/bsketch`. A hand-drawn SB logo on night blue with the orange dot
  (`icon.svg`, `desktop/icon.png`); the README banner and both screenshots rendered again (the screenshots also
  show the ☰ menu now). The service worker cache moves to `sketch-v7`.
- **Why:** the owner wanted something of their own in the name ("the b of bendi"), the repository and URL renamed
  too, and an SB logo.
- **Rejected:** renaming the `.sketch` format, the storage keys or the `sk-` prefix (would lose drawings and break
  Snowlog); a single "b" logo (the owner asked for SB).
- **Files:** index.html, manifest.webmanifest, icon.svg, desktop/icon.png, desktop/src-tauri/{tauri.conf.json,
  Cargo.toml, Cargo.lock, src/main.rs}, scripts/build-portable.mjs, sw.js, tests/e2e/editor.e2e.mjs, README.md,
  CHANGELOG.md, docs/images/*, docs/SETUP.md, docs/VISION.md, docs/STATE.md, docs/decisions/
- **Commits:** this one; the owner's with `.github/` (workflow file names, issue template link).
- **Tested:** `npm test` 25 pass; `npm run test:e2e` 13 pass (the portable walkthrough with the new file name);
  portable build; `Cargo.lock` changed only in the root package (`cargo update --workspace`). The banner, logo and
  screenshots checked by eye.
- **Pending:** the owner renames the repository on GitHub and updates the local remote; Snowlog's update script.

## 2026-11-18 — P05: ask before opening, file shortcuts, copy as PNG, arrowheads
- **Phase / issue:** P05
- **What:** opening over a drawing asks first; Ctrl+S/Ctrl+O; Copy as PNG (menu, Alt+Shift+C); arrowheads (End,
  Start, Both, None) stored as `heads`, validated, imported from Excalidraw. The style panel's nested labels got
  their gap back (`.sk-panel > .sk-label:first-child`).
- **Why:** the owner approved the four most useful gaps found after P04.
- **Rejected:** Ctrl+Shift+C for copying (Chrome's inspector keeps it); storing `heads: 'end'` on every arrow
  (keeps files and diffs small); reading the clipboard back in the test (headless Chrome denies it; the write is
  recorded instead).
- **Files:** js/scene.js, js/editor.js, js/app.js, index.html, css/styles.css, css/sketch.css, sw.js,
  tests/scene.test.mjs, tests/e2e/editor.e2e.mjs, README.md, CHANGELOG.md, docs/ARCHITECTURE.md, docs/ROADMAP.md,
  docs/phases/
- **Commits:** this one.
- **Tested:** `npm test` 25 pass; `npm run test:e2e` 13 pass; by eye in the browser.
- **Pending:** copying images from the desktop app (WebKit) is untested.

## 2026-11-18 — P04: grid and snapping
- **Phase / issue:** P04
- **What:** a grid on the editor's canvas (G or the menu's "Show grid"), remembered in `sketch.prefs`; new shapes,
  line and arrow ends, texts and moved selections snap to it; arrow keys move one cell (Shift 1 px).
- **Why:** the owner asked for a grid among the options (2026-11-17) and approved this plan (2026-11-18).
- **Rejected:** snapping each element of a moved selection (would break groups); Alt to skip the snap (moves
  windows on Linux); snapping while resizing or rotating (left for later).
- **Files:** js/scene.js, js/prefs.js, js/editor.js, js/app.js, index.html, css/styles.css, tests/scene.test.mjs,
  tests/e2e/editor.e2e.mjs, README.md, CHANGELOG.md, docs/ARCHITECTURE.md, docs/THREAT_MODEL.md, docs/ROADMAP.md,
  docs/phases/
- **Commits:** this one.
- **Tested:** `npm test` 24 pass; `npm run test:e2e` 12 pass (a new grid walkthrough); by eye in light and dark.
- **Pending:** —

## 2026-11-18 — P03: the side menu with file actions and options
- **Phase / issue:** P03
- **What:** a ☰ button opens a side menu (modal `<dialog>`) with New, Open, Save, PNG, SVG, a Transparent background
  toggle, Portable, Appearance (System · Light · Dark) and six canvas colours. `js/prefs.js` keeps the appearance in
  `sketch.prefs`, validated. The editor has `setTheme` and `setBackground`; undo steps keep the background.
  `css/styles.css` and `css/sketch.css` apply the dark colours when forced, not only with the system's dark mode.
- **Why:** the owner's canvas was black (dark system) and there was nowhere in the app to change it; they asked
  for a side menu with the file actions, which approves P03's plan with that change.
- **Rejected:** a centred dialog with the file buttons still in the header (the plan's first idea; the owner asked
  for one side menu); a free colour picker (as planned); remembering the transparent toggle (as planned).
- **Files:** index.html, js/app.js, js/prefs.js, js/editor.js, js/scene.js, js/render.js, css/styles.css,
  css/sketch.css, sw.js, tests/scene.test.mjs, tests/e2e/editor.e2e.mjs, README.md, CHANGELOG.md,
  docs/ARCHITECTURE.md, docs/THREAT_MODEL.md, docs/ROADMAP.md, docs/phases/
- **Commits:** 281d585 (PR #8).
- **Tested:** `npm test` 23 pass; `npm run test:e2e` 11 pass (a new walkthrough through the menu on a dark system);
  the portable build; by eye in the browser, dark system with Light and System, desktop and phone width, no console
  errors.
- **Pending:** P04 (grid). The transparent PNG has no pixel test.

## 2026-11-18 — OSV-Scanner findings in the desktop lockfile
- **Phase / issue:** — · PR #7
- **What:** `desktop/src-tauri/osv-scanner.toml` (owner) ignores, until 2027-05-18 and each with its reason, the
  three advisories OSV-Scanner found once `Cargo.lock` was committed: RUSTSEC-2024-0429 (`glib` 0.18, Medium),
  RUSTSEC-2024-0370 (`proc-macro-error`, unmaintained) and RUSTSEC-2026-0543 (`chrono`, unmaintained).
- **Why:** all three come from Tauri 2, none from sketch. `glib` 0.18 is gtk-rs 0.18 used by Tauri and WebKitGTK
  on Linux; its fix (0.20) needs Tauri to change GTK bindings, and sketch never calls `glib::VariantStrIter`, the
  unsound code. `proc-macro-error` is a build-time macro of `glib-macros`. `chrono` is only an optional
  dependency of `serde_with` (via `tauri-utils`) that `cargo tree` shows is not built. Tauri 2.12.6 is the
  latest 2.x, so updating does not help.
- **Rejected:** going back to an untracked lockfile (hides the advisories instead of recording them); an ignore
  file at the root (OSV-Scanner only reads it next to the lockfile, checked with the pinned image).
- **Files:** desktop/src-tauri/osv-scanner.toml (owner), docs/WORKLOG.md
- **Commits:** this one; the owner's with the ignore file.
- **Tested:** the CI's pinned OSV-Scanner image run locally on a copy: with the file, 4 vulnerabilities filtered
  (one is the GHSA alias of the glib advisory), "No issues found", exit 0, no unused ignores.
- **Pending:** review the entries by 2027-05-18, or when Tauri moves past gtk-rs 0.18.

## 2026-11-17 — Fixes from a code review: export, editor, offline, desktop lockfile
- **Phase / issue:** — (review of `development` before the next PR)
- **What:** PNG export of big drawings is scaled down to fit the browser's canvas limits (16,384 px a side,
  ~16.7 Mpx) and says so if it still fails, instead of downloading a file with "null" in it. Aligning and
  distributing keep arrows attached. Enter/Space on toolbar and panel buttons press them. Undo: changes that
  changed nothing leave no step and keep redo; a colour drag is one step. A pinch started while drawing drops the
  shape just begun; a third finger is ignored. `syncBindings` reuses unchanged elements so per-object caches survive
  a drag. Texts are measured again once the font loads. The text box follows zoom and pan; double click respects the
  hand and eraser; right button ignored; Space released on focus loss; `destroy()` keeps the text being written.
  The service worker keeps only the site's own page under `index.html` (another page opened in the tab, like the
  portable file, used to replace it offline). `desktop/src-tauri/Cargo.lock` is committed (it was ignored) and the
  owner added `--locked` to the desktop build.
- **Why:** a review of the branch found these bugs; the PNG one was reproduced in Chrome (`toBlob` gives null from
  about 33,000 px wide or 8,000×8,000 drawing units at 2×), the SW one with a debug script.
- **Rejected:** a higher PNG limit (Chrome takes 268 Mpx, but iPhone Safari fails over ~16.7 Mpx); retrying at a
  smaller scale after a null (Safari may give a blank canvas, not null); installing Rust on the Mac for the lockfile
  (generated in a throwaway `rust:1-slim` container instead).
- **Files:** js/app.js, js/editor.js, js/render.js, js/scene.js, sw.js, tests/scene.test.mjs,
  tests/e2e/editor.e2e.mjs, .gitignore, desktop/src-tauri/Cargo.lock, CHANGELOG.md
- **Commits:** 9812bd9, 1421d25, 51e72b4, 3e211c0 (owner, `.github/`); this one.
- **Tested:** `npm test` 20 pass; `npm run test:e2e` 10 pass. Each new walkthrough was run against the old code and
  fails there (alignment, Enter on a button, undo, pinch, offline). The offline walkthrough now stops the test server
  too: Chrome's offline mode does not cut the service worker's own network, so before it never tested offline.
- **Pending:** try the pinch and the desktop downloads (`<a download>` with `blob:` URLs in WKWebView/WebKitGTK) on
  real devices. (Dependabot already has a `cargo` entry for `desktop/src-tauri`; with the lockfile it now has
  something to update.)
- **Security review:** the security reviewer (guidance mode) went over the workflow change and the lockfile:
  427 crates, all from crates.io with checksums, no git or path sources; `--locked` only adds a flag to a static
  matrix; no Critical, High or Medium findings.

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
