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
| S4 | 1.2.0: what only bsketch does | Text to diagram offline, quick flowcharts, animated arrows, Excalidraw export, lock, search, styles; released | ✅ |
| S5 | 1.3.0: frames you can present | Frame clipping, presentation mode with a laser, arrows curved by hand; released | ✅ |
| S6 | 1.4.0: everywhere it's used | Snowlog on the 1.3 engine with library and templates; the owner's device checklist green (or fixed); three more languages | ⏳ |
| S7 | 1.5.0: presenting and sharing | Speaker notes and timer; PDF with a frame per page; elbow connectors that go around shapes | ⏳ |
| S8 | 2.0.0: final | Signed apps; full security, accessibility and performance audits with no open findings; help inside the app; the `.sketch` format frozen with a compatibility promise | ⬜ |

Legend: ⬜ not started · ⏳ in progress · ✅ done

S0–S2 were done before the project adopted the template (2026-11-13 to 2026-11-17): their history is in
[CHANGELOG.md](../CHANGELOG.md), the PRs (#2–#5) and the worklog's first entries, not in phase files.

## S3 — Release

| Phase | What | Status |
|---|---|---|
| P01 | Adopt project-template 1.0.0, everything in English | ✅ |
| P02 | [Owner's tests on other browsers and devices, fixes, and the first release (`v1.0.0`)](phases/P02-owner-tests-and-release.md) | ✅ |
| P03 | [Options menu: appearance, canvas background, transparent export](phases/P03-options-menu.md) | ✅ |
| P04 | [Grid and snapping (new shapes and moves first)](phases/P04-grid-and-snapping.md) | ✅ |
| P05 | [Everyday comfort: ask before opening, file shortcuts, copy as PNG, arrowheads](phases/P05-everyday-comfort.md) | ✅ |
| P06 | [Text fonts: Hand, Normal, Code](phases/P06-text-fonts.md) | ✅ |
| P07 | [Everyday use: several drawings, elbow and curved arrows, export the selection, grid on resize, Spanish](phases/P07-everyday-use.md) | ✅ |
| P08 | [Quality, pictures, frames and a library](phases/P08-like-excalidraw.md) | ✅ |

## S4 — 1.2.0: what only bsketch does

The aim: the whiteboard you can use for confidential diagrams (nothing leaves your computer, it works where nothing can
be installed, and that can be checked), and quick to draw with. No real-time collaboration and no cloud AI: they
would break that.

| Phase | What | Status |
|---|---|---|
| P09 | [Text to diagram, offline and without AI: an indented list or simple Mermaid pasted becomes boxes and arrows](phases/P09-text-to-diagram.md) | ✅ |
| P10 | [Quick diagrams: Ctrl+arrow keys chain the next shape with an arrow; starter templates](phases/P10-quick-diagrams.md) | ✅ |
| P11 | [Animated flow arrows (on screen and in the exported SVG)](phases/P11-animated-arrows.md) | ✅ |
| P12 | [Export to `.excalidraw`; Snowlog updated with the new engine](phases/P12-excalidraw-export-snowlog.md) | ✅ |
| P13 | [Lock, search and more styles](phases/P13-lock-search-styles.md) | ✅ |

## S5 — 1.3.0: frames you can present

| Phase | What | Status |
|---|---|---|
| P14 | [Frames clip what they hold (on screen and in exports)](phases/P14-frame-clipping.md) | ✅ |
| P15 | [Presentation mode: frames one by one, full screen, with a laser pointer](phases/P15-presentation.md) | ✅ |
| P16 | [Curve an arrow by hand: drag its middle](phases/P16-bend-arrows.md) | ✅ |

## S6 — 1.4.0: everywhere it's used

| Phase | What | Who | Status |
|---|---|---|---|
| P17 | [Snowlog on the 1.3 engine (frame clipping, presentation, bent arrows); its e2e driver starts Chrome like bsketch's](phases/P17-snowlog-engine-1-3.md) | Agent | ✅ |
| P18 | [Library and templates in Snowlog, kept encrypted in the vault like any note](phases/P18-snowlog-library-templates.md) | Agent | ✅ |
| P19 | The owner's checklist (P02) on Safari, Firefox, a real phone and the three desktop apps; every ❌ fixed in a 1.3.x | Owner, then agent | ⬜ |
| P20 | [Catalan, French and Portuguese (the translation system is ready: strings and a test that nothing is left in English)](phases/P20-languages.md) | Agent | ✅ |

## S7 — 1.5.0: presenting and sharing

| Phase | What | Who | Status |
|---|---|---|---|
| P21 | [Speaker notes per frame (seen only by the presenter) and a timer in presentation mode](phases/P21-speaker-notes.md) | Agent | ✅ |
| P22 | [PDF export with one frame per page, made in the browser with no library](phases/P22-pdf-export.md) | Agent | ✅ |
| P23 | [Smart connectors: elbow arrows that route around the shapes in their way](phases/P23-smart-connectors.md) | Agent | ✅ |

## S8 — 2.0.0: final

"Final" means: nothing important missing for its purpose, nothing known broken, and a promise that what is saved
today opens tomorrow. After 2.0 only fixes and small improvements (2.0.x, 2.x).

| Phase | What | Who | Status |
|---|---|---|---|
| P24 | Signed apps: macOS signed and notarized (Apple Developer Program), Windows signed (a code-signing certificate or Azure Trusted Signing) | Owner (accounts, cost), then agent (workflow) | ⬜ |
| P25 | [Audits before 2.0: a full security audit and a long fuzz campaign; accessibility (WCAG 2.2 AA, keyboard and screen reader); performance with 10,000 elements and big pictures; every finding fixed](phases/P25-audits.md) | Agent, owner reviews | ⏳ |
| P26 | [Help inside the app: a short guide and every shortcut, in each language, offline](phases/P26-in-app-help.md) | Agent | ✅ |
| P27 | [Freeze: `.sketch` format version 1 documented and promised to open in every later version (tests with saved files from each release); support policy; the `v2.0.0` release](phases/P27-format-freeze.md) | Agent, owner releases | ⏳ |

### Exit criterion for 2.0.0
- [ ] S6 and S7 done and released.
- [ ] The owner's checklist green on every browser and device listed in P02.
- [ ] Apps signed on macOS and Windows (or the owner decides, in a decision record, to ship them unsigned).
- [ ] No open security, accessibility or performance findings; Dependabot and code scanning with no open alerts.
- [x] Files saved by every release since 1.0 open in 2.0 (tested: `tests/format.test.mjs`).
- [x] Help inside the app in every language.
