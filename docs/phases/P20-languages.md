# P20 — Catalan, French and Portuguese

- **Stage:** S6
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-21
- **Owner approvals:** 2026-11-20 the road to 2.0; 2026-11-20 "adelante"

## Goal
The interface, its messages and the templates in three more languages, chosen in the menu or taken from the browser.

## Scope
**In:**
- Catalan, French and Portuguese (Portugal) dictionaries for every Spanish string (194), placeholders kept.
- The Language choice in the ☰ menu; `auto` picks them from the browser; the prefs accept them.
- The five templates in each language.

**Out:**
- More languages; Brazilian Portuguese as a separate choice.

## Acceptance criteria
- [x] Each language translates every string Spanish does, with the same `{holes}`.
- [x] Chosen in the menu, nothing of the interface is left in English; the templates come in that language.
- [x] `npm test` and `npm run test:e2e` pass.

## Security impact
- None: fixed text in the code; the language pref accepts a fixed list.

---

## Result
- **What was done:** everything in scope. On the way: icon buttons' accessible names weren't translated in any
  language (their name was looked up without its "(shortcut)"); now it's the translated title without it.
- **How it was tested:** unit tests for the language choice and for the holes; e2e for each language (no English left,
  translated templates); a check of the 194 strings' placeholders in all three.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** a test per language catches what one language's test missed.
- **PR:** see the development → main PR.
