# 0006 — The license: all rights reserved, no use by AI

- **Status:** accepted
- **Date:** 2026-11-20

## Context
bsketch was published under the MIT License up to version 1.0.0. The owner wants to keep its intellectual property:
it is a personal project, anyone who wants to use it must ask first, and no AI or bot may reuse it.

## Options
| Option | Pros | Cons |
|---|---|---|
| A. Keep MIT | Simple, widely understood | Anyone can copy, sell and train on it |
| B. A source-available license (all rights reserved; viewing and personal evaluation only) with an explicit AI and text-and-data-mining reservation | The code stays visible (CI, Pages, Scorecard work as now); the rights and the reservation are stated | A license is a legal tool, not a technical lock: copies already made under MIT stay MIT, and public code can still be read |
| C. B plus a private repository, publishing only the built site | The source is no longer public | GitHub Pages and Actions minutes cost money on private repositories; Scorecard needs a public repository |

## Challenge
None formal. The owner chose B ("no se puede usar, es personal… que me proteja la propiedad intelectual"; "no puede
reutilizarse por ninguna IA, bot"). C stays open as the owner's decision.

## Decision
B. `LICENSE` becomes a proprietary license from 1.1.0 and every commit from 2026-11-20: viewing the code on GitHub and
using the official site and releases for personal evaluation are allowed; everything else needs written permission,
asked through GitHub. It reserves text and data mining (Directive (EU) 2019/790 art. 4(3)) and forbids any use by AI
or automated tools. Every source file carries the notice and a marker (`bsketch-7f3a9c2e`) that makes copies easy to
find; the page asks AI crawlers not to use it (`<meta name="robots" content="noai, noimageai">`); the desktop app
carries the copyright. Third-party parts keep their licenses.

## Consequences
- Versions up to 1.0.0 remain MIT for whoever has them; the change applies from 1.1.0.
- Crawlers that ignore `robots.txt`, meta tags or licenses are not stopped by them: the license gives legal ground,
  not technical protection. A domain-wide `robots.txt` lives in the site of `bendi.dev` (another repository).
- Contributions need a prior agreement with the owner.
- Not legal advice: the owner may want a lawyer's review, and can register the work (Registro de la Propiedad
  Intelectual) as proof of authorship and date.
