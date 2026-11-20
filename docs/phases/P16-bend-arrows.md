# P16 — Curve an arrow by hand

- **Stage:** S5
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the 1.3 plan; 2026-11-20 "Sí, sigue"

## Goal
An arrow or a line bends as much as wanted, to either side, by dragging its middle: the curve goes through where it
is dropped.

## Scope
**In:**
- A **middle handle** on a selected straight or curved arrow or line (two points). Dragging it makes the line a curve
  that passes through the pointer; bringing it back near the straight line makes it straight again.
- Stored as `bend` (how far the curve's control point sits from the middle, as a share of the length, signed), only
  on curves and only when it isn't the default (0.25); validated (a finite number within ±2).
- Attached arrows keep their ends on their shapes while bent; exports and `.excalidraw` follow the curve.

**Out:**
- Lines with more points (bending one segment), elbow lines with a moved elbow.

## Acceptance criteria
- [x] Dragging the middle handle bends the line through the pointer, to either side; near straight it is straight
  again; one undo step undoes the drag.
- [x] `bend` survives Save/Open; a hostile value is dropped or clamped; choosing Straight or Elbow drops it.
- [x] `npm test` and `npm run test:e2e` pass.

## Security impact
- One more validated number, clamped like coordinates.

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** a unit test for `bendThrough` (the curve's middle lands on the point, either side, clamped),
  `midPoint`, validation and Save/Open; the fuzz checks learnt `bend`; e2e bends a drawn arrow through the pointer,
  undoes and redoes it, and drags it back straight; a screenshot.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** for a quadratic curve the middle point is halfway between the chord's middle and the control
  point, so "through the pointer" is twice the pointer's offset.
- **PR:** see the development → main PR.
