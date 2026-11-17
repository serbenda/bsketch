# sketch status

> **Single source of truth for status.** Claude reads it at the start of every session (`/status`) and updates it when closing a phase (`/close-phase`).
> At most **150 lines**: replace what is outdated instead of piling up, and **link** documents instead of copying them.

Last updated: 2026-11-17

## Where we are
- **Mode:** full
- **Current stage:** S3 — Release (see [ROADMAP](ROADMAP.md))
- **Phase in progress:** [P01 — Adopt project-template 1.0.0, everything in English](phases/P01-adopt-project-template.md)
- **Environment:** GitHub Pages (once enabled), the portable file, and desktop builds as CI artifacts
- **Working branch:** `development`

## Current work
- [P01](phases/P01-adopt-project-template.md): code, UI and docs in English, template docs filled in and the
  guardrails committed (at the owner's request, by the agent). Waiting for CI and the owner's review on the PR.

## Recently done
- Portable single-file version and Tauri desktop builds for Windows, macOS and Linux (PR #5).
- Keyboard use, smoother large drawings and `mergeScenes` for Snowlog (PR #4).
- Text inside shapes, attached arrows, rotation, groups, alignment, offline use (PR #3).
- First version: hand-drawn whiteboard, `.excalidraw` import, PNG/SVG export (PR #2).

## Next
1. Owner: fix GitHub Actions billing (jobs are not starting), then review and merge the P01 PR.
2. Owner: enable GitHub Pages (Settings → Pages → Source: GitHub Actions) and re-run `./scripts/setup-repo.sh`.
3. Owner: try the site and the desktop builds on Firefox, Safari, a real phone, macOS and Windows ([R-002](RISKS.md)).
4. Migrate Snowlog to the template; update its `scripts/update-sketch.mjs` for the new file names ([R-004](RISKS.md)).

## Blocked / awaiting decision
- GitHub Actions doesn't start jobs: "recent account payments have failed or your spending limit needs to be
  increased" (owner: Settings → Billing). sketch is private, so its minutes are billed: public or private is the
  owner's call.

## Open risks
- R-001 unsigned executables, R-002 untested browsers and devices, R-003 AppImage's bundled WebKit,
  R-004 Snowlog's copy drifting. Details in [RISKS.md](RISKS.md).

## How to run it
See [SETUP.md](SETUP.md). To run and verify: see its *Daily use* and *Verify* sections.
