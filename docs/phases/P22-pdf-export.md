# P22 — PDF with one frame per page

- **Stage:** S7
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-21 → 2026-11-21
- **Owner approvals:** 2026-11-20 the road to 2.0; 2026-11-21 "Sí, sigue"

## Goal
A drawing with frames becomes a PDF handout or slide deck in one click, made in the browser with no library and no
network: one page per frame, in the presentation's order.

## Scope
**In:**
- `js/pdf.js`: a small PDF writer (PDF 1.4) that puts one JPEG image per page (`DCTDecode`, the browser's own JPEG
  encoder), each page sized to its slide (the long side 842 pt, like A4).
- The slides are the same as presentation mode's (`slideFrames` in `js/scene.js`): top-level frames in reading
  order, each clipped and without its border; a drawing without frames is one page.
- A **PDF** button in the ☰ menu's Export, named after the drawing; translated.

**Out:**
- Vector pages and selectable text (they need the fonts embedded and a path writer; images at 2× are sharp in print);
  speaker notes in the PDF.

## Acceptance criteria
- [x] The PDF has one page per frame, in order, each the slide's proportions; it opens in a PDF reader.
- [x] The writer's output is a valid PDF (header, objects, cross-reference table with correct offsets, trailer).
- [x] `npm test` and `npm run test:e2e` pass.

## Security impact
- None: no new input (it writes a file from the drawing); the PDF holds only images, no script or links.

---

## Result
- **What was done:** everything in scope.
- **How it was tested:** unit tests for the writer (pages, sizes, the escaped title, every cross-reference offset) and
  for the slides' order; e2e makes a PDF of two frames from the menu; that PDF opened and rendered by macOS (`sips`),
  page 1 being the first frame without its border.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** JPEG goes into a PDF unchanged (DCTDecode), so a correct PDF needs no compression code at all.
- **PR:** see the development → main PR.
