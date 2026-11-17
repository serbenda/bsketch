# 0002 — Stack: a static site in plain JavaScript, with no runtime dependencies

- **Status:** accepted (recorded afterwards, when the project adopted project-template 1.0.0)
- **Date:** 2026-11-13

## Context
sketch has to run with no server and no network, be embeddable in Snowlog (which copies its engine) and build
into a single portable HTML file. Snowlog's own rules already forbid CDNs, frameworks and runtime npm packages.

## Options
| Option | Pros | Cons |
|---|---|---|
| A. Plain ES modules, own renderer | No dependencies to audit or update; Snowlog copies four files; works with a strict CSP and Trusted Types | Everything (hand-drawn stroke, editor) is our own code to maintain |
| B. A framework plus a hand-drawn library (e.g. roughjs) | Less code to write | A build step, dependencies in Snowlog's encrypted app, and a looser CSP |

## Challenge
None at the time: the decision predates the template's challenge rule.

## Decision
Option A: HTML, CSS and plain JavaScript modules served as they are from GitHub Pages, with our own seeded
hand-drawn renderer. Tests use only `node --test` and Chrome over the DevTools protocol.

## Consequences
- No `npm install` for the site, the tests or the portable build; `package.json` has no dependencies.
- New modules must use `import { … } from './x.js'` or `import * as X from './x.js'` and `export function|const|class`,
  which is what the portable bundler (`scripts/build-portable.mjs`) understands.
- Features that would need a big library (e.g. a full text layout engine) are out of scope or written small.
