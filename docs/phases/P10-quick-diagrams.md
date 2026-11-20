# P10 — Quick diagrams: chain the next shape, start from a template

- **Stage:** S4
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the 1.2.0 plan (Tab to chain and templates, from Excaliflow); 2026-11-20 "Sí, sigue"

## Goal
Flowcharts are drawn at the speed of typing: one key adds the next box already joined by an arrow, and a template
gives a diagram to start from.

## Scope
**In:**
- **Ctrl+arrow keys** (Cmd on a Mac) with one shape selected: a new shape of the same kind, size and style on that
  side, an arrow from the selected one to it, and its text open to write. If the place is taken, it slides beside it.
  (Tab stays as it is: it goes through the elements, which keyboard and screen-reader users need.)
- **Templates** in the ☰ menu: flowchart, decision, architecture, mind map and org chart; each opens as a new drawing
  named after it. They are written as text and drawn by P09's text to diagram, so they stay small and editable.

**Out:**
- Templates from files or shared by others (the library covers that); a picker with previews.

## Acceptance criteria
- [x] Ctrl+→/←/↑/↓ make the next shape on that side, attached at both ends, with its text open; Escape and again
  chains on; a taken place is skipped; one undo step removes both.
- [x] Each template opens as a new drawing with the expected boxes and arrows, in English or Spanish.
- [x] `npm test` and `npm run test:e2e` pass.

## Plan
1. `js/editor.js`: `chainNext(direction)` on Ctrl/Cmd+arrow keys; help text and translations.
2. `js/templates.js`: the templates as text (both languages); the menu section in `index.html` and `js/app.js`.
3. E2E walkthrough, screenshots, docs.

## Security impact
- None: no new input from outside (templates are fixed text in the code, drawn by the existing parser).

## Risks and open questions
- Ctrl+arrow keys move the cursor by words in text fields: they only chain when the canvas has the focus.

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** a unit test draws every template in English, Spanish and a language without a translation;
  e2e chains right and down with text, skips a taken place, undoes box and arrow in one step and opens a template as
  a new drawing; screenshots in Spanish.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** Tab already belongs to keyboard and screen-reader users, so chaining uses Ctrl+arrow keys (as
  other whiteboards do); a template is best inserted unselected, or the style panel covers it.
- **PR:** see the development → main PR.
