# P09 — Text to diagram, offline and without AI

- **Stage:** S4
- **Status:** ✅ done
- **Issue:** —
- **Dates:** 2026-11-20 → 2026-11-20
- **Owner approvals:** 2026-11-20 the 1.2.0 plan ("texto a diagrama, sin IA y sin red" first); 2026-11-20 "Sí, empieza"

## Goal
A diagram is written as text (an indented list, simple Mermaid or `A -> B` lines) and bsketch draws it, laid out and
hand-drawn, without sending the text anywhere: what other tools do with a cloud AI, done in the browser.

## Scope
**In:**
- `js/textdiagram.js` (pure, no DOM): reads three kinds of text and lays the graph out in layers.
  - **Indented list:** each line a box, each indented line a child with an arrow from its parent (bullets and
    numbers are dropped).
  - **Mermaid flowcharts** (`graph`/`flowchart` TD, TB, LR, RL, BT): node shapes `[ ]`, `( )`, `([ ])`, `(( ))`,
    `{ }`, `{{ }}`, `>]`; edges `-->`, `---`, `-.->`, `==>` with labels (`-->|label|`, `-- label -->`); chains
    (`A --> B --> C`) and `&` lists; `subgraph … end` as frames; comments and styling lines ignored.
  - **Arrow lines:** `A -> B`, `A → B`, `A => B`, with an optional `: label`.
- Layout: cycles broken, layers by longest path, order by barycenters, sizes from the text; boxes with their text
  inside, arrows attached to them, edge labels next to the arrows, frames around subgraphs.
- **Paste:** text pasted on the canvas becomes a diagram when it reads as one, or a text element otherwise. Copying
  elements now also puts them on the system clipboard, so they can be pasted in another tab (checked like a file).
- **Menu:** "Text to diagram…" opens a box to write or paste the text, with examples, the direction (down or right) and
  a live count of what will be drawn.

**Out:**
- Other Mermaid diagram types (sequence, class, state, Gantt…); styling (`classDef`, colours); edges routed around
  boxes.

## Acceptance criteria
- [x] The three kinds of text become the expected boxes, arrows, labels and frames (unit tests).
- [x] Layout: no two boxes overlap; every arrow is attached at both ends; directions work; cycles do not hang.
- [x] Limits: at most 300 boxes, 600 arrows, 50,000 characters of text and 200 per label; hostile text never throws.
- [x] Pasting text on the canvas draws the diagram; pasting a copied selection in another tab works.
- [x] `npm test` and `npm run test:e2e` pass.

## Plan
1. `js/textdiagram.js`: `parseText`, `layoutGraph`, `textToElements`; unit and fuzz tests.
2. Editor: `insertElements`, `insertText`; the paste and copy events.
3. Site: the dialog in the menu; translations.
4. E2E walkthrough, screenshots, docs.

## Security impact
- New input: pasted or typed text. It is parsed by hand-written code with limits (no `eval`, no regular expressions
  with nested quantifiers on unbounded input), and what it makes goes through the same element validation as a
  file. Clipboard data read on paste is parsed with `parseScene`. Nothing leaves the browser.

## Risks and open questions
- Big graphs lay out slower: the limits keep it under a fraction of a second.

## Result
- **What was done:** everything in scope.
- **How it was tested:** unit tests for the three kinds of text, the layout in the four directions (no overlaps, the
  flow's direction, cycles), elements that survive saving and opening, the limits and 400 random texts; e2e for the
  menu dialog, pasting text and copying between tabs; screenshots of the dialog (English and Spanish) and of the
  diagrams.
- **What was left out and why:** as in *Out*.
- **Lessons learned:** a list written as a tree never crosses, so reordering it only made it worse; the parent is
  centred over its children by settling layers both ways.
- **PR:** see the development → main PR.
