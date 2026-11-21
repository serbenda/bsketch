# The `.sketch` format, version 1

bsketch saves a drawing as a `.sketch` file: UTF-8 JSON, one object, ending in a newline. Drawings kept in the
browser and in Snowlog's vaults hold the same object.

**Version 1 is frozen.** Every `.sketch` file saved by bsketch 1.0.0 or later opens in every later version with
nothing lost (see [the promise](#the-compatibility-promise)). The tests open a file saved by each release
(`tests/fixtures/format/`, checked by `tests/format.test.mjs`).

## The file

```json
{ "type": "sketch", "version": 1, "background": "#ffffff", "elements": [ … ], "files": { … } }
```

| Field | Meaning |
|---|---|
| `type` | Always `"sketch"`. Anything else is not a bsketch drawing (`"excalidraw"` files are read too, see below). |
| `version` | Always `1`. |
| `background` | The canvas colour (`#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`/`rgba()`, `transparent` or a colour name). |
| `elements` | The elements, from back to front (at most 20,000). |
| `files` | Only when there are pictures: a picture's id → its `data:image/{png,jpeg,gif,webp};base64,…` URL (each up to 10 MB of text, 60 MB in all). Only the pictures the elements use are saved. |

## Elements

Every element has these fields:

| Field | Meaning |
|---|---|
| `id` | A unique string of 1 to 64 characters. |
| `type` | `rectangle`, `ellipse`, `diamond`, `line`, `arrow`, `draw` (a pencil stroke), `text`, `image` or `frame`. |
| `x`, `y`, `w`, `h` | Position and size in drawing units (within ±1,000,000). |
| `seed` | A whole number that fixes the hand-drawn wobble, so the drawing looks the same every time. |
| `stroke`, `fill` | Colours, as for `background`. |
| `fillStyle` | `hachure`, `cross-hatch` or `solid`. |
| `width` | Stroke width, 0.5 to 40. |
| `dashed` | `true` for a dashed stroke. |
| `roughness` | How hand-drawn it looks, 0 to 3. |
| `opacity` | 0.05 to 1. |
| `fontSize` | Text size, 6 to 400 (kept on every element, used by texts). |

Optional fields, written only when they differ from the default:

| Field | On | Meaning |
|---|---|---|
| `angle` | Shapes, texts, pictures | Rotation in radians around the centre. |
| `points` | `line`, `arrow`, `draw` | Points relative to `x`, `y` (1 to 5,000). |
| `startId`, `endId` | `line`, `arrow` | The shape each end is attached to; the ends follow it. |
| `heads` | `arrow` | `start`, `both` or `none` (default: `end`). |
| `route` | `line`, `arrow` with two points | `elbow` (right angles, around shapes in the way) or `curve` (default: straight). |
| `bend` | Curved ones | How much it curves, −2 to 2 (default 0.25). |
| `animated` | `line`, `arrow` | `true`: dashes that move from start to end. |
| `rounded` | `rectangle` | `true` for round corners. |
| `dotted` | Dashed shapes and lines | `true`: dots instead of dashes (always with `dashed`). |
| `text` | `text` | The text (up to 10,000 characters; `\n` between lines). |
| `font` | `text` | `normal` or `code` (default: the hand-drawn one). |
| `containerId` | `text` | The shape the text is written in; then `align` is `center`. |
| `align` | `text` | `center` for a text inside a shape. |
| `fileId` | `image` | The picture's id in `files`. |
| `name` | `frame` | The frame's title (up to 100 characters). |
| `notes` | `frame` | Speaker notes (up to 2,000 characters). |
| `locked` | Any | `true`: it can't be selected or changed until unlocked. |
| `group` | Any | Elements with the same group id are selected and moved together. |

Some things are worked out again on opening rather than trusted: where attached arrows end and where a text sits
inside its shape (and the path an elbow arrow takes around shapes is never saved).

## How a file is read

A file is checked field by field before anything is drawn: a value of the wrong kind or out of range becomes the
default or is clamped, an element that can't be used (an unknown type, a line without points, a picture without its
file) is left out, and **fields bsketch doesn't know are ignored**. A file can't run code or load anything from the
network. Excalidraw files (`"type": "excalidraw"`) are translated on opening; that is a convenience, not part of
this promise.

Libraries (`.bsketchlib`) are `{ "type": "bsketchlib", "version": 1, "items": [{ "name", "elements", "files" }] }`,
with elements as above, and follow the same promise.

## The compatibility promise

1. **Every file of version 1 opens** in every later version of bsketch, with every element and every field above.
2. **Version 1 only grows by optional fields** whose absence means what it means today. No field is renamed or
   removed, and no value changes meaning.
3. A change that can't follow rule 2 would be **version 2**, and later versions would still open version 1.
4. An **older** version opening a file from a newer one opens it, but leaves out what it doesn't know (an element
   type or an optional field); saving it there loses those parts. Update bsketch before editing such a file.
5. Every release adds a file saved by it to `tests/fixtures/format/` (`node scripts/make-format-fixtures.mjs`), and
   no release ships if one of those files stops opening.
