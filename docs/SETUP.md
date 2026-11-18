# Local environment

> How to run and verify the project. Claude reads it to know how to run and check its work.

## Requirements
- git and python3 (for the security hook and a local web server)
- Node.js 22 or newer (the tests use `node --test` and the global `WebSocket`)
- Google Chrome or Chromium, for the e2e walkthroughs (set `CHROME_BIN` if it is not in `/usr/bin`)
- [Gitleaks](https://github.com/gitleaks/gitleaks) 8.x: the git hooks refuse every commit without it
- Only for the desktop app: Rust (rustup) and the Tauri prerequisites of your system; CI builds it anyway

## First time
```bash
git clone https://github.com/serbenda/bsketch.git
cd bsketch
git switch development
git config core.hooksPath .githooks
```

## Daily use
| To | Command |
|---|---|
| Run locally | `python3 -m http.server 8000`, then open http://localhost:8000 |
| Run the engine tests | `npm test` |
| Run the browser walkthroughs | `npm run test:e2e` |
| Build the portable file | `npm run build:portable` (writes `dist/sketch-portable.html`) |
| Build the desktop app | `cd desktop && npx @tauri-apps/cli@2.12.4 icon icon.png && node ../scripts/build-portable.mjs app/index.html && npx @tauri-apps/cli@2.12.4 build` |

The local server is also defined in `.claude/launch.json` for the Claude Code preview.

## Verify
Same as CI's Hook and Tests jobs. Must pass before anything is considered done:
```bash
shellcheck --severity=error scripts/*.sh .claude/hooks/*.sh .githooks/*
bash scripts/test-guard.sh           # the Claude guard hook
bash scripts/test-check-records.sh   # the worklog and STATE check
bash scripts/test-githooks.sh        # the git hooks (needs gitleaks)
npm test                             # the drawing engine
npm run test:e2e                     # the editor, the portable file and offline use, in Chrome
```

## Stack checklist
- [x] **Requirements, Daily use and Verify** in this file filled in with real commands, and `Verify` passes locally.
- [x] **`.claude/launch.json`** defines the local server.
- [x] **CI job** "Tests" in `.github/workflows/ci.yml` runs formatting, HTML, unit, e2e and link checks, with actions pinned to a full commit SHA and `permissions: contents: read`.
- [x] **Dependabot**: `github-actions`, the scanner images, the dev container and `cargo` (desktop app). No npm entry: there are no npm dependencies.
- [x] **Static analysis**: Semgrep (SAST job) and CodeQL (`codeql.yml`, public repo).
- [x] **`.gitignore`** extended with the desktop build output.
- [x] **Environment variables**: none.
- [x] **Definition of Done**: the API/backend and CLI blocks removed.
- [ ] **Owner:** add the new checks (Secrets, Authorship, Hook, Hook (macOS bash 3.2), SAST, Dependencies, Records, Tests) to the required checks of the "Protect main" ruleset, by running `./scripts/setup-repo.sh` again or in GitHub → Settings → Rules.

## Environment variables
None. The project has no secrets and no configuration.
