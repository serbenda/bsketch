# 0003 — Distribution: web, portable HTML file and Tauri desktop app

- **Status:** accepted (recorded afterwards, when the project adopted project-template 1.0.0)
- **Date:** 2026-11-13

## Context
The owner wants sketch on Windows, macOS and Linux, without a browser window if possible, and portable. On
company computers an unsigned executable is likely to be blocked or flagged by antivirus tools.

## Options
| Option | Pros | Cons |
|---|---|---|
| A. Web only (installable as an app from Chrome or Edge) | Nothing to build | Needs a browser, and the site has to be reachable the first time |
| B. Portable HTML file | One file, opens anywhere, not a program, no network | Still opens in a browser |
| C. Tauri desktop app | Small (1–3 MB on Windows and macOS); the system's web engine is updated by the system | Unsigned; WebKit on macOS and Linux; the Linux AppImage is ~76 MB |
| D. Electron desktop app | Same Chromium everywhere | ~100 MB per app; its bundled Chromium ages unless re-released |

## Challenge
None as a formal `/challenge`: the options were compared in a written research summary before the owner chose.

## Decision
Offer A, B and C together: the web site (installable), `sketch-portable.html` for locked-down or offline
computers, and Tauri builds from the "Desktop" workflow. Not D.

## Consequences
- The desktop app loads the portable file and exposes no system command to the page (no IPC of its own, no
  plugins, `withGlobalTauri: false`).
- Executables are unsigned until the owner decides to pay for signing; the README says how to open them.
- The "Desktop" workflow checks on Linux, over WebDriver, that the page inside the app starts.
