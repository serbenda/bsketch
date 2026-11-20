# P23 — Elbow connectors that go around shapes

- **Stage:** S7
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-21 → 2026-11-21
- **Owner approvals:** 2026-11-20 the road to 2.0; 2026-11-21 "Sí, sigue"

## Goal
An elbow arrow between two shapes reads like a diagramming tool's connector: it leaves a shape from the side facing
the other, and finds a right-angled way around the shapes in between, with as few turns as it can.

## Scope
**In:**
- Elbow arrows and lines attached to a shape leave it (and arrive) at the middle of the side that faces the other end.
- Their path is worked out among the shapes nearby (rectangles, diamonds, ellipses, pictures; each with a margin) on an
  orthogonal grid, shortest with a cost per turn; nothing is stored (it follows the drawing as it changes), and when no
  way is found the plain elbow is drawn.
- The same path on screen, in hit-testing and in every export.

**Out:**
- Dragging a segment of the path by hand; avoiding texts, lines and frames.

## Acceptance criteria
- [x] An elbow arrow between two boxes with a third box in the way goes around it, with right angles only.
- [x] Without anything in the way it stays a simple elbow; moving a shape re-routes it.
- [x] A big drawing stays fast (routing only looks at shapes near the arrow, with a limit).
- [x] `npm test` and `npm run test:e2e` pass.

## Security impact
- None: no new input or stored field; the routing is bounded in size and time.

---

## Result
- **What was done:** everything in scope. `routeElbows` in `js/scene.js` works out the paths once per list of
  elements (a `WeakMap`, nothing stored in the file), with a Dijkstra search on a sparse orthogonal grid (the shapes'
  inflated edges, the end stubs and their midpoints), a cost per turn, and limits on the grid and the steps; the
  renderer calls it before drawing or exporting, so the SVG, PNG and PDF draw the same path.
- **How it was tested:** a unit test (a wall between two boxes is gone around with right angles only; without it the
  arrow is a straight line between the facing sides; moving the wall re-routes it; 400 boxes stay well under the time
  limit); the fuzz test now checks right angles on every routed elbow; e2e draws two boxes, a wall and an elbow arrow
  in Chrome and checks the path; a screenshot was looked at.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** the route must be worked out again for each new list of elements, not cached per arrow: a
  shape in the way can move while the arrow object stays the same.
- **PR:** see the development → main PR.
