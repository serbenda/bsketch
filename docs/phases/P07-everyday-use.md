# P07 — Everyday use: several drawings, routes, export the selection, grid on resize, Spanish

- **Stage:** S3
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-19 → 2026-11-19
- **Owner approvals:** 2026-11-19 "haz uso diario, calidad y detalles"

## Goal
bsketch is comfortable for daily use: more than one drawing at a time, arrows that route around, exporting a part
of the drawing, the grid everywhere, and an interface in the owner's language.

## Scope
**In:**
- **Several drawings** in the browser (`js/drawings.js`): a list in the ☰ menu to create, open, rename and delete
  them. The open one stays in `sketch.current`; the others under `sketch.drawing.<id>`; `sketch.drawings` is the
  index. Opening a file makes a new drawing instead of replacing the open one; saving uses the drawing's name.
- **Routes** for arrows and lines with two points: straight (default, not stored), elbow and curve; used to paint,
  measure, hit-test and export; read from Excalidraw's `elbowed` arrows.
- **Export only the selection** to PNG and SVG.
- **Grid** on resizes (not on rotated shapes) and dragged line ends; rotation in 15° steps while it is shown.
- **Languages** (`js/i18n.js`): English and Spanish, `auto` takes the browser's; the pref is `lang` in
  `sketch.prefs`.

**Out:**
- Elbow routes with more than one turn or that avoid shapes; more languages; syncing drawings between browsers.

## Acceptance criteria
- [x] Drawings survive a reload, switching keeps each one's content, deleting the open one opens the next.
- [x] A broken or hostile index in storage starts again from the open drawing; ids and names are validated.
- [x] Elbow and curve arrows keep their route after Save/Open and attach to shapes.
- [x] Export with "Only the selection" contains only the selected elements.
- [x] With the menu in Spanish no English words are left in the interface.
- [x] `npm test` (32 pass) and `npm run test:e2e` (16 pass).

## Security impact
- Two new storage keys, validated on read (THREAT_MODEL updated); names are shown with `textContent`. One more
  validated element field, `route`, from a fixed list. No network, files or dependencies; CSP unchanged.

## Risks and open questions
- Browser storage is limited (about 5 MB): many big drawings may not fit; the user is told to delete some.

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** unit tests for routes, the drawings index and languages; e2e walkthroughs for several
  drawings, elbow arrows, exporting the selection, resizing on the grid and the Spanish menu (the test browser is
  forced to English so `auto` is stable).
- **What was left out and why:** as in *Out*.
- **Lessons learned:** tests that read interface text need a fixed browser language once `auto` exists.
- **PR:** see the development → main PR.
