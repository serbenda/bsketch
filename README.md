<div align="center">

<img src="docs/images/banner.png" alt="bsketch: hand-drawn diagrams, offline, no account" width="900">

**A hand-drawn whiteboard that never leaves your computer.**
Sketch diagrams, flows and wireframes in the browser: no account, nothing to install, nothing sent anywhere.

[**Open bsketch →**](https://serbenda.github.io/bsketch/)

[![CI](https://github.com/serbenda/bsketch/actions/workflows/ci.yml/badge.svg?branch=development)](https://github.com/serbenda/bsketch/actions/workflows/ci.yml)
[![License: all rights reserved](https://img.shields.io/badge/license-all%20rights%20reserved-lightgrey.svg)](LICENSE)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/serbenda/bsketch/badge)](https://scorecard.dev/viewer/?uri=github.com/serbenda/bsketch)
![No network](https://img.shields.io/badge/network-none-brightgreen.svg)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/screenshot-dark.png">
  <img src="docs/images/screenshot-light.png" alt="bsketch with a small flowchart: a yellow box 'Idea' with an arrow to a blue diamond 'Worth it?', which points to a green ellipse 'Build it' and a red box 'Sketch it first', all drawn with a hand-drawn stroke and handwriting." width="900">
</picture>

</div>

## Why bsketch
- **Private by design.** Its security policy forbids every network connection: your drawing stays on your
  machine, always.
- **Works anywhere.** In any browser, offline once opened, as a single HTML file, or as a small desktop app. Even
  on locked-down work computers.
- **Fast to draw.** A hand-drawn look, text inside shapes, arrows that stick to them, and a shortcut for everything.

## Try it in a minute
1. Open **[serbenda.github.io/bsketch](https://serbenda.github.io/bsketch/)**.
2. Press **R** and drag to draw a box. Double-click it and type.
3. Press **R** again for a second box, then **A** and drag from one box to the other: the arrow sticks to both.
4. Move a box: the arrow and the text follow it.
5. Open the **☰ menu** (top left): **Save** keeps a `.sketch` file; **PNG** and **SVG** export it.

Your drawing is also kept in the browser, so closing the tab doesn't lose it.

## What it does
**Drawing**
- Rectangles, diamonds, ellipses, arrows, lines, pencil and text, with a hand-drawn stroke and handwriting font.
- **Text inside shapes:** it is centered, wraps to the shape and moves, resizes and rotates with it.
- **Attached arrows:** an arrow that starts or ends on a shape stays on its outline when the shape moves.
- Hachure or solid fill, colors, stroke width, dashed lines and three levels of sloppiness.
- Arrowheads at the end, the start, both ends or none.
- Three fonts for text: handwriting, normal and code.
- Arrows and lines straight, **with an elbow** (going around the shapes in their way) or **curved** (drag the middle to bend them as you like).
- **Pictures:** insert, paste or drop them; arrows attach to them.
- **Present** a drawing frame by frame, full screen, with a laser pointer, speaker notes and a timer.
- **Frames** to title and group part of a drawing: what lies on them is cut at their border, and a frame exports
  exactly that part.
- A **library** of pieces to reuse, which also reads Excalidraw libraries.
- **Text to diagram, without AI:** paste an indented list, a Mermaid flowchart or `A -> B` lines and it is drawn
  for you, in your browser.
- Lock elements, search texts (Ctrl+F), dotted lines, cross-hatch fills and round corners.
- **Animated arrows** that show what flows, also in the exported SVG.
- **Quick flowcharts:** Ctrl+arrow keys add the next box, joined by an arrow; templates to start from.

**Editing**
- Select, move, resize, **rotate**, **group**, **align and distribute**, duplicate, reorder and delete.
- Undo and redo; zoom and pan, also with two fingers on a phone.
- Fully usable with the keyboard, with descriptions for screen readers.

**Files and options** (the ☰ menu)
- **Several drawings** kept in this browser: create, switch, rename and delete them from the menu.
- Saves and opens `.sketch` files, opens and saves `.excalidraw` files, makes a **PDF** with a page per frame, exports to **PNG** and **SVG**, also with a
  transparent background or **only the selection**, and copies the drawing or the selection to the clipboard as a PNG.
- **Appearance:** light, dark or the system's, whatever the system theme is.
- **Canvas background:** six light colours, saved with the drawing.
- **Grid:** shown on screen only; new shapes, moves and resizes snap to it, and rotation goes in 15° steps.
- **Language:** English, Spanish, Catalan, French or Portuguese, chosen in the menu or taken from the browser.
- Embedded in [Snowlog](https://github.com/serbenda/snowlog), where drawings are stored end-to-end encrypted and
  shown inside notes.

## Three ways to use it
| | How | Good for |
|---|---|---|
| 🌐 **Web** | [serbenda.github.io/bsketch](https://serbenda.github.io/bsketch/), in Chrome, Edge, Firefox or Safari. Chrome and Edge can install it as an app ("Install app") | Everyday use; works offline once opened |
| 📄 **Portable** | **Portable version** in the site's menu downloads `bsketch-portable.html`: double-click it on Windows, macOS or Linux | Computers where you can't install anything. It is not a program, so antivirus tools don't block it |
| 🖥️ **Desktop** | `bsketch-windows.exe`, `bsketch-macos.zip` and `bsketch-linux.AppImage`, built by the [Desktop workflow](https://github.com/serbenda/bsketch/actions/workflows/desktop.yml) (download them from a run's artifacts) | A window of its own, no browser |

The desktop builds are not signed: on macOS, open it the first time with right click → Open; on company computers
the antivirus may block an unsigned executable (use the portable file there). They use the system's web engine
(Edge on Windows, Safari on macOS, WebKit on Linux), which the system keeps up to date.

## Shortcuts
<details>
<summary>All shortcuts</summary>

| Key | Action |
| --- | --- |
| V · H | Select · pan the canvas (or hold Space) |
| R · D · O | Rectangle · diamond · ellipse |
| A · L · P · T · F · E | Arrow · line · pencil · text · frame · eraser |
| I · Shift+L | Insert a picture · open the library |
| Shift+P | Present: the frames one by one, full screen (arrow keys to move, Escape to end) |
| Ctrl+F · Ctrl+Shift+L | Search the drawing · lock the selection (or unlock all) |
| Ctrl+arrow keys | With a shape selected: the next shape on that side, joined by an arrow (Cmd on a Mac) |
| Shift | Keep proportions while drawing or resizing; 15° steps for lines and rotation |
| Ctrl+Z · Ctrl+Y | Undo · redo |
| Ctrl+D · Ctrl+C · Ctrl+V | Duplicate · copy · paste |
| Ctrl+G · Ctrl+Shift+G | Group · ungroup |
| G | Show the grid: new shapes and moves land on it (also in the ☰ menu) |
| Ctrl+S · Ctrl+O | Save · open a file (Cmd on a Mac) |
| Alt+Shift+C | Copy the selection (or the whole drawing) as a PNG, to paste in a chat or a document |
| Delete · arrow keys | Delete · move the selection (Shift: 10 at a time; with the grid, one cell and Shift 1 px) |
| Ctrl+wheel · Ctrl+0 | Zoom · back to 100% |
| Double click · Enter | Write text: inside the shape when done on one (or edit the existing text) |

To rotate, drag the round handle above the selection.

Without a mouse: choose a tool with its key and press **Enter** to create the shape in the center. **Tab** and
**Shift+Tab** go through the elements, **Alt+arrow keys** resize them, **[** and **]** rotate them and **Enter**
writes inside. **Escape** clears the selection (and then Tab leaves the whiteboard).

</details>

## Privacy
- The page's Content Security Policy has `connect-src 'none'`: it **cannot** send anything over the network, not
  even by mistake. No analytics, no accounts, no server.
- No third-party code at runtime: plain JavaScript modules, no frameworks or CDNs.
- `.excalidraw` files are read as plain JSON; no Excalidraw code is used.

Found a security problem? See [SECURITY.md](SECURITY.md).

## Data sources
| Source | What it provides | License |
|---|---|---|
| None | No network calls at all | — |
| [Caveat](https://github.com/googlefonts/caveat) | The handwriting font, subset to Latin characters and served from the site | SIL Open Font License ([fonts/OFL.txt](fonts/OFL.txt)) |

## For developers
```bash
git clone https://github.com/serbenda/bsketch.git
cd bsketch
git switch development
python3 -m http.server 8000   # then open http://localhost:8000
npm test                      # engine tests (no dependencies)
npm run test:e2e              # walkthroughs in Chrome
```
Everything else (requirements, verifying, building the portable and desktop versions): [docs/SETUP.md](docs/SETUP.md).

<details>
<summary>Project structure</summary>

```
.
├── index.html · icon.svg · manifest.webmanifest
├── sw.js              # service worker: the site offline
├── css/styles.css     # the page
├── css/sketch.css     # the editor (sk- prefix, can be embedded)
├── js/stroke.js       # seeded hand-drawn strokes → paths for canvas and SVG
├── js/scene.js        # elements: create, measure, hit-test, move, rotate, bind, merge, open/save, .excalidraw
├── js/render.js       # scene → canvas, SVG (text or DOM) and PNG
├── js/editor.js       # the interactive editor, mountable in any container
├── js/app.js          # the site: the side menu, open, save, export and options
├── js/prefs.js        # the site's preferences (appearance, grid, language), validated
├── js/drawings.js     # the list of drawings in this browser
├── js/store.js        # where their scenes are kept (IndexedDB, or localStorage as a fallback)
├── js/i18n.js         # the interface's languages
├── fonts/             # handwriting font (Caveat, OFL)
├── desktop/           # desktop version (Tauri): icon, smoke test and src-tauri/
├── scripts/           # build-portable.mjs, and the template's setup, sync and check scripts
├── tests/             # node --test; tests/e2e: walkthroughs in Chrome over DevTools, no dependencies
├── docs/              # VISION, STATE, WORKLOG, ROADMAP, phases, decisions, ARCHITECTURE, THREAT_MODEL…
├── .claude/ · .githooks/ · .github/
├── AGENTS.md          # rules for any AI agent
└── CLAUDE.md          # imports AGENTS.md and adds what is specific to Claude Code
```

How it is built: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). What it will and won't do: [docs/VISION.md](docs/VISION.md).

</details>

<details>
<summary>How to work with Claude</summary>

Every flow, as diagrams: [docs/WORKFLOWS.md](docs/WORKFLOWS.md).

```
/status                      at the start of every session
/new-phase <what>            phase file + plan → you approve → Claude implements on development
(automatic)                  record-changes skill: WORKLOG after every change
/close-phase                 criteria + DoD + updates STATE, ROADMAP and CHANGELOG (once per phase)
/prepare-pr                  reviewers + development → main PR (you merge it)
/decision <what>             when something hard to undo has to be chosen
```

</details>

## Contributing
Contributions are not accepted without a prior written agreement with the author (see [LICENSE](LICENSE)). How the
project itself is worked on: [AGENTS.md](AGENTS.md) and the [Definition of Done](docs/DEFINITION_OF_DONE.md).

## License
© 2026 Sergio Santiago Bendaña Quesada. **All rights reserved.** The source is visible here, but it may not be used,
copied, modified, redistributed, embedded or used to train AI models without the author's written permission:
[LICENSE](LICENSE) says what is allowed and how to ask ([open an issue](https://github.com/serbenda/bsketch/issues) or
write through [the author's profile](https://github.com/serbenda)).
