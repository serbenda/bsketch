# sketch

> A whiteboard for hand-drawn sketches, diagrams and wireframes. No accounts, nothing to install, and nothing
> is sent to any server.

🔗 **Web:** https://serbenda.github.io/sketch/

## What it does
- Rectangles, diamonds, ellipses, arrows, lines, pencil and text, with a hand-drawn stroke and handwriting font.
- **Text inside shapes:** double-click a box to write in it; the text is centered, wraps to the box and moves,
  resizes and rotates with it.
- **Attached arrows:** an arrow that starts or ends on a shape stays on its outline when the shape moves.
- Hachure or solid fill, colors, stroke width, dashed lines and three levels of sloppiness.
- Select, move, resize, **rotate**, **group**, **align and distribute**, duplicate, reorder, delete, undo and
  redo; zoom and pan, also with two fingers on a phone.
- Works **offline** once opened, and can be installed as an app.
- Saves and opens `.sketch` files, opens `.excalidraw` files and exports to **PNG** and **SVG**.
- The drawing in progress stays in the browser so it is not lost.
- Fully usable with the keyboard, with descriptions for screen readers.
- Embedded in [Snowlog](https://github.com/serbenda/snowlog), where drawings are stored encrypted and shown
  inside notes.

## Shortcuts

| Key | Action |
| --- | --- |
| V · H | Select · pan the canvas (or hold Space) |
| R · D · O | Rectangle · diamond · ellipse |
| A · L · P · T · E | Arrow · line · pencil · text · eraser |
| Shift | Keep proportions while drawing or resizing; 15° steps for lines and rotation |
| Ctrl+Z · Ctrl+Y | Undo · redo |
| Ctrl+D · Ctrl+C · Ctrl+V | Duplicate · copy · paste |
| Ctrl+G · Ctrl+Shift+G | Group · ungroup |
| Delete · arrow keys | Delete · move the selection (Shift: 10 at a time) |
| Ctrl+wheel · Ctrl+0 | Zoom · back to 100% |
| Double click · Enter | Write text: inside the shape when done on one (or edit the existing text) |

To rotate, drag the round handle above the selection.

Without a mouse: choose a tool with its key and press **Enter** to create the shape in the center. **Tab** and
**Shift+Tab** go through the elements, **Alt+arrow keys** resize them, **[** and **]** rotate them and **Enter**
writes inside. **Escape** clears the selection (and then Tab leaves the whiteboard).

## Data sources
| Source | What it provides | License |
|---|---|---|
| None | No network calls at all. `.excalidraw` files are read as public JSON; no Excalidraw code is used. | — |
| [Caveat](https://github.com/googlefonts/caveat) | The handwriting font, subset to Latin characters and served from the site | SIL Open Font License ([fonts/OFL.txt](fonts/OFL.txt)) |

## Three ways to use it
- **On the web**, in any browser (Chrome, Edge, Firefox or Safari). From Chrome or Edge it can be installed as an
  app ("Install app") and opens in its own window, also offline.
- **Portable:** the site's "Portable" button downloads `sketch-portable.html`, a single file that opens with a
  double click in any browser on Windows, macOS or Linux, with nothing to install and no connection (its CSP
  forbids any network access). It is not a program, so antivirus tools do not block it.
- **Desktop** (Tauri): a window of its own, no browser. The "Desktop" workflow builds `sketch-windows.exe`
  (opens without installing), `sketch-macos.zip` (with `sketch.app`, for Intel and Apple Silicon) and
  `sketch-linux.AppImage`, and leaves them as artifacts of the run in the Actions tab. They are not signed: on
  macOS, open it the first time with right click → Open; on company computers the antivirus may block an
  unsigned executable. They use the system's web engine (Edge on Windows, Safari on macOS, WebKit on Linux),
  which the system keeps up to date.

## Running locally
```bash
git clone https://github.com/serbenda/sketch.git
cd sketch
git switch development
```
How to start and verify it: [docs/SETUP.md](docs/SETUP.md).

## Structure
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
├── js/app.js          # the site: open, save and export
├── fonts/             # handwriting font (Caveat, OFL)
├── desktop/           # desktop version (Tauri): icon, smoke test and src-tauri/
├── scripts/           # build-portable.mjs, and the template's setup, sync and check scripts
├── tests/             # node --test; tests/e2e: walkthroughs in Chrome over DevTools, no dependencies
├── docs/              # VISION, STATE, WORKLOG, ROADMAP, phases, decisions, ARCHITECTURE, THREAT_MODEL…
├── .claude/ · .githooks/ · .github/
├── AGENTS.md          # rules for any AI agent
└── CLAUDE.md          # imports AGENTS.md and adds what is specific to Claude Code
```

## How to work with Claude
Every flow, as diagrams: [docs/WORKFLOWS.md](docs/WORKFLOWS.md).

```
/status                      at the start of every session
/new-phase <what>            phase file + plan → you approve → Claude implements on development
(automatic)                  record-changes skill: WORKLOG after every change
/close-phase                 criteria + DoD + updates STATE, ROADMAP and CHANGELOG (once per phase)
/prepare-pr                  reviewers + development → main PR (you merge it)
/decision <what>             when something hard to undo has to be chosen
```

## Contributing
Read [AGENTS.md](AGENTS.md) and the [Definition of Done](docs/DEFINITION_OF_DONE.md).

## License
[MIT](LICENSE) © Sergio Santiago Bendaña Quesada
