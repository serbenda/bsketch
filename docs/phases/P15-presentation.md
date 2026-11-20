# P15 — Presentation mode with a laser pointer

- **Stage:** S5
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the 1.3 plan; 2026-11-20 "Sí, sigue"

## Goal
A drawing with frames becomes a talk: full screen, one frame at a time, and a laser pointer to point at things,
without leaving bsketch or exporting anything.

## Scope
**In:**
- **Present** (a button in the bottom bar, or Shift+P): full screen when the browser allows it; the slides are the
  frames in reading order (top to bottom, then left to right), or the whole drawing when there are none. Each slide
  fills the screen and shows only what lies on that frame, without its border and title.
- **Moving through:** → , Space, PageDown and Enter go forward; ←, PageUp and Backspace go back; Home and End jump to
  the first and the last; Escape (or leaving full screen) ends it and puts the view back. A small bar shows "2 / 5"
  with previous, next and close buttons.
- **Laser pointer:** while presenting, the pointer leaves a red trail that fades in under a second; nothing is drawn
  or changed.

**Out:**
- Speaker notes, transitions, a timer; presenting on a second screen.

## Acceptance criteria
- [x] Present shows the first frame alone, filling the view; the keys and buttons move through the frames and show
  "n / total"; Escape ends it with the view and tool as they were.
- [x] Without frames, the whole drawing is one slide.
- [x] While presenting, nothing can be drawn, moved or selected; the laser leaves a trail and changes nothing.
- [x] `npm test` and `npm run test:e2e` pass.

## Security impact
- None: no new input, file or stored field. Full screen is asked for only on the user's click or key.

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** e2e presents two frames in reading order, checks the toolbar is hidden, drags the laser
  and finds the drawing unchanged, moves forward and back (stopping at the ends), ends with Escape and finds the view
  back, and presents a drawing without frames as one slide; the phone layout still fits; a screenshot of a slide
  with the laser.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** a frame's slide paints its contents with the frame's clip but without its border, so the
  same clipping as P14 does the work; ending must update the zoom label at once, not on the next frame.
- **PR:** see the development → main PR.
