# P03 — Options menu: appearance, canvas background, transparent export

- **Stage:** S3
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-17 → 2026-11-18
- **Owner approvals:** 2026-11-17 "make it possible to change some options without going to Windows or whatever, like
  Excalidraw does" and the four options chosen (theme, canvas background, export without background, grid; the grid
  goes to P04); 2026-11-18 "a side menu with New, Open, Save, PNG…" (the plan approved, with the file actions
  moved into a side menu)

## Goal
The common settings live inside the app: the owner can make the canvas white (or dark) without changing the
system theme, pick the canvas colour and export without a background.

## Scope
**In:**
- A **Menu** button (☰) in the site's header that opens an options panel (a native `<dialog>`, keyboard and screen
  reader friendly, closes with Escape). Our own icon and wording.
- **Appearance** first in the panel: Light · Dark · System (default). Applies to the page, the editor's toolbars and
  panels and the canvas, whatever the system theme is; remembered in this browser (`localStorage`, key
  `sketch.prefs`).
- **Canvas background:** six swatches (white, paper, light grey, light blue, light yellow, light green). Saved with
  the drawing (`scene.background`, already in the format and in PNG/SVG export) and undoable. When the appearance is
  dark, a note says the canvas is shown inverted on screen and exports keep the real colour.
- **Transparent export:** a "Transparent" toggle next to the PNG and SVG buttons, visible every time; PNG and SVG
  then come out without a background. Not remembered between visits.
- The editor's API gains what the site needs (`setTheme`), so Snowlog can use the same options later without changes
  to the engine's format.

**Out:**
- The grid and snapping: P04, right after this phase (new shapes and moves first).
- A free colour picker (in dark appearance it would show a different colour from the canvas).
- Language, zen or view-only mode, libraries, other export sizes. Snowlog's copy (its own phase, with
  `scripts/update-sketch.mjs`).

## Acceptance criteria
- [x] System dark + Light: page, toolbars and canvas are light, and stay so after a reload.
- [x] System light + Dark: page, toolbars, panels and canvas are dark.
- [x] Choosing a canvas colour changes the canvas, survives a reload and Save/Open, can be undone, and appears in PNG
  and SVG; in dark appearance the note is shown and the export keeps the real colour.
- [x] With Transparent on, the PNG has transparent pixels outside the shapes and the SVG has no background rectangle;
  after a reload it is off again.
- [x] The panel works with the keyboard only (open, move through the options, change them, close with Escape) and
  every control has a label.
- [x] Unit tests for the preferences (bad or missing stored values fall back to defaults) and for the background
  command; an e2e walkthrough through the panel; `npm test`, `npm run test:e2e` and the portable build pass.

## Plan
1. `js/prefs.js`: read and write `sketch.prefs` (appearance), validating every value and falling back to defaults;
   unit tests.
2. Appearance: the dark colours of `css/sketch.css` and `css/styles.css` also apply under a forced dark class, and the
   light ones under a forced light class; the site sets them; "System" keeps following `prefers-color-scheme`.
3. Background: an editor command that changes `scene.background` as an undoable step; the swatches' values go
   through the same colour validation as files.
4. Export: `exportPNG`/`exportSVG` take a `background` option (the PNG path already has one); the toggle next to the
   buttons passes it.
5. The menu button and `<dialog>` in `index.html`, styles in both appearances, phone layout checked; e2e walkthrough.
6. Docs: README, ARCHITECTURE (prefs), THREAT_MODEL (the new storage key), ROADMAP (P03, P04), WORKLOG.

## Security impact
- New input: the stored preferences. Only known values are accepted; colours come from a fixed list and still pass
  the existing colour check; nothing is set with `innerHTML`.
- New browser storage key `sketch.prefs` with one setting, no personal data; added to THREAT_MODEL's table.
- No network, no new dependency, CSP unchanged.

## Risks and open questions
- Snowlog embeds the editor: forcing light or dark must keep working there (it already passes `sk-light`/`sk-dark`).
- VISION says not to chase parity with Excalidraw; these options were asked for by the owner.
- Challenge on the first draft (UX and scope lens), and what changed: Appearance first, since it is what makes the
  canvas white on a dark system; dark colours for toolbars and panels when Dark is forced (the CSS only had them for
  the system's dark mode); transparent export visible next to the buttons and not remembered; no free colour picker
  (it shows a different colour from an inverted canvas); the grid moved to P04 (it touches drawing, moving, resizing
  and arrows); no Alt modifier to skip the snap (Alt+drag moves windows on many Linux desktops).

---

## Result
<!-- Filled in with /close-phase. -->
- **What was done:** a ☰ button in the header opens a side menu (a modal `<dialog>` on the left) with the file
  actions that used to be header buttons (New, Open, Save, PNG, SVG, Portable), a "Transparent background" toggle
  for PNG and SVG, Appearance (System · Light · Dark, kept in `sketch.prefs`) and six canvas colours (saved with the
  drawing and undoable: undo steps now keep the background too). The editor gained `setTheme` and `setBackground`;
  the forced dark colours now also apply to the editor's toolbars and panels (`sk-dark`) and the page
  (`data-theme`).
- **How it was tested:** `npm test` 23 pass (preferences, colour check of the swatches, SVG without background);
  `npm run test:e2e` 11 pass, with a new walkthrough on a dark system: keyboard open and Escape, Light that survives
  a reload, canvas colour saved and undone. Checked by eye in the browser on a dark system, light and dark, desktop
  and phone width. The transparent PNG is covered by its code path (`paintScene` without background), not by a
  pixel test.
- **What was left out and why:** the grid (P04, as planned). Keyboard shortcuts for Save/Open (not asked for).
- **Lessons learned:** the owner wanted the file actions out of the header too: one menu for files and options.
- **PR:** #
