# P21 — Speaker notes and a timer

- **Stage:** S7
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-21 → 2026-11-21
- **Owner approvals:** 2026-11-20 the road to 2.0; 2026-11-21 "Sí, empieza"

## Goal
Talks given with bsketch's presentation mode have what a speaker needs: notes per slide and the time spent.

## Scope
**In:**
- A **frame panel** when one frame is selected: its name and its **speaker notes** (a text box; one undo step per
  edit). Stored as `notes` on the frame (up to 2,000 characters), validated.
- While presenting: **N** (or a button) shows or hides the current slide's notes in a small box; the bar shows the
  **time** since the presentation started.
- Translated into the five languages.

**Out:**
- A separate presenter window on a second screen; a countdown with a target time.

## Acceptance criteria
- [x] Notes typed for a frame are kept (Save/Open, undo) and shown with N on that frame's slide only.
- [x] The timer counts from the start of the presentation and stops when it ends.
- [x] `npm test` and `npm run test:e2e` pass.

## Security impact
- One more validated text field (shown with `textContent`, never as HTML).

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** a unit test for the notes' validation; e2e writes notes in the frame panel, undoes and
  redoes them, presents, shows them with N and checks the timer runs; the fuzz checks learnt `notes`; screenshots in
  Spanish of the panel and of a slide with its notes.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** a panel of its own for frames keeps the style panel for styles; the notes start hidden because
  the audience often sees the same screen.
- **PR:** see the development → main PR.
