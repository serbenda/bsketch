# sketch status

> **Single source of truth for status.** Claude reads it at the start of every session (`/status`) and updates it when closing a phase (`/close-phase`).
> At most **150 lines**: replace what is outdated instead of piling up, and **link** documents instead of copying them.

Last updated: 2026-11-17

## Where we are
- **Mode:** full
- **Current stage:** S3 — Release (see [ROADMAP](ROADMAP.md))
- **Phase in progress:** none; next is [P03 — Options menu](phases/P03-options-menu.md), plan awaiting the owner's approval
- **Environment:** GitHub Pages (published by the Pages workflow on `main`), the portable file, and desktop builds as CI artifacts
- **Working branch:** `development`

## Current work
- [P03](phases/P03-options-menu.md) planned (appearance, canvas background, transparent export) and challenged;
  the grid goes to P04. No code until the owner approves the plan.

## Recently done
- [P01](phases/P01-adopt-project-template.md): the template's guardrails and docs, everything in English (PR #5).
- New logo (a hand-drawn "s" on night blue), a README banner and the README rewritten for visitors.
- Portable single-file version and Tauri desktop builds for Windows, macOS and Linux (PR #5).
- Keyboard use, smoother large drawings and `mergeScenes` for Snowlog (PR #4).
- Text inside shapes, attached arrows, rotation, groups, alignment, offline use (PR #3).

## Next
1. Owner: approve P03's plan; then P03 and P04 on `development`.
2. Owner: review and merge the `development → main` PR with the logo, banner and README.
3. Owner: re-run `./scripts/setup-repo.sh` on his Mac for the rules of `main`.
4. Owner: try the site and the desktop builds on Firefox, Safari, a real phone, macOS and Windows (P02, [R-002](RISKS.md)).
5. Optional (owner, `.github/`): pin the `editorconfig-checker` binary; its download hits GitHub's rate limit now and then.
6. Decide whether the interface's accent colour (`--accent`, still the old purple) should match the new logo.
7. Owner: set `docs/images/banner.png` as the repository's social preview (Settings → General).

## Blocked / awaiting decision
- P03's plan, awaiting the owner's approval.

## Open risks
- R-001 unsigned executables, R-002 untested browsers and devices, R-003 AppImage's bundled WebKit,
  R-004 Snowlog's copy drifting (mitigated). Details in [RISKS.md](RISKS.md).

## How to run it
See [SETUP.md](SETUP.md). To run and verify: see its *Daily use* and *Verify* sections.
