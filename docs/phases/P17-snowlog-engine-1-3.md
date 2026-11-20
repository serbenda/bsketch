# P17 — Snowlog on the 1.3 engine

- **Stage:** S6
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the road to 2.0; 2026-11-20 "Sí, empieza"

## Goal
Snowlog's drawings get everything 1.3 added: frames that clip, presentation mode and arrows bent by hand.

## Scope
**In:**
- Snowlog's engine copy refreshed from the `v1.3.0` tag (through a temporary worktree, so the copy names the
  released commit); its e2e driver starts Chrome like bsketch's; its service worker cache bumped.

**Out:**
- The library and templates in Snowlog (P18).

## Acceptance criteria
- [x] Snowlog's tests pass; a drawing works, saves encrypted and opens again; the presentation button is there.

## Security impact
- None in bsketch. In Snowlog, a data-loss bug found on the way was fixed (below).

---

## Result
- **What was done:** everything in scope, in serbenda/snowlog#9. On the way, Snowlog's test "drawings: changes from
  two devices…" started failing: notes and attachments were versioned by their date alone, so two saves in the same
  millisecond looked identical and the second device overwrote the first. Fixed there with a random `rev` per save
  (version = date + rev), with a test that pins the clock.
- **How it was tested:** Snowlog's 164 unit and 5 e2e tests; a drawing checked by eye in Chrome.
- **Lessons learned:** a version made of a timestamp is not unique on a fast machine.
- **PR:** serbenda/snowlog#9.
