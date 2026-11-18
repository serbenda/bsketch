# P04 — Grid and snapping

- **Stage:** S3
- **Status:** ⬜ planned
- **Issue:** —
- **Dates:** 2026-11-18 → —
- **Owner approvals:** 2026-11-17 the grid among the options asked for (moved here from P03)

## Goal
Diagrams line up without effort: with the grid on, new shapes and moved elements land on it, and the grid is drawn
lightly behind the drawing.

## Scope
**In:**
- A **Grid** switch in the side menu (Canvas section) and the **G** key (plain G is free; Ctrl+G stays "group").
  Off by default; remembered in this browser (`sketch.prefs.grid`, validated like the appearance).
- The grid is drawn on the editor's canvas only: lines every 20 drawing units and a slightly stronger one every
  100, in a neutral grey that reads in light and dark appearance. It follows zoom and pan and is hidden when its
  cells would be under 6 px on screen. **Never exported** (PNG, SVG, `.sketch` are unchanged).
- **Snapping while the grid is on:**
  - New rectangles, diamonds, ellipses: both corners on the grid (Shift for a fixed ratio still works).
  - New lines and arrows: both ends on the grid, except an end that attaches to a shape (attaching wins).
  - New text: its top-left corner on the grid.
  - Moving a selection (mouse): the selection's top-left corner lands on the grid; everything moves by the same
    amount, so groups and attached arrows keep their shape.
  - Arrow keys move by one grid cell; Shift+arrow moves 1 px for fine adjustment (see the open question).
- The editor's API gains `setGrid(on)`, so Snowlog can offer the same switch later.

**Out:**
- Snapping while **resizing** or **rotating** (a next step if the owner wants it).
- Snapping to other elements (alignment guides), the pencil, a configurable grid size, a grid in exports.
- A modifier key to skip the snap for one move (Alt+drag moves windows on many Linux desktops; turn the grid off
  with G instead).

## Acceptance criteria
- [ ] The Grid switch and the G key turn the grid on and off; the choice survives a reload; a stored value that is
  not `true`/`false` falls back to off.
- [ ] With the grid on, a new rectangle drawn from (13, 27) to (118, 92) is stored at x 20, y 20, w 100, h 80.
- [ ] A new arrow from one shape to empty space keeps its start attached and its free end on the grid.
- [ ] Moving a selection with the mouse leaves its top-left corner on the grid; the elements inside keep their
  positions relative to each other.
- [ ] With the grid off, nothing changes compared with today (existing walkthroughs pass unchanged).
- [ ] PNG, SVG and `.sketch` exports are byte-for-byte the same with the grid on or off.
- [ ] Unit tests for the snap function and for the preference; an e2e walkthrough drawing and moving with the grid;
  `npm test`, `npm run test:e2e` and the portable build pass.

## Plan
1. `js/scene.js`: `snap(v, size)` and `snapPoint(p, size)` (pure), with unit tests.
2. `js/prefs.js`: `grid` (boolean, default false) in `cleanPrefs`; unit tests for bad values.
3. `js/editor.js`: a `grid` flag and `setGrid`; draw the grid in `render()` before the elements (editor canvas only,
   skipped when the cells are too small); snap in the `create` action (start and current point), the text tool and
   the `move` action (snap the delta so the selection's top-left corner lands on the grid); arrow keys by one cell;
   the G key.
4. `index.html` / `js/app.js`: a "Show grid" switch in the menu's Canvas section, kept in `sketch.prefs`.
5. e2e walkthrough: turn the grid on with G, draw a box at odd coordinates, check it landed on the grid; move it;
   reload and check the switch is still on.
6. Docs: README (shortcuts table: G), ARCHITECTURE (prefs gains `grid`), THREAT_MODEL (the stored value),
   CHANGELOG, WORKLOG, STATE.

## Security impact
- None new beyond one more stored preference: `sketch.prefs.grid` is read back only if it is a boolean (unit
  tested). No new input from files, no network, no dependency, CSP unchanged.

## Risks and open questions
- **Arrow keys with the grid on:** one cell per press, and Shift for 1 px fine adjustment? Or keep today's 1 px /
  Shift 10 px and ignore the grid? Proposal: one cell, Shift = 1 px.
- **Grid size:** 20 units is a common default; not configurable in this phase.
- Snapping the selection's corner (not each element) keeps groups intact but means a single rotated shape snaps by
  its bounding box, not its own corner. Acceptable for now.
- VISION says not to chase Excalidraw parity; the grid was asked for by the owner (2026-11-17).

---

## Result
<!-- Filled in with /close-phase. -->
- **What was done:**
- **How it was tested:**
- **What was left out and why:**
- **Lessons learned:**
- **PR:** #
