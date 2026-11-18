# bsketch status

> **Single source of truth for status.** Claude reads it at the start of every session (`/status`) and updates it when closing a phase (`/close-phase`).
> At most **150 lines**: replace what is outdated instead of piling up, and **link** documents instead of copying them.

Last updated: 2026-11-17

## Where we are
- **Mode:** full
- **Current stage:** S3 — Release (see [ROADMAP](ROADMAP.md))
- **Phase in progress:** [P02 — the owner's tests and v1.0.0](phases/P02-owner-tests-and-release.md)
- **Environment:** GitHub Pages (published by the Pages workflow on `main`), the portable file, and desktop builds as CI artifacts
- **Working branch:** `development`

## Current work
- P05 done (ask before opening, Ctrl+S/O, copy as PNG, arrowheads); P04 and P05 go to `main` together.

## Recently done
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
1. Owner, in GitHub (from the repo posture review, 2026-11-18):
   - run `./scripts/setup-repo.sh` as admin: `main` has **no protection** today, and secret scanning, push
     protection, Dependabot alerts and private vulnerability reporting are off (SECURITY.md says otherwise);
   - Settings → Pages → Source: **GitHub Actions** (today the legacy build publishes the whole `main`, so the
     portable file is a 404 and files like `CLAUDE.md` are served); and Enforce HTTPS;
   - Settings → Actions → General: allow only GitHub's and selected actions, require full-SHA pinning;
   - add `Tests` and `Hook (macOS bash 3.2)` to the required checks.
2. Owner: pin `editorconfig-checker` in CI (a script is ready; its download hits GitHub's rate limit).
3. Owner: P02's checklist on other browsers and devices ([P02](phases/P02-owner-tests-and-release.md)); then
   `v1.0.0`.
4. Owner: set `docs/images/banner.png` as the repository's social preview; point Snowlog's update script to
   `serbenda/bsketch`.

## Blocked / awaiting decision
- Nothing.

## Open risks
- R-001 unsigned executables, R-002 untested browsers and devices, R-003 AppImage's bundled WebKit,
  R-004 Snowlog's copy drifting (mitigated). Details in [RISKS.md](RISKS.md).

## How to run it
See [SETUP.md](SETUP.md). To run and verify: see its *Daily use* and *Verify* sections.
