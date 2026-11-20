# bsketch status

> **Single source of truth for status.** Claude reads it at the start of every session (`/status`) and updates it when closing a phase (`/close-phase`).
> At most **150 lines**: replace what is outdated instead of piling up, and **link** documents instead of copying them.

Last updated: 2026-11-20

## Where we are
- **Mode:** full
- **Current stage:** S3 — Release (see [ROADMAP](ROADMAP.md))
- **Phase in progress:** none ([P08](phases/P08-like-excalidraw.md) done on `development`)
- **Environment:** GitHub Pages (published by the Pages workflow on `main`), the portable file, and desktop builds as CI artifacts
- **Working branch:** `development`

## Current work
- [P09](phases/P09-text-to-diagram.md) and [P10](phases/P10-quick-diagrams.md) done on `development`, in PR #22. Next: P11 (animated arrows).

## Recently done
- [P10](phases/P10-quick-diagrams.md): Ctrl+arrow keys chain the next shape; five templates.
- [P09](phases/P09-text-to-diagram.md): text to diagram (list, Mermaid, arrows), offline; copy and paste between tabs.
- **v1.1.0 released** (2026-11-20) with the three executables and their signed provenance; proprietary license
  ([ADR 0006](decisions/0006-proprietary-license.md)); the 1.0.0 release and tag withdrawn; AI crawlers kept out of
  `/bsketch/` by bendi.dev's robots.txt.
- OpenSSF Scorecard running on `main` (5.5/10 on its first run; badge in the README).
- [P08](phases/P08-like-excalidraw.md): P07 reviewed, fuzz tests, drawings in IndexedDB, pictures, frames, a library.
- **v1.0.0 released** (2026-11-19) with the three executables ([P02](phases/P02-owner-tests-and-release.md)).
- [P07](phases/P07-everyday-use.md): several drawings, elbow and curved arrows, export only the selection, the
  grid on resize and rotation, the interface in Spanish.
- project-template 1.0.1 synced (the security audit's High finding fixed), PR #15.
- GitHub hardened (2026-11-19): rulesets on main, development and tags; secret scanning and push protection;
  Dependabot alerts; private vulnerability reporting; Pages from the workflow; actions restricted and SHA-pinned;
  editorconfig-checker pinned in CI. Security audit fixes in the engine (PR #13).
- [P06](phases/P06-text-fonts.md): text fonts (Hand, Normal, Code), PR #11.
- Renamed to **bsketch** with an SB logo ([ADR 0005](decisions/0005-rename-to-bsketch.md)); the repository is
  `serbenda/bsketch` and the site `/bsketch/`.
- [P05](phases/P05-everyday-comfort.md): ask before opening, Ctrl+S/Ctrl+O, copy as PNG, arrowheads.
- [P04](phases/P04-grid-and-snapping.md): the grid (G or the menu), with snapping for new shapes and moves.
- [P03](phases/P03-options-menu.md): the ☰ side menu (files, export, appearance, canvas background).
- Fixes from a code review: big PNG export, arrows kept when aligning, Enter on buttons, undo steps, pinch while
  drawing, attached-element caching, the service worker's offline page, `Cargo.lock` committed (see WORKLOG).
- [P01](phases/P01-adopt-project-template.md): the template's guardrails and docs, everything in English (PR #5).
- New logo (a hand-drawn "s" on night blue), a README banner and the README rewritten for visitors.
- Portable single-file version and Tauri desktop builds for Windows, macOS and Linux (PR #5).
- Keyboard use, smoother large drawings and `mergeScenes` for Snowlog (PR #4).
- Text inside shapes, attached arrows, rotation, groups, alignment, offline use (PR #3).

## Next
1. P11: animated flow arrows ([ROADMAP](ROADMAP.md), S4).
2. Owner: P02's checklist on Safari, Firefox, a real phone and the desktop apps; anything failing becomes a 1.1.x.
3. Optional (owner): the OpenSSF best-practices badge (bestpractices.dev); a lawyer's look at the license.

## Blocked / awaiting decision
- Nothing.

## Open risks
- R-001 unsigned executables, R-002 untested browsers and devices, R-003 AppImage's bundled WebKit,
  R-004 Snowlog's copy drifting (mitigated). Details in [RISKS.md](RISKS.md).

## How to run it
See [SETUP.md](SETUP.md). To run and verify: see its *Daily use* and *Verify* sections.
