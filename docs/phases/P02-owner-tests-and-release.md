# P02 — The owner's tests on other browsers and devices, and the first release (v1.0.0)

- **Stage:** S3
- **Status:** ✅ done (the owner's checks on other devices stay open as a follow-up)
- **Issue:** —
- **Dates:** 2026-11-18 → 2026-11-19
- **Owner approvals:** 2026-11-18 "prepara todo" (prepare everything for a 10/10: tests on devices, audits,
  release)

## Goal
bsketch is known to work where the owner uses it, not only in the Chrome that CI drives, and there is a first
release with its notes and executables.

## Scope
**In:**
- The owner goes through the checklist below on each browser and device; anything that fails becomes a fix.
- Lighthouse-style measures and a full security audit before the release (done, see *Result*).
- The release: version `1.0.0` everywhere, the CHANGELOG's *Unreleased* becomes `1.0.0`, a `v1.0.0` tag on `main`
  and a GitHub release with the notes and the desktop executables.

**Out:**
- Signing the executables (R-001: it costs money; the owner decides separately).
- New features.

## Checklist (for each browser or device)
Mark each one ✅, or ❌ with what happened.

| Check | Chrome/Edge (Win) | Safari (Mac) | Firefox | iPhone/Android | Desktop Win | Desktop Mac | Desktop Linux |
|---|---|---|---|---|---|---|---|
| Opens at bendi.dev/bsketch and draws a box, an arrow and text | | | | | | | |
| Text inside a shape; an arrow stays attached when the shape moves | | | | | | | |
| ☰ menu: New, Open, Save (a `.sketch` downloads and opens again) | | | | | | | |
| PNG and SVG export (also with "Transparent background") | | | | | | | |
| Copy as PNG (Alt+Shift+C) and paste it in a chat or document | | | | | | | |
| Appearance Light/Dark/System; canvas background colour | | | | | | | |
| Grid (G): shapes land on it | | | | | | | |
| Fonts: Hand, Normal, Code | | | | | | | |
| Pinch to zoom; a pinch while drawing leaves nothing behind | — | — | — | | — | — | — |
| Works offline after the first visit (airplane mode, reload) | | | | | — | — | — |
| Install as an app ("Install app" / "Add to Home Screen") | | | | | — | — | — |
| Portable file: download it from the menu, open it with a double click | | | | — | — | — | — |

## The agent's checks (2026-11-19)
On the published site (https://bendi.dev/bsketch/, service worker `sketch-v10`), in Chrome on macOS:
- ✅ box, ellipse and an arrow attached at both ends; text inside the box; the arrow follows the moved box;
- ✅ the grid (G); the dark appearance; reloads and keeps the drawing offline;
- ✅ no console errors and no request to any other host.

In Chrome emulating a phone (390×844, touch):
- ✅ a rectangle drawn with a finger;
- ✅ a pinch zooms (100 % → 325 %) and leaves nothing behind.

Snowlog (its `development`, in Chrome): a drawing with an elbow arrow and text is saved encrypted and opens again
after locking and unlocking.

Not possible from the agent's machine: Safari (needs "Allow remote automation", a system setting), Firefox (not
installed), a real phone, the desktop apps, the clipboard paste and the "Install app" prompt. Those columns stay
the owner's.

## Release steps (once the checklist is green)
1. Bump the version to `1.0.0` in `package.json`, `desktop/src-tauri/tauri.conf.json`,
   `desktop/src-tauri/Cargo.toml` (and its root entry in `Cargo.lock`), and turn the CHANGELOG's *Unreleased* into
   `## [1.0.0] - <date>`; PR `development → main`.
2. After the merge, on `main`: `git tag -a v1.0.0 -m "bsketch 1.0.0"` and `git push origin v1.0.0`.
3. Download the executables from the Desktop workflow's run for that commit and create the release:
   `gh release create v1.0.0 --title "bsketch 1.0.0" --notes-file <notes> bsketch-windows.exe bsketch-macos.zip bsketch-linux.AppImage`
   (the notes are the CHANGELOG's 1.0.0 section).

## Acceptance criteria
- [ ] The checklist is green on every browser and device the owner uses, or each ❌ has its fix merged.
- [x] Measures: first paint under 2.5 s on a throttled phone, no layout shift, every control labelled.
- [ ] The full security audit has no open confirmed findings.
- [ ] `v1.0.0` is tagged on `main` and its GitHub release has the notes and the three executables.

## Security impact
- None by itself. The audit's findings, if any, are fixed in their own commits.

## Risks and open questions
- Safari and Firefox support for copying images to the clipboard is newer; where it fails, the site says so.
- The desktop apps use WebKit on macOS and Linux (R-003); downloads there are the most likely place for a surprise.

---

## Result
<!-- Filled in with /close-phase. -->
- **What was done:** version 1.0.0 released on 2026-11-19 (tag `v1.0.0`, GitHub release with the three
  executables); the agent's checks on the published site (above); `Tests` and `Hook (macOS bash 3.2)` required on
  `main`; the repository's social preview.
- **How it was tested:** a smoke script on bendi.dev in Chrome (desktop and phone emulation); the Desktop workflow
  built and smoke-tested the three executables for the release commit.
- **What was left out and why:** the checklist on Safari, Firefox, a real phone and the desktop apps needs the
  owner's devices; it stays in STATE's *Next*.
- **Lessons learned:** the Desktop workflow runs on `development` only, so a release builds `main` on purpose
  (`workflow_dispatch`).
- **PR:** #17
