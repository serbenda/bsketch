# P05 — Everyday comfort: ask before opening, file shortcuts, copy as PNG, arrowheads

- **Stage:** S3
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-18 → 2026-11-18
- **Owner approvals:** 2026-11-18 "adelante, empieza a hacer las funcionalidades" (the four items proposed after
  P04: ask before opening, Ctrl+S/Ctrl+O, copy as PNG, arrowheads)

## Goal
Fewer surprises and fewer clicks in daily use: opening a file never loses a drawing silently, saving and opening
have their usual shortcuts, a diagram can be pasted straight into a chat or a document, and arrows can point either
way.

## Scope
**In:**
- Opening a file (menu, Ctrl+O or dropping it on the page) over a drawing asks first, like New does.
- Ctrl+S saves, Ctrl+O opens (Cmd on a Mac), by key position so other keyboard layouts work.
- **Copy as PNG** in the menu and on **Alt+Shift+C** (Ctrl/Cmd+Shift+C is the browser's inspector): the selection
  if there is one, otherwise the whole drawing; the menu's "Transparent background" applies.
- **Arrowheads** in the style panel for arrows: End (default), Start, Both, None. Stored as `heads` only when not
  the default, validated on open, and read from `.excalidraw` files (`startArrowhead`/`endArrowhead`).

**Out:**
- Several drawings kept in the browser, copying and pasting between tabs, curved or elbow arrows, other arrowhead
  shapes (dot, bar), exporting only the selection to a file.

## Acceptance criteria
- [x] With a drawing on the canvas, opening a file asks first; answering no keeps the drawing.
- [x] Ctrl+S downloads `drawing.sketch`; Ctrl+O opens the file picker.
- [x] Alt+Shift+C puts a PNG on the clipboard (the selection, or the whole drawing) and says so.
- [x] An arrow can have its head at the end, the start, both or none; the choice survives Save/Open; a bad stored
  value falls back to the default; `.excalidraw` arrowheads are kept.
- [x] Unit and e2e tests; `npm test`, `npm run test:e2e` and the portable build pass.

## Plan
1. `js/scene.js`: `HEADS`, `heads` in `createElement`, `cleanElement`, `drawOps` and the `.excalidraw` import.
2. `js/editor.js`: the Arrowheads selector in the panel (shown for the arrow tool or a selected arrow), applied to
   arrows only; `getSelection()` in the API.
3. `js/app.js` / `index.html`: confirm before opening, the shortcuts, Copy as PNG.
4. Tests, docs.

## Security impact
- No new input beyond one more validated element field (`heads`, from a fixed list). The clipboard is a new output
  (an image the user asks for); nothing is read from it. No network, no dependency, CSP unchanged.

## Risks and open questions
- Copying images needs the async Clipboard API: Chrome, Edge and Safari have it; Firefox only recently, and the
  desktop app's WebKit may not. Where it is missing, the site says so and points to "PNG".

---

## Result
- **What was done:** everything in scope. The arrowheads selector sits under "Line" in the style panel; the panel's
  nested labels (Arrowheads, Align) got their top gap back.
- **How it was tested:** `npm test` 25 pass (arrowheads stored, validated, drawn and imported); `npm run test:e2e`
  13 pass, with a walkthrough for arrowheads, Alt+Shift+C (the clipboard write is recorded: headless Chrome cannot
  read the clipboard back), Ctrl+S and the question before opening. Checked by eye in the browser.
- **What was left out and why:** as in *Out*; copying from the desktop app is untested (R-002).
- **Lessons learned:** Ctrl+Shift+C cannot be used in a web page; pick shortcuts the browser does not keep.
- **PR:** #
