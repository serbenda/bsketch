# bsketch status

> **Single source of truth for status.** Claude reads it at the start of every session (`/status`) and updates it when closing a phase (`/close-phase`).
> At most **150 lines**: replace what is outdated instead of piling up, and **link** documents instead of copying them.

Last updated: 2026-11-19

## Where we are
- **Mode:** full
- **Current stage:** S3 — Release (see [ROADMAP](ROADMAP.md))
- **Phase in progress:** [P02 — the owner's tests and v1.0.0](phases/P02-owner-tests-and-release.md)
- **Environment:** GitHub Pages (published by the Pages workflow on `main`), the portable file, and desktop builds as CI artifacts
- **Working branch:** `development`

## Current work
- P02: version 1.0.0 prepared; the agent checked the published site in Chrome (desktop and phone emulation). The
  owner's devices remain, then the `v1.0.0` tag and release.

## Recently done
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
1. Owner: P02's checklist on other browsers and devices ([P02](phases/P02-owner-tests-and-release.md)); then
   `v1.0.0` (notes drafted outside the repo).

## Blocked / awaiting decision
- Nothing.

## Open risks
- R-001 unsigned executables, R-002 untested browsers and devices, R-003 AppImage's bundled WebKit,
  R-004 Snowlog's copy drifting (mitigated). Details in [RISKS.md](RISKS.md).

## How to run it
See [SETUP.md](SETUP.md). To run and verify: see its *Daily use* and *Verify* sections.
