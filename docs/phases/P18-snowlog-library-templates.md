# P18 — Library and templates in Snowlog

- **Stage:** S6
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the road to 2.0; 2026-11-20 "Sí, sigue"

## Goal
Snowlog's drawings get the library of reusable pieces and the templates, kept like everything else in the vault.

## Scope
**In:**
- The editor's `library` option backed by the vault: an encrypted `.snowlog/library.enc` in a GitHub vault (flagged
  in the index, encrypted again on key rotation), a plain `.snowlog/library.bsketchlib` in a folder vault.
- `templates.js` copied to Snowlog; "New drawing from a template: …" in its command palette.

**Out:**
- Templates in Snowlog's other languages (its interface is in English).

## Acceptance criteria
- [x] A piece kept in the library is there on another device and after locking; the repository holds it encrypted;
  rotating the key keeps it readable.
- [x] Each template makes a new drawing.

## Security impact
- None in bsketch. In Snowlog, one more encrypted file with its own AAD (`library`), covered by key rotation.

---

## Result
- **What was done:** everything in scope, in serbenda/snowlog#9.
- **How it was tested:** Snowlog's 166 unit tests (encryption, another device, rotation, the folder file) and 5 e2e;
  in Chrome a template drawing and the library read back after unlocking.
- **Lessons learned:** an optional file is best flagged in the index, or every vault without it asks the repository
  for it (and logs a 404).
- **PR:** serbenda/snowlog#9.
