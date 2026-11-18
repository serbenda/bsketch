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
| Browser storage (`sketch.current`) | Scripts on the same origin (none other) | JSON drawing | No |
| Browser storage (`sketch.prefs`) | Scripts on the same origin (none other) | The appearance (`system`, `light` or `dark`) | No |
| Snowlog embedding | Snowlog, with scenes decrypted from the user's vault | Scene object | Snowlog's session |
| Desktop webview | The page inside the app | — (no IPC exposed) | No |
| CI and desktop build | Workflows, actions, crates, `npx` tools | Code | GitHub permissions |

## Threats and controls
| Threat | Entry point | Control | How it is checked |
|---|---|---|---|
| Script injection through drawing text or attributes (XSS) | Files, storage, Snowlog | Texts rendered with `textContent` or escaped; colors and fields validated by `cleanElement`; no `innerHTML`; Trusted Types required | Unit test "opening: validates whatever comes from the file"; SAST |
| Data exfiltration from a malicious file or injected code | Files, any script | CSP `connect-src 'none'` (site and portable), `default-src 'none'`, no third-party scripts | CSP in `index.html` and the portable build; e2e checks no request leaves |
| Denial of service with huge files | Files | Limits: 20,000 elements, 5,000 points, 10,000 characters per text, clamped sizes | Unit tests |
| Page escaping the desktop app | Desktop webview | No commands, plugins or global Tauri API exposed | `desktop/src-tauri` review; WebDriver smoke test |
| Leaked secrets | Repo | No secrets needed; Gitleaks in pre-commit and CI | Secrets job |
| Vulnerable or malicious dependency | CI, desktop build | Actions pinned by SHA; Tauri CLI pinned; Dependabot with a 7-day cooldown | Dependencies job; Dependabot |
| Agent misled by prompt injection | Agent sessions | Guard hook, sandbox, owner-only guardrails, git hooks | Template hook tests in CI |

## Out of scope
- Signing the desktop executables (cost; see [RISKS.md](RISKS.md)).
- Protecting a drawing left in browser storage on a shared computer: the browser's own profile protection applies.
