# P14 — Frames clip what they hold

- **Stage:** S5
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the 1.3 ideas; 2026-11-20 "haz el siguiente parte"

## Goal
A frame reads like a slide or an artboard: what belongs to it is cut at its border, on screen and in every export,
so it can be laid out freely and presented as it looks.

## Scope
**In:**
- An element **belongs** to a frame when its centre lies inside it (the smallest frame, when frames nest). Moving a
  frame carries what belongs to it, and the frames inside it.
- What belongs to a frame is **clipped** to it on the canvas, in PNG and in both SVG exports (a `clipPath` per frame).
- The `.excalidraw` export sets `frameId` from the same rule.

**Out:**
- A switch to turn clipping off; hit-testing only the visible part of a clipped element.

## Acceptance criteria
- [x] An element half outside its frame is cut at the border on screen, in SVG and PNG; one whose centre is outside
  is not clipped.
- [x] Moving a frame moves what belongs to it (also partly outside) and the frames inside it.
- [x] Nested frames clip to the smallest one.
- [x] `npm test` and `npm run test:e2e` pass.

## Security impact
- None: no new input or stored field.

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** a unit test for membership by centre, nested frames, what a frame carries, the SVG clip
  paths and the `.excalidraw` `frameId`; e2e reads the canvas: a solid box is blue inside its frame and background
  past the border, and moves with the frame.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** deciding membership by the centre (not "wholly inside") is what makes clipping visible, and
  needs nothing stored: it follows the drawing as it changes.
- **PR:** see the development → main PR.
