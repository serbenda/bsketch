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

## 2026-11-20 — Version 1.3.0
- **Phase / issue:** S5 (P14–P16)
- **What:** version 1.3.0 in `package.json`, `tauri.conf.json`, `Cargo.toml` and `Cargo.lock`; the CHANGELOG's
  changes become `[1.3.0] - 2026-11-20`; STATE.
- **Why:** S5 is complete.
- **Rejected:** —
- **Files:** package.json, desktop/src-tauri/tauri.conf.json, desktop/src-tauri/Cargo.toml,
  desktop/src-tauri/Cargo.lock, CHANGELOG.md, docs/STATE.md
- **Commits:** this one.
- **Tested:** `npm test` passes.
- **Pending:** the owner merges PR #25 and releases.

## 2026-11-20 — P16: curve an arrow by hand
- **Phase / issue:** P16
- **What:** `bend` on curved arrows and lines (validated, ±2, the default 0.25 not stored), `bendThrough` and
  `midPoint` in `js/scene.js`; a middle handle on selected two-point lines (not elbows) that bends them through the
  pointer, straight again near the line; another route drops the bend; fuzz checks for `bend`; the Spanish counts no
  longer say "1 flechas"; service worker v19.
- **Why:** S5's last phase.
- **Rejected:** adding a third point to the line (it would turn every bent line into a polyline and lose the smooth
  curve and its route).
- **Files:** js/scene.js, js/editor.js, js/i18n.js, sw.js, tests/, README.md, CHANGELOG.md, docs/
- **Commits:** this one.
- **Tested:** `npm test` 64 pass; `npm run test:e2e` 25 pass; a screenshot.
- **Pending:** —

## 2026-11-20 — P15: presentation mode with a laser pointer
- **Phase / issue:** P15
- **What:** `startPresenting`/`stopPresenting` in the editor: slides are the top-level frames in reading order (or
  the whole drawing), each fitted to the screen and painted with `hideFrames` (contents clipped, no border or title);
  keys and a small bar move through them; full screen when allowed, leaving it ends the talk; the laser keeps a
  fading trail of pointer positions and repaints only while it lasts; editing, wheel and double click are off while
  presenting; Spanish strings; service worker v18.
- **Why:** S5's second phase: frames that work as slides (after P14's clipping).
- **Rejected:** a separate presentation page or window (the editor already paints and clips frames); a laser tool in
  the toolbar (it would not fit on a phone, and it is only useful while presenting).
- **Files:** js/editor.js, js/render.js, js/i18n.js, css/sketch.css, sw.js, tests/e2e/editor.e2e.mjs, README.md,
  CHANGELOG.md, docs/
- **Commits:** this one.
- **Tested:** `npm test` 63 pass; `npm run test:e2e` 24 pass, twice; the portable build; a screenshot of a slide.
- **Pending:** —

## 2026-11-20 — P14: frames clip what lies on them
- **Phase / issue:** P14
- **What:** `frameOwners` (each element belongs to the smallest frame its centre is on; cached per list) and
  `inFrame` by centre; the canvas clips each member to its frame; both SVG exports wrap members in a group with a
  `clipPath` per frame; `.excalidraw` `frameId` from the same rule; S5 in the ROADMAP; service worker v17. STATE no
  longer lists the OpenSSF badge (it needs an open-source license).
- **Why:** S5's first phase: frames that read like slides, before presenting them (P15).
- **Rejected:** storing a `frameId` on each element (it would have to be kept right on every change; the centre rule
  needs nothing stored); a switch to turn clipping off (out of scope for now).
- **Files:** js/scene.js, js/render.js, sw.js, tests/, README.md, CHANGELOG.md, docs/
- **Commits:** this one.
- **Tested:** `npm test` 63 pass; `npm run test:e2e` 23 pass, one reading the canvas' pixels; the portable build.
- **Pending:** —

## 2026-11-20 — 1.2.0 released
- **Phase / issue:** S4
- **What:** the owner released v1.2.0 with `bsketch-release.sh 1.2.0`: tag on `main` (ce451b0), the three
  executables and their Sigstore provenance attached. STATE updated.
