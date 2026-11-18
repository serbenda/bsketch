# bsketch vision

> The filter for deciding what goes in and what doesn't: Claude reads it before proposing features.

## The problem
Drawing a quick diagram (a system sketch, a flow, a wireframe) usually means opening a cloud tool that wants an
account, sends the drawing to a server, or can't be used on a locked-down or offline computer.

## Who it is for
The owner first: someone who sketches systems and flows for work and personal projects, on his own computers and
on company ones, and who keeps notes in [Snowlog](https://github.com/serbenda/snowlog). Then anyone who wants a
private, offline whiteboard.

## The idea
A hand-drawn whiteboard that runs entirely in the browser (or as a single file, or as a small desktop app) and
never sends the drawing anywhere.

## Main hypothesis
> A person will use sketch if it is as quick as Excalidraw for everyday diagrams and works anywhere, offline and
> without an account.

## What it really competes with
Excalidraw and tldraw, paper and a photo of it, and the drawing tools built into slides or office suites.

## Differentiators
1. No network at all: the CSP forbids any connection; nothing to sign in to.
2. Runs anywhere: on the web, as one portable HTML file (no install, not a program), or as a tiny desktop app.
3. Embedded in Snowlog, where drawings are stored end-to-end encrypted with the notes.

## What NOT to do
- Don't add network features: no sync server, no live collaboration, no sharing links, no analytics or telemetry.
- Don't add accounts or anything that needs a backend.
- Don't add runtime dependencies or frameworks: the engine stays plain JavaScript modules that Snowlog can copy.
- Don't copy Excalidraw's (or anyone's) code, icons, fonts or assets; reading the public `.excalidraw` JSON is fine.
- Don't use `innerHTML` with anything that comes from a drawing or a file.
- Don't chase feature parity with Excalidraw: libraries, embeds and images only if the owner asks for them.

## How we'll know it works
- The owner uses it (alone or inside Snowlog) for his real diagrams instead of a cloud tool.
- Every release passes the e2e walkthroughs, including the portable file opened from disk with no network.
