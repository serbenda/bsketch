# P26 — Help inside the app

- **Stage:** S8
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-21 → 2026-11-21
- **Owner approvals:** 2026-11-20 the road to 2.0; 2026-11-21 "Sí, empieza S8", "dale"

## Goal
Someone who opens bsketch for the first time, or forgets a shortcut, finds the answer inside the app, in their
language, with no network.

## Scope
**In:**
- A **Help** dialog: a short guide (drawing, writing in shapes, joining shapes, saving and exporting, frames and
  presenting, privacy, Cmd on a Mac) and every keyboard shortcut, grouped (tools, editing, view, file, presentation).
- Opened from the ☰ menu (**Help and shortcuts**) or with **?** (not while typing, nor while presenting); Escape or
  × closes it and the focus goes back to the drawing.
- In the five languages, key names too (Shift → Mayús, Maj…); part of the page, so it works offline.

**Out:**
- Pictures or animations in the guide; a search box; a first-run tour.

## Acceptance criteria
- [x] The menu item and "?" open it; Escape closes it; "?" does nothing in a text field.
- [x] Every shortcut the editor and the page handle is listed.
- [x] In Spanish (and the other languages) nothing of it is left in English.
- [x] `npm test` and `npm run test:e2e` pass.

## Security impact
- None: static markup in `index.html`, translated by the same code as the rest of the page (text nodes only, no HTML
  built from strings).

---

## Result
- **What was done:** everything in scope; the dialog is static markup (a table per group, a caption each, `<kbd>` per
  key), so the page's translator handles it like the menu.
- **How it was tested:** e2e opens it from the menu and with "?", counts the shortcuts, closes it with Escape, and in
  Spanish finds no English in the guide, the tables or the key names; the five language tests check its headings and
  titles; looked at in the browser (Spanish, dark appearance).
- **What was left out and why:** as in *Out*.
- **Lessons learned:** key names must be their own `<kbd>` text nodes to be translated without touching letters.
- **PR:** see the development → main PR.
