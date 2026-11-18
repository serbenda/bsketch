# P06 — Text fonts: Hand, Normal, Code

- **Stage:** S3
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-18 → 2026-11-18
- **Owner approvals:** 2026-11-18 "¿cambiar tipo de letra? con pocas fonts" (a few fonts to choose from)

## Goal
Texts can be written in a plain or a monospaced font as well as the handwriting one, without making the site
heavier or needing a connection.

## Scope
**In:**
- A **Font** choice in the style panel's Text section: **Hand** (Caveat, the default), **Normal** (the system's
  sans-serif) and **Code** (the system's monospace). It applies to the selected texts, including texts inside
  shapes, and to the next texts written.
- Stored as `font` on text elements only when it is not the default; validated on open; read from `.excalidraw`
  files (`fontFamily`); used to measure, wrap, paint on the canvas and export to PNG and SVG; the text box being
  written uses it.

**Out:**
- Downloading more font files (they would make the site and the portable file heavier); a free font picker; fonts
  embedded in the SVG (the handwriting one isn't either).

## Acceptance criteria
- [x] A text written with Code stays in Code after Save/Open; choosing Normal or Hand on a selected text changes it;
  Hand is not stored.
- [x] An unknown or hostile `font` value in a file falls back to Hand; Excalidraw's fonts map to the closest one.
- [x] Texts are measured with their own font, so selection boxes and wrapping inside shapes fit.
- [x] Unit and e2e tests; `npm test`, `npm run test:e2e` and the portable build pass.

## Plan
1. `js/scene.js`: `FONTS`, `fontOf`, the measurer told each text's font, `font` in `createElement`,
   `cleanElement` and the `.excalidraw` import.
2. `js/render.js`: canvas, SVG and DOM SVG use `fontOf`.
3. `js/editor.js`: the Font selector, applied to texts only; the text box uses the font.
4. Tests, docs.

## Security impact
- One more validated text field, `font`, from a fixed list (checked with `Object.hasOwn`, so names like
  `__proto__` are rejected). No new files, network or dependencies; CSP unchanged.

## Risks and open questions
- Normal and Code look slightly different on each system (they are the system's own fonts), so a drawing opened on
  another computer may wrap a little differently.

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** `npm test` 26 pass (stored, validated, measured with its font, exported to SVG, Excalidraw
  mapping); `npm run test:e2e` 14 pass, with a walkthrough writing in Code and switching to Normal and Hand; the
  three fonts checked by eye in a clean browser, also inside a shape.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** —
- **PR:** #11
