# P08 — Quality and the features people expect from a whiteboard

- **Stage:** S3
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 "1,2,3,4,5,6, y funciona que se parezca a exalidraw" (security review of P07, fuzz
  tests, IndexedDB, a lockfile for the Tauri CLI, OpenSSF Scorecard, close P02; and features like a well-known
  whiteboard's)

## Goal
bsketch is sturdier (reviewed, fuzzed, with room for many drawings) and has the whiteboard features people expect:
pictures, frames and a library.

## Scope
**In:**
- A security review of P07's code, and its findings fixed.
- Fuzz tests (`tests/fuzz.test.mjs`) for opening files, the drawings list, preferences and languages; the bugs they
  find fixed.
- Drawings kept in IndexedDB (`js/store.js`), moved from localStorage on their own; recovery of drawings left out of
  the list; tabs follow each other's list.
- Pictures (insert, paste, drop), frames and a library (also Excalidraw libraries).
- The desktop build's Tauri CLI pinned with a lockfile (made by a workflow, since npm isn't reachable from the
  maintainer's machine), OpenSSF Scorecard. Both are workflow changes: committed by the owner.

**Out:**
- Clipping what is drawn to its frame on screen; pictures in Snowlog's search; collaboration.

## Acceptance criteria
- [x] Findings of the review and the fuzzer fixed, with regression tests.
- [x] Drawings and the library survive a reload; older drawings move into IndexedDB; a failing store keeps them.
- [x] Only allowed pictures are kept; exports include them; dark mode keeps their colours.
- [x] `npm test` (53 pass) and `npm run test:e2e` (17 pass).

## Security impact
- New input: picture files and library files. Pictures are restricted to base64 data: URLs of four raster types
  with size limits (no SVG, no remote URL) and re-checked before SVG export; libraries go through the scene
  validation. THREAT_MODEL updated.

## Risks and open questions
- IndexedDB can be cleared by the browser under storage pressure (as localStorage can); "Save" remains the backup.

---

## Result
- **What was done:** everything in scope; the workflows wait for the owner's commit.
- **How it was tested:** unit (53, including images, frames, library, the store and its migration), fuzz (16, run
  with several seeds and 3000 runs each), e2e (17, including pictures, frames and the library); checked by eye on
  desktop, in Spanish and on a phone-sized screen.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** an `Image` must get its `src` before `decode()`; fuzzing found three real bugs a reviewer
  missed.
- **PR:** see the development → main PR.
