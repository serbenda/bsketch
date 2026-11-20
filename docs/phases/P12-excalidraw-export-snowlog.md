# P12 — Export to Excalidraw; Snowlog with the new engine

- **Stage:** S4
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the 1.2.0 plan (export to `.excalidraw`, Snowlog up to date); 2026-11-20 "continua"

## Goal
Drawings move freely between bsketch and Excalidraw in both directions, and Snowlog's notes get everything 1.2.0
adds.

## Scope
**In:**
- `toExcalidraw(scene)` in `js/scene.js` and a `.excalidraw` button in the ☰ menu's Export (it also honours "Only the
  selection"): shapes, texts in shapes, fonts, arrowheads, attached arrows (with the shapes' `boundElements`),
  groups, frames (`frameId`), pictures (`files`), rotation, styles and the background. Elbow and curved routes go as
  the points they are drawn through; animation has no equivalent.
- Snowlog: `scripts/update-sketch.mjs` also copies `textdiagram.js`; the engine copy refreshed; its service worker
  caches the new file.

**Out:**
- Excalidraw's elbow-arrow segments (sent as plain points); bsketch's library and templates in Snowlog (they need a
  store Snowlog doesn't give the editor yet).

## Acceptance criteria
- [x] A scene exported and opened again keeps its shapes, texts, fonts, arrows and bindings, groups, frames, pictures,
  rotation and background (unit test).
- [x] The menu downloads `<drawing name>.excalidraw` with attached arrows (e2e).
- [x] Snowlog: tests pass; a Mermaid diagram pasted on a drawing is drawn, saved encrypted and opens again.

## Security impact
- None new: the export writes JSON of already validated elements; opening it again goes through `parseScene`.

---

## Result
- **What was done:** everything in scope; Snowlog's PR is serbenda/snowlog#8.
- **How it was tested:** a round-trip unit test; an e2e test of the menu export; Snowlog's 163 unit and 5 e2e tests
  and a check by eye in Chrome.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** Excalidraw needs bindings on both sides (`startBinding` on the arrow and `boundElements` on
  the shape); keeping them in one pass over the scene avoids missing either.
- **PR:** see the development → main PR.
