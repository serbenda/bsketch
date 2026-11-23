# P25 — Audits before 2.0

- **Stage:** S8
- **Status:** ⏳ in progress (the agent's part done; the owner reviews, checks with a screen reader and decides R-006)
- **Issue:** —
- **Dates:** 2026-11-21 → —
- **Owner approvals:** 2026-11-20 the road to 2.0; 2026-11-21 "Sí, sigue con P25"

## Goal
2.0 ships with no known security, accessibility or performance problem.

## Scope
**In:**
- **Security:** an independent review of the code (an agent with no knowledge of the recent work), every finding
  checked with a script, fixed and covered by a test; a long fuzz campaign.
- **Accessibility:** axe-core (WCAG 2.0, 2.1 and 2.2, A and AA, plus best practices) on every state of the page
  (start, menu, help, text to diagram, a shape selected with the style panel, search, library, presenting), light and
  dark.
- **Performance:** 10,000 elements and 20 photos of 2560×1920: open, pan, select, move, undo, export.

**Out:**
- A check with a real screen reader (VoiceOver, NVDA): the owner, with P19's device checklist.
- Moving the site to its own subdomain (R-006): the owner's decision (DNS, Pages).

## Findings and what was done
| # | Severity | Finding | Fix | Test |
|---|---|---|---|---|
| 1 | High | A file of 20,000 giant cross-hatched shapes used up the tab's memory, and as it was the open drawing, again on every start | A hachure budget per drawing (300,000 lines: with many hatched shapes each gets fewer); a drawing that stops the page while being shown is not opened again on the next start (a new one is, with a message) | Unit "a file full of giant cross-hatched shapes…"; e2e "a drawing that stopped the page…" |
| 2 | Medium | Elbow routing sorted its whole list at every step: 300 elbow arrows froze the page 10 s, 20,000 about 11 min | A binary heap; a work budget shared by the drawing (the rest get plain elbows); a grid to find nearby shapes; a cache of routes by what they depend on | Unit "hostile files: …" (20,000 arrows: about 75 ms) |
| 3 | Medium | An `.excalidrawlib` with 200 items sharing one picture copied it 200 times (210 MB from 1.1 MB, a crash with bigger ones) | The pictures are checked once and shared; the library's pictures stay within one drawing's limit | Unit "hostile files: …" |
| 4 | Medium | bsketch shares its origin with the rest of `bendi.dev` (storage and offline cache) | Documented (threat model, R-006); the fix (own subdomain) is the owner's | — |
| 5 | Low | Text to diagram: regexes that backtracked over long runs of spaces (about 2 s per keystroke) | Lines trimmed one by one; the arrow split without `\s*` | Unit "long runs of spaces…" |
| 6 | Low | Presentations and PDFs with no limit on slides (10,000 frames: 2.5 s, and a page per frame) | At most 500 slides, from the first 2,000 frames | Unit "hostile files: …" |
| 7 | Low | Control characters in a text made the exported SVG unreadable as XML | Dropped from texts, names and notes on opening, and again when escaping for SVG | Unit "hostile files: …" |
| 8 | Info | A pasted or library picture whose id was already used by another picture showed the other one | It gets a new id | — |
| 9 | Info | Opened files were read whatever their size | Files and libraries over 100 MB are refused with a message | — |

The review found sound: the CSP and Trusted Types, the portable build, the desktop app's configuration, file
validation (no prototype pollution), `data:` URLs, SVG and PDF escaping, storage and the service worker.

## Acceptance criteria
- [x] Every security finding fixed or, if it is the owner's decision, recorded as a risk.
- [x] Long fuzz campaign with no failure: 24 seeds × 20,000 runs on the code before the fixes, 6 × 5,000 after.
- [x] axe-core: no violation in any state, light or dark.
- [x] 10,000 elements and 20 big photos within budget, in an e2e test.
- [x] `npm test` and `npm run test:e2e` pass.
- [ ] The owner: a screen-reader check (P19) and the decision on R-006.

## Security impact
- Lowers it: the denial-of-service findings closed; R-006 recorded.

---

## Result
- **What was done:** as in the table.
- **How it was tested:** `npm test` 80 pass; `npm run test:e2e` 34 pass; the reviewer's scripts re-run after each
  fix; axe-core in 12 states; fuzz as above.
- **Performance (10,000 elements, 20 photos, 8.7 MB):** open 0.4 s; pan 17 ms per frame at 100 %, 39 ms with all
  in view; select all 54 ms; move 134 ms; undo 0.36 s; SVG 0.15 s; PNG 0.57 s.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** limits per element are not enough; a hostile file multiplies them by the number of elements,
  so the expensive work needs a budget per drawing.
- **PR:** see the development → main PR.
