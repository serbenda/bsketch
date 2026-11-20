# P11 — Animated flow arrows

- **Stage:** S4
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the 1.2.0 plan (animated arrows, from Excaliflow); 2026-11-20 "continua"

## Goal
An arrow or a line can show what flows along it: a dash pattern that moves in its direction, on screen and in the
exported SVG, so architecture and data-flow diagrams read at a glance.

## Scope
**In:**
- A **Flow** choice (Still / Animated) in the style panel for arrows and lines; stored as `animated: true` only
  when on; validated on open.
- On screen: the line is dashed and its dashes move from start to end (about 30 frames a second, only while an
  animated element is visible and the page is shown; still for people who ask for reduced motion).
- SVG export (file and DOM): the same dashes, animated with SVG's own `<animate>` (no script, works offline); PNG
  and Copy as PNG: the dashes, still.

**Out:**
- Speeds or directions to choose; moving dots or particles; animation in `.excalidraw` files (no equivalent).

## Acceptance criteria
- [x] Choosing Animated on a selected arrow (or before drawing one) stores it; Still removes it; only arrows and
  lines take it; a hostile value in a file is dropped.
- [x] The dashes move on screen and stop when nothing animated is left; reduced motion keeps them still.
- [x] The exported SVG carries an `<animate>` on the arrow's line only (not its head); the PNG is made as before.
- [x] `npm test` and `npm run test:e2e` pass.

## Plan
1. `js/scene.js`: `animated` in `createElement`, `cleanElement`; the line's draw op marked `flow`.
2. `js/render.js`: dash offset from the time; `<animate>` in both SVG exports.
3. `js/editor.js`: the Flow choice; the repaint loop while something animated is visible; reduced motion.
4. Tests, screenshots, docs.

## Security impact
- One more validated boolean. The SVG `<animate>` is fixed markup with numbers only (no script, no URL).

## Risks and open questions
- A repaint loop costs battery: it runs only while an animated element is on screen and the tab is visible.

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** a unit test for the validation, the flowing line (not its head) and the SVG `<animate>`;
  e2e draws an animated arrow, checks the canvas changes on its own, stays still with reduced motion emulated and
  drops the property with Still; screenshots in Spanish.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** the repaint loop only needs a timer while something animated is visible; the browser already
  pauses animation frames in hidden tabs.
- **PR:** see the development → main PR.
