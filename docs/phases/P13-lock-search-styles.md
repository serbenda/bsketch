# P13 — Lock, search and more styles

- **Stage:** S4
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the 1.2.0 extras (lock, search text, more styles); 2026-11-20 "Sí, sigue"

## Goal
Everyday comfort for bigger drawings: a background or a frame that can't be moved by mistake, finding a text in a
large drawing, and a few more styles people expect.

## Scope
**In:**
- **Lock:** a lock button in the panel's actions (Ctrl+Shift+L) locks the selection: locked elements can't be
  selected, moved, erased or written into; an "Unlock all" button appears in the bottom bar while any is locked.
  Stored as `locked: true`; read from and written to `.excalidraw`.
- **Search** (Ctrl+F, Cmd on a Mac): a small box finds texts and frame titles; Enter and Shift+Enter go through the
  matches, selecting each and bringing it into view; it shows "2 of 5"; Escape closes it.
- **Styles:** a dotted line (besides solid and dashed); a cross-hatch fill (besides hachure and solid); round
  corners for rectangles. Stored only when used (`dotted`, `fillStyle: 'cross-hatch'`, `rounded`); validated; mapped
  to and from Excalidraw.

**Out:**
- Locking individual properties; search and replace; more line or fill patterns.

## Acceptance criteria
- [x] Locked elements ignore clicks, the marquee, Ctrl+A, Tab, the eraser and writing inside; Unlock all brings them
  back; a hostile `locked` value is dropped.
- [x] Search finds texts inside shapes, free texts and frame titles, case- and accent-insensitive, and goes through
  them in order.
- [x] Dotted, cross-hatch and round corners paint on screen, in SVG and PNG, survive Save/Open and `.excalidraw`.
- [x] `npm test` and `npm run test:e2e` pass.

## Security impact
- Three more validated fields (booleans or a fixed list). The search box only reads the scene.

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** a unit test for the validation, the drawing (two hachure sets, a dotted round outline), the
  SVG and the round trip through `.excalidraw`; the fuzz tests learnt the new fields; e2e searches with accents and
  case, applies the three styles, locks (Ctrl+A skips it) and unlocks; a screenshot in Spanish.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** a locked shape locks its text too; picking, the marquee, Tab, Ctrl+A, the eraser and moving a
  frame all go through one `free()` list.
- **PR:** see the development → main PR.
