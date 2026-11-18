# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioned with [SemVer](https://semver.org/).

## [Unreleased]
### Changed
- The interface's accent colour is now a blue taken from the logo (`#3451b2`, `#9db2ff` in dark), with more
  contrast than the old purple (7:1); the active tool's icon is dark on the dark theme's light accent, and the
  installed app's title bar is the logo's night blue.
- The zoom percentage button is big enough to tap (32 px).
- **The name is now bsketch**, with a hand-drawn **SB** logo: the site, the installed app, the portable file
  (`bsketch-portable.html`), the desktop app and the README. The repository moves to `serbenda/bsketch` and the site
  to `/bsketch/`. The `.sketch` format and drawings already saved in the browser are unchanged
  ([ADR 0005](docs/decisions/0005-rename-to-bsketch.md)).
- New logo: a hand-drawn "s" on night blue, for the site, the installed app and the desktop builds. The README
  opens with a banner and a screenshot.
- The project now follows [project-template](https://github.com/serbenda/project-template) 1.0.0: full mode with
  vision, state, worklog, roadmap, phases, decisions, architecture and threat model in `docs/`; the template's
  agents, commands, git hooks, Claude guard hook, CI jobs (secrets, authorship, hook tests, SAST, dependencies,
  records) and Dependabot entries.
- Everything is in English: the interface, the code and its comments, the tests, the documentation and the
  commit messages. Files renamed: `js/scene.js`, `js/stroke.js`, `js/render.js`, `css/styles.css`.
- The drawing in progress is now kept under `sketch.current` in the browser; a drawing kept by an older
  version (`sketch.actual`) is moved there the first time.

### Added
- **Fonts for text:** Hand (the handwriting one, as before), Normal and Code, in the style panel. Normal and Code
  are the system's own fonts, so nothing more is downloaded.
- **Arrowheads:** at the end, the start, both ends or none, chosen in the style panel; kept in `.sketch` files and
  read from `.excalidraw` ones.
- **Copy as PNG** (☰ menu or Alt+Shift+C): the selection, or the whole drawing, ready to paste in a chat or a
  document.
- **Ctrl+S** saves and **Ctrl+O** opens a file (Cmd on a Mac).
- **Grid:** the **G** key or "Show grid" in the ☰ menu draws a light grid behind the drawing (on screen only, never
  exported). New shapes, lines, arrows and texts start and end on it, a moved selection lands with its corner on it,
  and arrow keys move one cell (Shift: 1 px). Remembered in this browser.
- **Side menu (☰):** the file actions (New, Open, Save, PNG, SVG, Portable) move from the header into a side menu,
  together with the options: **Appearance** (System, Light or Dark, whatever the system theme is, remembered in
  this browser), **Canvas background** (six light colours, saved with the drawing and undoable) and a
  **Transparent background** toggle for PNG and SVG exports.
- **Portable version:** `sketch-portable.html`, a single file with everything inside (the font too) that opens
  with a double click in any browser, with nothing to install and no connection. Downloaded with the site's
  "Portable" button and tested in CI opened from disk.
- **Desktop version with Tauri** for Windows (an `.exe` that opens without installing), macOS (an `.app` for
  Intel and Apple Silicon) and Linux (AppImage), built by the "Desktop" workflow. The app exposes no system
  command to the page.
- **Everything with the keyboard:** with a tool chosen, Enter creates the shape in the center; Tab and
  Shift+Tab go through the elements; Alt+arrow keys resize; `[` and `]` rotate 15°; Enter writes inside.
  Visible focus and a description of the shortcuts for screen readers.
- **Smoother large drawings:** each element's stroke is prepared once and reused, and only what is visible is
  painted. With 2,000 elements, panning at 100% went from 36 to 18 ms per frame (measured in CI).
- `mergeScenes`: three-way merge of two versions of a drawing, element by element (Snowlog uses it to join
  changes from two devices).
- **Handwriting font** (Caveat, OFL license) for texts, served from the site. Texts are measured with it.
- **Text inside shapes:** double-click (or Enter) on a rectangle, diamond or ellipse to write inside. Centered,
  wrapped to the shape's width, and it follows the shape when moved, resized or rotated.
- **Arrows attached to shapes:** an arrow that starts or ends on a shape stays on its outline and follows it.
  Its ends can be dragged to attach or detach them.
- **Rotate** shapes, texts and groups with the round handle (Shift: 15° steps).
- **Group and ungroup** (Ctrl+G, Ctrl+Shift+G), **align** (left, center, right, top, middle, bottom) and
  **distribute** with equal gaps.
- Opens **offline** (service worker) and can be installed as an app.
- A screen reader announces the selection.
- **Chrome walkthroughs** (`npm run test:e2e`, also in CI): attached arrows, text inside, rotation, undo,
  grouping, alignment, opening an `.excalidraw` file, opening offline and fitting on a phone.
- Opening `.excalidraw` files keeps bound text, attached arrows, groups and rotation.
- **Drawing whiteboard**, full screen, with no accounts and no network (the CSP forbids any connection):
  - Tools: select, pan, rectangle, diamond, ellipse, arrow, line, pencil, text and eraser, with one-key
    shortcuts (V, H, R, D, O, A, L, P, T, E).
  - Our own hand-drawn stroke (seeded wobble: each shape is always drawn the same), hachure or solid fill,
    stroke width, dashed lines and three levels of sloppiness.
  - Select by click or box, move, resize (Shift keeps the proportions), duplicate, copy and paste, bring to
    front or send to back, delete, undo and redo.
  - Zoom with Ctrl+wheel, with the buttons or by pinching on a phone; "Fit the whole drawing".
  - Open and save `.sketch` files (JSON), open `.excalidraw` files and export to PNG and SVG.
  - The drawing in progress is kept in the browser so it is not lost when the tab closes.
  - Light and dark themes (in dark mode the canvas is shown inverted, without changing the real colors or what
    is exported).
- The editor (`js/editor.js`) can be mounted in other pages: it never uses `innerHTML` and works with Trusted
  Types.
- Engine tests (`npm test`, no dependencies), also in CI.
- Initial structure from the earlier Spanish version of the template: Definition of Done, development → main
  flow, CI, CodeQL, Dependabot, GitHub Pages publishing and the setup script.

### Fixed
- Opening a file (menu, Ctrl+O or dropping it) over a drawing now asks first, as "New" does, instead of replacing it.
- Exporting a very big drawing to PNG no longer downloads a broken file: it is exported at a smaller scale so it
  fits what the browser allows, and if it still cannot be made the site says so.
- Aligning or distributing no longer detaches arrows from the shapes they are attached to.
- Enter and Space on a toolbar or panel button now press that button instead of acting on the canvas.
- Undo no longer keeps steps that changed nothing (a click on a handle, a text left as it was) and they no
  longer clear redo; dragging in the colour picker is a single undo step.
- Starting a pinch while drawing no longer leaves an empty shape behind; a third finger is ignored.
- Dragging a box in a drawing with many attached arrows and texts no longer recomputes all of them on every move.
- Texts measured before the handwriting font loaded are measured again once it does.
- The text box being written follows zoom and pan.
- A double click with the hand or the eraser no longer starts a text; the right mouse button no longer draws;
  Space held while the window loses focus no longer leaves the editor panning.
- Closing an embedded editor while writing keeps the text.
- The desktop build's Rust dependencies are pinned in `desktop/src-tauri/Cargo.lock`, so every build of a
  commit compiles the same versions.
- Offline, the site no longer opens as another page that was opened in the same tab before (such as the
  portable file).
