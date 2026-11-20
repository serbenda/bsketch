# Threat model

> What we protect, from whom, where the attacks come in and what stops them. `security-reviewer` checks each
> change against it. A threat without a control is a risk and also goes in [RISKS.md](RISKS.md).

Last reviewed: 2026-11-17

## What we protect (assets)
| Asset | Why it matters | Sensitive? |
|---|---|---|
| The user's drawings | They can hold private or work information (architecture, plans) | Yes |
| The engine's integrity | Snowlog copies it into an end-to-end encrypted notes app; a bug or injected code there could reach decrypted notes | Yes |
| The user's computer (desktop app) | The app runs locally | Yes |
| The owner's repository and releases | A compromised workflow or dependency could ship malicious builds | Yes |

## Who could attack (actors)
- Someone who sends the user a crafted `.sketch` or `.excalidraw` file.
- A malicious or compromised GitHub Action, Rust crate or npm tool used in CI or the desktop build.
- An AI agent working on the repo, misled by prompt injection (issues, web pages, files it reads).

## Where attacks come in (entry points and trust boundaries)
| Entry point | Who can reach it | Data it receives | Authenticated? |
|---|---|---|---|
| Open file / drag and drop | Anyone who gets a file to the user | JSON drawing | No |
| Browser storage: IndexedDB `bsketch` (or `sketch.drawing.<id>` without it; `sketch.current` from older versions) | Scripts on the same origin (none other) | Each drawing's JSON, opened through `parseScene`; the library (`_library`), opened through `parseLibrary` | No |
| Browser storage (`sketch.drawings`) | Scripts on the same origin (none other) | The list of drawings: ids checked against `[a-z0-9]{4,40}`, names cut to 80 characters, at most 500; an unknown open drawing falls back to the first | No |
| Pictures (insert, paste, drop) and library files | Anyone who gets a file to the user | Image files; `.bsketchlib` / `.excalidrawlib` JSON | No |
| Browser storage (`sketch.prefs`) | Scripts on the same origin (none other) | The appearance (`system`, `light` or `dark`), the grid (`true`/`false`) and the language (`auto`, `en` or `es`) | No |
| Snowlog embedding | Snowlog, with scenes decrypted from the user's vault | Scene object | Snowlog's session |
| Desktop webview | The page inside the app | — (no IPC exposed) | No |
| CI and desktop build | Workflows, actions, crates, `npx` tools | Code | GitHub permissions |

## Threats and controls
| Threat | Entry point | Control | How it is checked |
|---|---|---|---|
| Script injection through drawing text or attributes (XSS) | Files, storage, Snowlog | Texts rendered with `textContent` or escaped; colors and fields validated by `cleanElement`; every number in SVG markup forced to a number (for scenes an embedder passes without `parseScene`); no `innerHTML`; Trusted Types required | Unit test "opening: validates whatever comes from the file"; SAST |
| A picture used to run script or reach the network | Files, pictures, library | Only base64 `data:` URLs of PNG, JPEG, GIF or WebP are kept (no SVG, no remote URL), each up to ~7.5 MB and ~45 MB per drawing; checked again before they go into SVG markup; CSP `img-src 'self' data: blob:` | Unit tests "images: …"; fuzz tests |
| Data exfiltration from a malicious file or injected code | Files, any script | CSP `connect-src 'none'` (site and portable), `default-src 'none'`, no third-party scripts | CSP in `index.html` and the portable build; e2e checks no request leaves |
| Denial of service with huge files | Files | Limits: 20,000 elements, 5,000 points, 10,000 characters per text, clamped sizes; coordinates within ±1e6; at most 2,000 hachure lines per shape; long words split by halving | Unit tests "security: …" |
| Page escaping the desktop app | Desktop webview | No commands, plugins or global Tauri API exposed; the page's own CSP (the portable file's: `default-src 'none'`, `connect-src 'none'`, script by hash, Trusted Types) is the app's CSP (`"csp": null` in `tauri.conf.json`, so Tauri doesn't rewrite the HTML) | `desktop/src-tauri` review; WebDriver smoke test; the portable walkthrough checks that CSP and that a request is refused |
| Leaked secrets | Repo | No secrets needed; Gitleaks in pre-commit and CI | Secrets job |
| Vulnerable or malicious dependency | CI, desktop build | Actions pinned by SHA; Tauri CLI pinned; Dependabot with a 7-day cooldown | Dependencies job; Dependabot |
| Agent misled by prompt injection | Agent sessions | Guard hook, sandbox, owner-only guardrails, git hooks | Template hook tests in CI |

## Out of scope
- Signing the desktop executables (cost; see [RISKS.md](RISKS.md)).
- Protecting a drawing left in browser storage on a shared computer: the browser's own profile protection applies.