- **Why:** S4 (P09–P13) on `main`.
- **Rejected:** —
- **Files:** docs/STATE.md
- **Commits:** this one.
- **Tested:** `gh attestation verify bsketch-windows.exe --bundle bsketch-windows.exe.intoto.jsonl` passes on the
  release's own files.
- **Pending:** —

## 2026-11-20 — The e2e tests start Chrome reliably on CI
- **Phase / issue:** — (CI on PR #24, and #21 before)
- **What:** `tests/e2e/cdp.mjs` starts Chrome with `--disable-dev-shm-usage`, waits up to 45 s, tries three times,
  and kills Chrome and removes its profile when a try fails.
- **Why:** on GitHub's runners Chrome sometimes didn't print its DevTools address within 20 s; every walkthrough
  then failed, and the Chrome left running kept the job alive until it was cancelled at 20 minutes.
- **Rejected:** only re-running the failed jobs (it came back twice in a row).
- **Files:** tests/e2e/cdp.mjs
- **Commits:** this one.
- **Tested:** `npm run test:e2e` 22 pass; with a "Chrome" that exits at once, `launch` tries three times and rejects
  without hanging.
- **Pending:** Snowlog's copy of the same driver could get the same change.

## 2026-11-20 — Version 1.2.0
- **Phase / issue:** S4 (P09–P13)
- **What:** version 1.2.0 in `package.json`, `tauri.conf.json`, `Cargo.toml` and `Cargo.lock`; the CHANGELOG's
  changes become `[1.2.0] - 2026-11-20`, with Fixed and Security sections; STATE. The owner's release script is now
  one for any version (`bsketch-release.sh <version>`, outside the repo).
- **Why:** S4 is complete.
- **Rejected:** —
- **Files:** package.json, desktop/src-tauri/tauri.conf.json, desktop/src-tauri/Cargo.toml,
  desktop/src-tauri/Cargo.lock, CHANGELOG.md, docs/STATE.md
- **Commits:** this one.
- **Tested:** `npm test` passes; the release script parses (`bash -n`) and refuses a version already released.
- **Pending:** the owner merges and releases.

## 2026-11-20 — The lock-and-search walkthrough waits for the diagram
- **Phase / issue:** P13
- **What:** the e2e walkthrough waits until the text-to-diagram dialog's text box empties (the diagram goes in on
  the dialog's close event, a moment after it closes) before searching.
- **Why:** it searched an empty drawing when the whole suite ran (it passed on its own); pushed by mistake with the
  P13 commit, because the check before the push didn't stop on a failed test.
- **Rejected:** inserting before closing the dialog (the close event is where Cancel and Escape are told apart).
- **Files:** tests/e2e/editor.e2e.mjs
- **Commits:** this one.
- **Tested:** `npm run test:e2e` 22 pass, twice in a row.
- **Pending:** —

## 2026-11-20 — P13: lock, search and more styles
- **Phase / issue:** P13
- **What:** `locked`, `dotted`, `rounded` and `fillStyle: 'cross-hatch'` in the model (validated, to and from
  Excalidraw); round outlines and mirrored hachure in `drawOps`; dotted dashes on canvas and SVG; the panel's line
  style (solid, dashed, dotted), fill (hachure, cross-hatch, solid) and corners; Lock and Unlock all; the search box
  (Ctrl+F, accent- and case-insensitive, reading order); Spanish strings; fuzz checks for the new fields; service
  worker v16.
- **Why:** the 1.2.0 extras the owner chose.
- **Rejected:** locking with a separate "locked layer" (a field per element is simpler and travels to Excalidraw);
  search with regular expressions (plain text is what people type).
- **Files:** js/scene.js, js/render.js, js/editor.js, js/i18n.js, css/sketch.css, sw.js, tests/, README.md,
  CHANGELOG.md, docs/
- **Commits:** this one.
- **Tested:** `npm test` 62 pass; fuzz seeds 1–2 at 2000 runs; `npm run test:e2e` 22 pass; a screenshot in Spanish.
- **Pending:** —

## 2026-11-20 — The canvas locks as soon as a drawing switch starts
- **Phase / issue:** P11 (CI on PR #23)
- **What:** New, Open, choosing a drawing, a template and Delete lock the canvas before they start (it unlocked only
  once the next drawing was loading), and unlock it again if they fail. Also: export to `.excalidraw` (P12) in the
  ☰ menu, with `toExcalidraw` and a round-trip test.
- **Why:** CI failed "several drawings…": after Delete the index was saved before the canvas locked, so what was done
  in that gap (a quick user, or the test) went to the drawing being replaced.
- **Rejected:** only making the test wait longer (the gap was real).
- **Files:** js/app.js, js/scene.js, index.html, js/i18n.js, sw.js, tests/
- **Commits:** this one and 56cdba1.
- **Tested:** `npm test` 61 pass; `npm run test:e2e` 21 pass; the failing walkthrough three more times.
- **Pending:** —

## 2026-11-20 — P11: animated flow arrows
- **Phase / issue:** P11
- **What:** `animated: true` on arrows and lines (validated, stored only when on); their line's draw op is marked
  `flow` and painted dashed with a moving offset; both SVG exports add an `<animate>` on `stroke-dashoffset`; a Flow
  choice in the style panel; a repaint timer (~30 fps) only while something animated is visible, none with
  `prefers-reduced-motion`; Spanish strings; service worker v14.
- **Why:** S4's third phase (an idea from Excaliflow): data-flow and architecture diagrams that read at a glance.
- **Rejected:** moving dots or particles (more drawing per frame, and no simple SVG equivalent); CSS animations in
  the SVG (a `<style>` element; SMIL `<animate>` needs none).
- **Files:** js/scene.js, js/render.js, js/editor.js, js/i18n.js, sw.js, tests/scene.test.mjs,
  tests/e2e/editor.e2e.mjs, README.md, CHANGELOG.md, docs/
- **Commits:** this one.
- **Tested:** `npm test` 60 pass; `npm run test:e2e` 20 pass; screenshots.
- **Pending:** —

## 2026-11-20 — CI on PR #22: the HTML check and two CodeQL findings
- **Phase / issue:** P09
- **What:** the text-to-diagram dialog writes `A -&gt; B` (htmlhint refused a raw `>`); picture files read from a
  file are built from pairs and refuse `__proto__`, `constructor` and `prototype` as names (CodeQL "remote property
  injection"); Mermaid edges are detected by plain text search, not a regular expression (CodeQL took `-->` for an
  HTML comment filter, a false positive).
- **Why:** the PR's Tests and CodeQL checks failed.
- **Rejected:** dismissing the CodeQL alerts (the first one is worth closing, and the second is cheaper to avoid).
- **Files:** index.html, js/scene.js, js/textdiagram.js, tests/scene.test.mjs
- **Commits:** this one.
- **Tested:** `npm test` 59 pass (a new regression check for prototype names); fuzz with seeds 1–3 at 2000 runs;
  `npm run test:e2e` 19 pass; no raw `>` left in the page's text.
- **Pending:** —

## 2026-11-20 — P10: chain the next shape, templates
- **Phase / issue:** P10
- **What:** Ctrl/Cmd+arrow keys with one shape selected add the same shape on that side (sliding past taken places),
  joined by an arrow, with its text open (`chainNext` in `js/editor.js`); `js/templates.js` with five templates in
  English and Spanish, drawn by text to diagram as new drawings from the ☰ menu; `insertText` can leave the result
  unselected; service worker v13.
- **Why:** S4's second phase: drawing flowcharts at the speed of typing (an idea from Excaliflow).
- **Rejected:** Tab to chain (Excaliflow's key): Tab goes through the elements, which keyboard and screen-reader users
  need; templates as stored scenes (text is smaller, editable and translatable).
- **Files:** js/editor.js, js/templates.js, js/app.js, js/i18n.js, index.html, css/styles.css, sw.js,
  tests/textdiagram.test.mjs, tests/e2e/editor.e2e.mjs, README.md, CHANGELOG.md, docs/
- **Commits:** this one.
- **Tested:** `npm test` 59 pass; `npm run test:e2e` 19 pass; screenshots in Spanish.
- **Pending:** —

## 2026-11-20 — P09: text to diagram, offline and without AI
- **Phase / issue:** P09
- **What:** `js/textdiagram.js` reads an indented list, a Mermaid flowchart subset or `A -> B` lines and lays the
  graph out in layers (cycles broken, barycentre ordering, parents centred, four directions); the editor's
  `insertText`, paste of text (a diagram, or a text) and of bsketch clipboard JSON (copy now writes it); the menu's
  "Text to diagram…" dialog with examples, direction and a live count; Spanish strings; service worker v12.
- **Why:** S4's first phase: what other whiteboards do with a cloud AI, done in the browser.
- **Rejected:** a Mermaid library (a dependency, and it renders its own SVG, not editable hand-drawn elements);
  elbow arrows for lists (they zig-zag between siblings); reordering lists (their written order never crosses).
- **Files:** js/textdiagram.js, js/editor.js, js/app.js, js/i18n.js, index.html, css/styles.css, sw.js,
  tests/textdiagram.test.mjs, tests/e2e/editor.e2e.mjs, README.md, CHANGELOG.md, docs/
- **Commits:** this one.
- **Tested:** `npm test` 58 pass; `npm run test:e2e` 18 pass; screenshots of the dialog and the diagrams.
- **Pending:** —

## 2026-11-20 — 1.1.0 released
- **Phase / issue:** —
- **What:** the owner released v1.1.0 with the release script: tag on `main` (70225f1), the three executables and
  their Sigstore provenance (`*.intoto.jsonl`) attached; the v1.0.0 tag removed. STATE updated.
- **Why:** P08 and the new license on `main`.
- **Rejected:** —
- **Files:** docs/STATE.md
- **Commits:** this one.
- **Tested:** `gh attestation verify bsketch-windows.exe --bundle bsketch-windows.exe.intoto.jsonl` passes on the
  release's own files.
- **Pending:** —

## 2026-11-20 — The 1.0.0 release withdrawn
- **Phase / issue:** — ([ADR 0006](decisions/0006-proprietary-license.md))
- **What:** the v1.0.0 GitHub release is deleted (its tag goes with the owner's script); LICENSE, README, CHANGELOG
  and ADR 0006 no longer refer to the earlier open-source license; the 1.1.0 release script no longer touches v1.0.0.
- **Why:** the owner: "quita la release y modifica, no quiero que sea MIT".
- **Rejected:** rewriting the repository's history to remove the old LICENSE (it would break every clone, the
  merged PRs and the provenance of the builds, and `main` is protected against it).
- **Files:** LICENSE, README.md, CHANGELOG.md, docs/decisions/0006-proprietary-license.md
- **Commits:** this one.
- **Tested:** `gh release list` shows no release; the release script still parses (`bash -n`).
- **Pending:** the owner removes the v1.0.0 tag; then releases 1.1.0.

## 2026-11-20 — The license: all rights reserved, no use by AI
- **Phase / issue:** — ([ADR 0006](decisions/0006-proprietary-license.md))
- **What:** `LICENSE` becomes proprietary from 1.1.0 (viewing and personal evaluation only; anything else needs
  written permission; a text-and-data-mining reservation and no use by AI or automated tools). The notice and a
  marker (`bsketch-7f3a9c2e`) at the top of every JS and CSS file; `noai` meta in the page; the copyright in the menu
  (translated) and in the desktop app; `license-file` in Cargo.toml and `UNLICENSED` in package.json; README badge,
  Contributing and License sections. ROADMAP: S4 with P09–P12 for 1.2.0.
- **Why:** the owner: "no se puede usar, es personal… que me proteja la propiedad intelectual" and "no puede
  reutilizarse por ninguna IA, bot".
- **Rejected:** a `robots.txt` in this repository (crawlers only read the one at the domain's root, which belongs to
  the `bendi.dev` site); obfuscating the code (it would not stop a determined copier and would break the readable
  portable file and the reviews).
- **Files:** LICENSE, README.md, index.html, js/*.js, css/*.css, sw.js, js/i18n.js, package.json,
  desktop/package.json, desktop/src-tauri/Cargo.toml, desktop/src-tauri/tauri.conf.json, CHANGELOG.md, docs/
- **Commits:** this one.
- **Tested:** `npm test` 53 pass; `npm run test:e2e` 17 pass; the portable build carries the notice in every module.
- **Pending:** the owner decides on a private repository and on the domain-wide `robots.txt`; a lawyer's review is
  advisable.

## 2026-11-20 — Nothing drawn is lost while another drawing loads
- **Phase / issue:** P08
- **What:** while the site loads the next drawing (after New, Open, choosing one or deleting the open one) the canvas
  is inert; the e2e walkthrough waits for it.
- **Why:** CI's e2e failed on PR #20: a shape drawn right after deleting a drawing was replaced when the next one
  finished loading (loading is async since IndexedDB).
- **Rejected:** only making the test wait (a quick user could hit the same race).
- **Files:** js/app.js, tests/e2e/editor.e2e.mjs, CHANGELOG.md
- **Commits:** this one.
- **Tested:** `npm run test:e2e` 17 pass; the failing walkthrough three more times.
- **Pending:** —

## 2026-11-20 — Version 1.1.0, released with signed provenance
- **Phase / issue:** P08
- **What:** version 1.1.0 in `package.json`, `tauri.conf.json`, `Cargo.toml` and `Cargo.lock`; the CHANGELOG's
  changes become `[1.1.0] - 2026-11-20`. The owner's release script attaches each executable's Sigstore provenance
  bundle (`<file>.intoto.jsonl`, from `gh attestation download`, verified first) to the release, and to v1.0.0's.
- **Why:** P08 is on `main`; OpenSSF Scorecard's Signed-Releases check looks for provenance files on releases (0/10
  so far, although the executables were already attested).
- **Rejected:** signing with a key of our own (keys to keep safe; GitHub's attestations need none).
- **Files:** package.json, desktop/src-tauri/tauri.conf.json, desktop/src-tauri/Cargo.toml,
  desktop/src-tauri/Cargo.lock, CHANGELOG.md, docs/STATE.md
- **Commits:** this one.
- **Tested:** `npm test` passes; `gh attestation verify` and `download` tried on v1.0.0's Windows executable.
- **Pending:** the owner merges the PR and runs the release script.

## 2026-11-20 — The Tauri CLI's lockfile, made by the Lockfile workflow
- **Phase / issue:** P08
- **What:** `desktop/package-lock.json` from the Lockfile workflow's run 44705853015 (artifact `desktop-lockfile`):
  `@tauri-apps/cli` 2.12.4 and its platform packages, every one from registry.npmjs.org with its sha512.
- **Why:** the Desktop workflow now installs the CLI with `npm ci`, so each build uses exactly these versions,
  checked against their hashes; Dependabot watches them.
- **Rejected:** writing the lockfile by hand from CDN data (npm's registry is not reachable from this machine).
- **Files:** desktop/package-lock.json
- **Commits:** 90b32f4
- **Tested:** the Desktop workflow on 90b32f4 built and smoke-tested Windows, macOS and Linux with it.
- **Pending:** —

## 2026-11-20 — P08: review, fuzzing, IndexedDB, pictures, frames and a library
- **Phase / issue:** P08
- **What:** a security review of P07 (four data-loss findings: two fixed by the new store, two fixed here); fuzz
  tests (three real bugs found and fixed: crashes on objects with a non-callable toString, attached arrows beyond
  ±MAX_COORD, a list over 500 after another tab's change); drawings in IndexedDB with migration and recovery;
  pictures, frames and a library; the Tauri CLI as a pinned dev dependency (`desktop/package.json`); Lockfile and
  Scorecard workflows prepared for the owner; P02 closed.
- **Why:** the owner asked for "1,2,3,4,5,6, y funciona que se parezca a exalidraw".
- **Rejected:** storing a picture inside each element (copies would repeat it; kept once per scene in `files`);
  SVG pictures (they can carry script); clipping to frames on screen (more cost than value for now); generating the
  lockfile by hand from a CDN (the registry is unreachable here; a workflow makes it with npm's own integrity).
- **Files:** js/store.js, js/drawings.js, js/scene.js, js/render.js, js/editor.js, js/app.js, js/i18n.js,
  css/sketch.css, sw.js, desktop/package.json, tests/, README.md, CHANGELOG.md, docs/
- **Commits:** a8b5d95, 1daf8ee, bf53fa4, 57a8266 and the docs commit.
- **Tested:** `npm test` 53 pass; fuzz with seeds 1–6 at 3000 runs; `npm run test:e2e` 17 pass; screenshots on
  desktop, in Spanish and on a phone-sized screen.
- **Pending:** the owner's commit of `.github/` changes, then the lockfile; the owner's device checks.

## 2026-11-19 — Version 1.0.0 and the agent's checks for P02
- **Phase / issue:** P02
- **What:** version 1.0.0 in `package.json`, `tauri.conf.json`, `Cargo.toml` and `Cargo.lock`; the CHANGELOG's
  changes become `[1.0.0] - 2026-11-19`; the agent's checks on the published site added to P02. `Tests` and
  `Hook (macOS bash 3.2)` are now required on `main`; the repository's social preview is the banner (1280×640).
- **Why:** the owner asked to prepare the release and run what can be run from here.
- **Rejected:** tagging from the agent (tags are the owner's: the ruleset and the guardrails block it).
- **Files:** package.json, desktop/src-tauri/tauri.conf.json, desktop/src-tauri/Cargo.toml,
  desktop/src-tauri/Cargo.lock, CHANGELOG.md, docs/phases/P02-owner-tests-and-release.md, docs/STATE.md
- **Commits:** this one.
- **Tested:** live smoke script on bendi.dev (desktop and phone emulation) all green; `npm test` 32 pass.
- **Pending:** the owner's devices (Safari, Firefox, a real phone, the desktop apps), then the tag and release.

## 2026-11-19 — P07: several drawings, routes, export the selection, grid on resize, Spanish
- **Phase / issue:** P07
- **What:** several drawings in the browser (`js/drawings.js`, a list in the ☰ menu); elbow and curved arrows and
  lines (`route`, `routePoints`); export only the selection; the grid on resizes, dragged ends and rotation; the
  interface in English or Spanish (`js/i18n.js`, the `lang` pref).
- **Why:** the owner asked for "uso diario, calidad y detalles" after the 10/10 review.
- **Rejected:** a drawings index that keeps the open drawing under its own key (it would break drawings saved by
  older versions and Snowlog's expectations); translating with a library (no dependencies).
- **Files:** js/drawings.js, js/i18n.js, js/scene.js, js/editor.js, js/app.js, js/prefs.js, index.html,
  css/styles.css, sw.js, tests/, README.md, CHANGELOG.md, docs/
- **Commits:** 17946da, acf8ff9 and the docs commit.
- **Tested:** `npm test` 32 pass; `npm run test:e2e` 16 pass.
- **Pending:** Snowlog's update script still copies the old file names; a Tauri lockfile (npm unreachable here).

## 2026-11-19 — project-template 1.0.1: git and gh only on the project's repository
- **Phase / issue:** — (security audit follow-up)
- **What:** synced project-template 1.0.1 (`scripts/sync-from-template.sh --apply`): the new `guard.sh` (git and gh
  only on the project's repository, submodules, `clone`/`ls-remote` from folders, nested repositories in `git add`,
  grouped risky options, changed hooks in linked worktrees), its tests and the sync script; and, by hand, the
  `env` block of `.claude/settings.json` that gives every git `safe.bareRepository=explicit` and
  `core.fsmonitor=false`.
- **Why:** the High finding of this project's security audit (2026-11-18): git, outside the sandbox, could be
  pointed at a planted repository whose config runs programs. Fixed in the template (PRs #21–#23, release v1.0.1)
  and synced here.
- **Rejected:** copying the template's settings.json whole (this project's permissions are its own); merging the
  other "review" files (ci.yml, dependabot.yml, DoD, SETUP differ because this project adapted them).
- **Files:** .claude/hooks/guard.sh, .claude/settings.json, scripts/test-guard.sh, scripts/test-scripts.sh,
  scripts/sync-from-template.sh, .claude/TEMPLATE_VERSION
- **Commits:** the owner's.
- **Tested:** scripts/test-guard.sh passes here after the sync; scripts/test-scripts.sh is the template's own and is
  skipped in a project (as CI does: it tests setup-repo on a copy of the template).
- **Pending:** —

## 2026-11-19 — Build provenance for the desktop executables
- **Phase / issue:** P02
- **What:** the Desktop workflow signs a provenance attestation for each executable it builds
  (`actions/attest-build-provenance` v4.2.2, pinned by SHA); only the build job gets `id-token: write` and
  `attestations: write`. A download can be checked with `gh attestation verify <file> -R serbenda/bsketch`.
- **Why:** the repo posture review: the executables were uploaded with nothing tying them to this repository's CI.
- **Rejected:** signing the executables with a code-signing certificate (costs money; R-001, the owner's call).
- **Files:** .github/workflows/desktop.yml
- **Commits:** 8985f4d (owner).
- **Tested:** the patch applied to a copy first; the Desktop run on `development` after the push.
- **Pending:** —

## 2026-11-19 — Hardening: test driver literals, desktop CSP checked, provenance prepared
- **Phase / issue:** P02
- **What:** the e2e driver (`tests/e2e/cdp.mjs`) builds code with `lit()`, which escapes `<`, `>`, `/` and the
  U+2028/U+2029 separators on top of JSON (for CodeQL's four `js/bad-code-sanitization` alerts). The portable
  walkthrough now checks the file's CSP (`default-src 'none'`, `connect-src 'none'`, script by hash, Trusted Types,
  `base-uri`/`form-action 'none'`) and that a request is refused; that CSP is the desktop app's only one. A script
  for the owner adds build provenance attestations to the desktop executables (`.github/`).
- **Why:** findings of the repo posture review and the security audit, toward a 10/10.
- **Rejected:** a CSP in `tauri.conf.json` as well (Tauri would rewrite the HTML and add its own policy; the
  page's meta CSP already applies in the webviews and is now tested). Pinning `@tauri-apps/cli`'s tree with a
  `package-lock.json` was tried and left for later: npm's registry is unreachable from this session (a TLS
  interception on the network), also from Docker, and turning TLS checks off is not an option.
- **Files:** tests/e2e/cdp.mjs, tests/e2e/editor.e2e.mjs, docs/THREAT_MODEL.md
- **Commits:** this one; the owner's with the attestation step.
- **Tested:** `lit()` round-trips quotes, backslashes, `</script>` and the separators with none of `<` or `>` left;
  `npm test` 29 pass; `npm run test:e2e` 14 pass, with the new CSP checks; the attestation patch applied to a copy
  of `desktop.yml`.
- **Pending:** the lockfile for `@tauri-apps/cli` (generate it where npm is reachable, then `npm ci` in
  `desktop.yml` and an `npm` entry in Dependabot).

## 2026-11-19 — CI: editorconfig-checker pinned by URL and SHA-256
- **Phase / issue:** P02
- **What:** the "Formatting (.editorconfig)" step downloads editorconfig-checker v4.0.2 by its release URL, checks
  its SHA-256 and runs the archive's binary, instead of `npx editorconfig-checker@6.2.0` (owner's commits on
  `.github/`).
- **Why:** the npm wrapper asked GitHub's API, without a token, for the *latest* release: unpinned, and it hit the
  rate limit now and then, failing "Tests" for no reason in the code.
- **Rejected:** giving the wrapper a token (still unpinned); the first version looked for a binary named
  `ec-linux-amd64`, which the v4 archive doesn't have, so it now takes the archive's one non-documentation file.
- **Files:** .github/workflows/ci.yml
- **Commits:** 74ad71b, and the owner's fix to find the binary.
- **Tested:** PR #13's "Tests" job passes with the pinned binary.
- **Pending:** —

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
