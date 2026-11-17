# Roadmap

> **A single numbering system:** stages `S0, S1, S2…` and, within each, phases `P01, P02…` (global numbering, never reset).
> A stage ends when its **exit criterion** is met, which must be checkable, not a feeling.
> If the plan changes, edit this file and explain it in a [decision](decisions/).

| Stage | Goal | Exit criterion | Status |
|---|---|---|---|
| S0 | Define | VISION written, stack decided (ADR), local environment running and verifiable (`docs/SETUP.md`) | ✅ |
| S1 | Minimal core | Draw, select, move, resize, undo, open `.excalidraw`, save and export PNG/SVG, in the browser with no network | ✅ |
| S2 | Everyday diagrams | Text inside shapes, attached arrows, rotation, groups, alignment, keyboard use, offline, portable file and desktop builds, with e2e walkthroughs in CI | ✅ |
| S3 | Release | Site on GitHub Pages; tested by the owner on Chrome, Firefox, Safari, a phone, macOS and Windows; no High risks open; the repo on the template's guardrails | ⏳ |

Legend: ⬜ not started · ⏳ in progress · ✅ done

S0–S2 were done before the project adopted the template (2026-11-13 to 2026-11-17): their history is in
[CHANGELOG.md](../CHANGELOG.md), the PRs (#2–#5) and the worklog's first entries, not in phase files.

## S3 — Release

| Phase | What | Status |
|---|---|---|
| P01 | Adopt project-template 1.0.0, everything in English | ⏳ |
| P02 | Owner's tests on other browsers and devices, fixes, and the first release (`v0.4.0`) | ⬜ |
| P03 | [Options menu: appearance, canvas background, transparent export](phases/P03-options-menu.md) (plan awaiting the owner's approval) | ⬜ |
| P04 | Grid and snapping (new shapes and moves first) | ⬜ |
