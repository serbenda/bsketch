# 0005 — The name: bsketch, with an SB logo

- **Status:** accepted
- **Date:** 2026-11-18

## Context
"sketch" is a common word, shared with many other tools, and the owner wanted the project to carry something of
their own: a "b" for bendi.

## Options
| Option | Pros | Cons |
|---|---|---|
| A. Change only the name people see (title, app, files people download) | No URL change | The repository and the site's address still say "sketch" |
| B. Also rename the repository, so the site moves to `/bsketch` | One name everywhere | The old site address stops working; installed apps and bookmarks have to be set up again |
| C. Also rename the `.sketch` file format, the storage keys and the `sk-` CSS prefix | Nothing named "sketch" left | Existing drawings and the Snowlog integration would break |

## Challenge
None as a formal `/challenge`: the owner chose between A and B, and C was ruled out because it would lose
existing drawings.

## Decision
B, with the parts C would change kept as they are. The product, the PWA, the window, the portable file
(`bsketch-portable.html`), the desktop executables (`bsketch-*`) and the README say **bsketch**. The repository
becomes `serbenda/bsketch`, and the owner renames it on GitHub. The logo becomes a hand-drawn **SB** on the same
night blue, with the orange dot.

These stay unchanged so nothing already saved breaks:
- the `.sketch` file format (`"type": "sketch"`);
- the browser storage keys (`sketch.current`, `sketch.prefs`);
- the editor's `sk-` CSS prefix, which Snowlog embeds;
- the name of the service worker's cache.

## Consequences
- GitHub redirects the repository's old URLs (clones, issues, raw files). The Pages site does not: the old address
  (`/sketch/`) stops working once the repository is renamed, and an installed app has to be installed again from
  the new address.
- The workflows name the files they build (`.github/`, the owner's), so they change in the same push.
- Snowlog's copy (`scripts/update-sketch.mjs` there) keeps working through GitHub's redirect, but should point to
  the new name.
