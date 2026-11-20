// Editor walkthroughs in a real (headless) Chrome: drawing, attaching arrows, writing inside shapes,
// rotating, grouping, aligning, undoing, opening an .excalidraw file and opening offline.
// They run with `npm run test:e2e` and in CI. Without Chrome, they are skipped.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, findChrome } from './cdp.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const chrome = findChrome();
const skip = chrome ? false : 'No Chrome found (set CHROME_BIN)';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json', '.woff': 'font/woff',
};

let server;
let base;
// Chrome's offline mode cuts the page's network but not the service worker's: to be really offline,
// the test server stops answering.
let serverDown = false;
let browser;

before(async () => {
  if (skip) return;
  server = createServer(async (req, res) => {
    if (serverDown) {
      res.destroy();
      return;
    }
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = join(ROOT, path.endsWith('/') ? `${path}index.html` : path);
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://localhost:${server.address().port}/`;
  browser = await launch(chrome);
});

after(async () => {
  await browser?.close();
  server?.close();
});

// A drawing's scene as kept in this browser's IndexedDB (written 400 ms after each change); the open one by default.
const stored = (page, id) => page.eval(`new Promise((resolve, reject) => {
  const req = indexedDB.open('bsketch');
  req.onerror = () => reject(req.error);
  req.onsuccess = () => {
    const id = ${id ? JSON.stringify(id) : 'JSON.parse(localStorage.getItem("sketch.drawings")).active'};
    const get = req.result.transaction('scenes').objectStore('scenes').get(id);
    get.onsuccess = () => resolve(get.result ?? null);
    get.onerror = () => reject(get.error);
  };
})`);
async function scene(page, id) {
  await new Promise((r) => setTimeout(r, 500));
  return JSON.parse(await stored(page, id));
}

// From drawing coordinates to the screen: an empty canvas at 100%, with 0,0 in the center.
async function screen(page) {
  const r = await page.eval('(() => { const r = document.querySelector(".sk-canvas").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()');
  return (x, y) => ({ x: r.x + x, y: r.y + y });
}

async function open(page) {
  await page.goto(base);
  await page.waitFor('!!document.querySelector(".sk-canvas") && !document.getElementById("canvas").inert');
  await page.waitFor('document.fonts.check(\'24px "Sketch Hand"\')');
}

test('attached arrows, text inside, rotation, groups and alignment', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.press('r');
    await page.drag(at(-300, -50), at(-150, 50));
    await page.press('o');
    await page.drag(at(150, -50), at(300, 50));
    await page.press('a');
    await page.drag(at(-220, 0), at(220, 0)); // from inside the box to inside the ellipse
    let s = await scene(page);
    const [rect, ell, arrow] = s.elements;
    assert.deepEqual(s.elements.map((e) => e.type), ['rectangle', 'ellipse', 'arrow']);
    assert.equal(arrow.startId, rect.id, 'attached to the box');
    assert.equal(arrow.endId, ell.id, 'attached to the ellipse');
    assert.ok(Math.abs(arrow.x - (-150 + 6)) < 1, `leaves from the box's outline: ${arrow.x}`);

    // Moving the box: the arrow follows it.
    await page.press('v');
    await page.drag(at(-300, 0), at(-300, 150));
    s = await scene(page);
    const moved = s.elements.find((e) => e.type === 'arrow');
    assert.ok(moved.y > 50, `the arrow follows the box: ${moved.y}`);
    assert.equal(moved.startId, rect.id);

    // Double click inside the box: write inside it.
    await page.mouseClick(at(-225, 150), { count: 2 });
    await page.waitFor('!document.querySelector(".sk-textbox").hidden');
    await page.type('Web server');
    await page.press('Escape');
    s = await scene(page);
    const text = s.elements.find((e) => e.type === 'text');
    assert.equal(text.text, 'Web server');
    assert.equal(text.containerId, rect.id);
    const tc = text.x + text.w / 2;
    assert.ok(Math.abs(tc - -225) < 1, `centered in the box: ${tc}`);

    // Rotate the box with its handle (above the top side).
    await page.mouseClick(at(-300, 150));
    await page.drag(at(-225, 100 - 6 - 22), at(-100, 150), { steps: 12 });
    s = await scene(page);
    const turned = s.elements.find((e) => e.id === rect.id);
    assert.ok(Math.abs(turned.angle - Math.PI / 2) < 0.15, `rotated about 90°: ${turned.angle}`);
    assert.equal(s.elements.find((e) => e.type === 'text').angle, turned.angle, 'the text rotates with it');

    // Undo the rotation.
    await page.press('z', { ctrl: true });
    s = await scene(page);
    assert.equal(s.elements.find((e) => e.id === rect.id).angle, undefined);

    // Select all, group, ungroup and align to the top.
    await page.press('a', { ctrl: true });
    await page.press('g', { ctrl: true });
    s = await scene(page);
    const groups = new Set(s.elements.filter((e) => e.type !== 'text').map((e) => e.group));
    assert.equal(groups.size, 1);
    assert.ok([...groups][0]);
    await page.press('g', { ctrl: true, shift: true });
    s = await scene(page);
    assert.ok(s.elements.every((e) => !e.group));
    await page.click('button[aria-label="Align top"]');
    s = await scene(page);
    const r2 = s.elements.find((e) => e.id === rect.id);
    const e2 = s.elements.find((e) => e.id === ell.id);
    assert.ok(Math.abs(r2.y - e2.y) < 1, `both at the top: ${r2.y} ${e2.y}`);
    const a2 = s.elements.find((e) => e.id === arrow.id);
    assert.equal(a2.startId, rect.id, 'aligning keeps the arrow attached to the box');
    assert.equal(a2.endId, ell.id, 'and to the ellipse');

    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('everything with the keyboard', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    assert.match(await page.eval('document.getElementById(document.querySelector(".sk-editor").getAttribute("aria-describedby")).textContent'), /Tab/);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('r');
    await page.press('Enter'); // rectangle in the center
    await page.press('ArrowRight', { alt: true }); // 10 px wider
    await page.press(']'); // rotated 15°
    let s = await scene(page);
    assert.equal(s.elements.length, 1);
    assert.equal(s.elements[0].w, 170);
    assert.ok(Math.abs(s.elements[0].angle - Math.PI / 12) < 1e-9);
    await page.press('Enter'); // write inside
    await page.waitFor('!document.querySelector(".sk-textbox").hidden');
    await page.type('Hello');
    await page.press('Escape');
    await page.press('Escape'); // nothing selected
    await page.press('o');
    await page.press('Enter');
    s = await scene(page);
    assert.deepEqual(s.elements.map((e) => e.type), ['rectangle', 'text', 'ellipse']);
    assert.equal(s.elements[1].containerId, s.elements[0].id);
    await page.press('Tab');
    assert.equal(await page.eval('document.querySelector(".sk-sr[aria-live]").textContent'), 'Selected: rectangle');
    await page.press('Delete');
    s = await scene(page);
    assert.deepEqual(s.elements.map((e) => e.type), ['ellipse'], 'deleted together with its text');
    // Enter on a toolbar button presses it instead of acting on the canvas.
    await page.press('Escape');
    await page.eval('document.querySelector(\'.sk-toolbar button[aria-label="Diamond"]\').focus()');
    await page.press('Enter');
    assert.equal(await page.eval('document.querySelector(\'.sk-toolbar button[aria-label="Diamond"]\').getAttribute("aria-pressed")'), 'true');
    s = await scene(page);
    assert.deepEqual(s.elements.map((e) => e.type), ['ellipse'], 'Enter on the button creates nothing');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('undo: a colour drag is one step and a change that changed nothing is none', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.press('r');
    await page.drag(at(-100, -50), at(100, 50));
    const color = 'input[aria-label="Other stroke color"]';
    for (const c of ['#ff0000', '#00ff00', '#0000ff']) await page.fill(color, c);
    await page.eval(`${page.sel(color)}.dispatchEvent(new Event('change', { bubbles: true }))`);
    let s = await scene(page);
    assert.equal(s.elements[0].stroke, '#0000ff');
    // Clicking the box again without moving it leaves no step behind.
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.mouseClick(at(-100, 0));
    await page.press('z', { ctrl: true });
    s = await scene(page);
    assert.equal(s.elements.length, 1);
    assert.equal(s.elements[0].stroke, '#1e1e1e', 'one undo brings back the colour from before the drag');
    await page.press('z', { ctrl: true });
    s = await scene(page);
    assert.equal(s.elements.length, 0, 'the next undo removes the box');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('a pinch started while drawing zooms and leaves nothing behind', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.press('r');
    const touch = (type, points) => page.send('Input.dispatchTouchEvent', {
      type, touchPoints: points.map((p, id) => ({ x: p.x, y: p.y, id })),
    });
    const a = at(-50, 0);
    await touch('touchStart', [a]);
    await touch('touchMove', [at(-40, 10)]);
    await touch('touchStart', [at(-40, 10), at(50, 0)]); // the second finger: now it is a pinch
    for (let i = 1; i <= 5; i++) await touch('touchMove', [at(-40 - i * 20, 10), at(50 + i * 20, 0)]);
    await touch('touchEnd', []);
    // A finished drawing saves the scene: only this ellipse may be in it.
    await page.press('o');
    await page.drag(at(100, 100), at(200, 160));
    const s = await scene(page);
    assert.deepEqual(s.elements.map((e) => e.type), ['ellipse'], 'no shape was left behind by the pinch');
    const zoom = await page.eval('document.querySelector(".sk-zoomlabel").textContent');
    assert.notEqual(zoom.replace(/\s/g, ''), '100%', `it zoomed: ${zoom}`);
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('the side menu: appearance, canvas background and keyboard use', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
    await open(page);
    const canvasFilter = () => page.eval('getComputedStyle(document.querySelector(".sk-canvas")).filter');
    assert.notEqual(await canvasFilter(), 'none', 'a dark system shows the canvas inverted');

    // Opened with the keyboard; Escape closes it and gives the focus back.
    await page.eval('document.getElementById("menu-button").focus()');
    await page.press('Enter');
    await page.waitFor('document.getElementById("menu").open');
    assert.equal(await page.eval('document.getElementById("menu-button").getAttribute("aria-expanded")'), 'true');
    assert.equal(await page.eval('document.getElementById("background-note").hidden'), false, 'the note about the inverted canvas');
    await page.press('Escape');
    await page.waitFor('!document.getElementById("menu").open');

    // Light, on a dark system: the canvas is not inverted, and it stays so after a reload.
    await page.click('#menu-button');
    await page.click('input[name="appearance"][value="light"]');
    assert.equal(await canvasFilter(), 'none');
    assert.equal(await page.eval('document.getElementById("background-note").hidden'), true);
    await page.reload();
    await page.waitFor('!!document.querySelector(".sk-canvas")');
    assert.equal(await page.eval('document.documentElement.dataset.theme'), 'light');
    assert.equal(await canvasFilter(), 'none', 'still light after a reload');

    // Canvas background: saved with the drawing and undoable.
    await page.click('#menu-button');
    await page.click('input[name="background"][value="#e7f5ff"]');
    let s = await scene(page);
    assert.equal(s.background, '#e7f5ff');
    await page.press('Escape');
    await page.waitFor('!document.getElementById("menu").open');
    await page.press('z', { ctrl: true });
    s = await scene(page);
    assert.equal(s.background, '#ffffff', 'undone');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('the grid: G turns it on, new shapes and moves land on it, and it is remembered', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('g');
    assert.equal(await page.eval('document.querySelector(".sk-sr[aria-live]").textContent'), 'Grid on');
    await page.press('r');
    await page.drag(at(13, 27), at(118, 92));
    let s = await scene(page);
    const r = s.elements[0];
    assert.deepEqual([r.x, r.y, r.w, r.h], [20, 20, 100, 80], 'the box landed on the grid');

    // Moving it by an odd amount keeps its corner on the grid.
    await page.drag(at(20, 50), at(53, 79));
    s = await scene(page);
    assert.deepEqual([s.elements[0].x, s.elements[0].y], [60, 40]);
    // Arrow keys move one cell; Shift+arrow 1 px.
    await page.press('ArrowRight');
    await page.press('ArrowDown', { shift: true });
    s = await scene(page);
    assert.deepEqual([s.elements[0].x, s.elements[0].y], [80, 41]);
    // An arrow from the box to empty space: attached at its start, its free end on the grid.
    await page.press('a');
    await page.drag(at(130, 80), at(257, 163));
    s = await scene(page);
    const arrow = s.elements.find((e) => e.type === 'arrow');
    assert.equal(arrow.startId, s.elements[0].id, 'attached to the box');
    const end = arrow.points[arrow.points.length - 1];
    assert.deepEqual([arrow.x + end.x, arrow.y + end.y], [260, 160], 'its free end on the grid');

    // Remembered: after a reload the menu's switch is on.
    await page.reload();
    await page.waitFor('!!document.querySelector(".sk-canvas")');
    await page.click('#menu-button');
    assert.equal(await page.eval('document.getElementById("grid").checked'), true);
    await page.click('#grid'); // off again from the menu
    await page.press('Escape');
    assert.equal(JSON.parse(await page.eval('localStorage.getItem("sketch.prefs")')).grid, false);
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('arrowheads, copy as PNG, Ctrl+S and opening a file as a new drawing', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');

    // Arrowheads: chosen in the panel before drawing, and changed on a selected arrow.
    await page.press('a');
    assert.equal(await page.eval('document.querySelector(\'[aria-label="Arrowheads"]\').closest("div").hidden'), false);
    await page.click('[aria-label="Arrowheads"] button', 'Both');
    await page.drag(at(-100, 0), at(100, 0));
    let s = await scene(page);
    assert.equal(s.elements[0].heads, 'both');
    await page.click('[aria-label="Arrowheads"] button', 'None');
    s = await scene(page);
    assert.equal(s.elements[0].heads, 'none');
    await page.click('[aria-label="Arrowheads"] button', 'End');
    s = await scene(page);
    assert.equal(s.elements[0].heads, undefined, 'the default is not stored');

    // Copy as PNG (Alt+Shift+C): what reaches the clipboard is a real PNG. Headless Chrome cannot read the
    // clipboard back, so the write itself is recorded.
    await page.eval(`navigator.clipboard.write = async (items) => {
      const blob = await items[0].getType('image/png');
      const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
      window.__clip = { types: items.flatMap((i) => i.types), size: blob.size, png: head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47 };
    }`);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'C', code: 'KeyC', windowsVirtualKeyCode: 67, modifiers: 1 | 8 });
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'C', code: 'KeyC', windowsVirtualKeyCode: 67, modifiers: 1 | 8 });
    await page.waitFor('document.querySelector("#status").textContent.includes("copied as PNG")');
    const clip = await page.eval('window.__clip');
    assert.deepEqual(clip.types, ['image/png']);
    assert.ok(clip.png && clip.size > 1000, `a PNG of ${clip.size} bytes`);

    // Ctrl+S saves: a .sketch file is downloaded.
    await page.eval('window.__downloads = []; HTMLAnchorElement.prototype.click = function () { window.__downloads.push(this.download); }');
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('s', { ctrl: true });
    assert.deepEqual(await page.eval('window.__downloads'), ['Drawing 1.sketch'], 'named after the drawing');

    // Opening a file makes a new drawing with it: the one open stays in this browser's list.
    const dir = await mkdtemp(join(tmpdir(), 'sketch-'));
    const file = join(dir, 'other.sketch');
    await writeFile(file, JSON.stringify({ type: 'sketch', version: 1, background: '#ffffff', elements: [] }));
    const { root } = await page.send('DOM.getDocument', {});
    const { nodeId } = await page.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#file' });
    await page.send('DOM.setFileInputFiles', { nodeId, files: [file] });
    await page.waitFor('document.querySelector("#status").textContent.includes("other.sketch")');
    s = await scene(page);
    assert.equal(s.elements.length, 0, 'the file is open');
    const idx = JSON.parse(await page.eval('localStorage.getItem("sketch.drawings")'));
    assert.deepEqual(idx.list.map((d) => d.name), ['other', 'Drawing 1']);
    const kept = await scene(page, idx.list[1].id);
    assert.equal(kept.elements.length, 1, 'the drawing that was open is still there');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('fonts: a text written in the code font keeps it, and the font can be changed afterwards', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('t');
    await page.click('[aria-label="Font"] button', 'Code');
    await page.mouseClick(at(0, 0));
    await page.waitFor('!document.querySelector(".sk-textbox").hidden');
    assert.match(await page.eval('document.querySelector(".sk-textbox").style.fontFamily'), /monospace/, 'the text box writes in it');
    await page.type('let x = 1');
    await page.press('Escape');
    let s = await scene(page);
    assert.equal(s.elements[0].font, 'code');
    // Selected again, the panel shows it and another font can be chosen.
    await page.press('v');
    await page.mouseClick(at(20, 0));
    assert.equal(await page.eval('[...document.querySelectorAll(\'[aria-label="Font"] button\')].find((b) => b.getAttribute("aria-pressed") === "true").textContent'), 'Code');
    await page.click('[aria-label="Font"] button', 'Normal');
    s = await scene(page);
    assert.equal(s.elements[0].font, 'normal');
    await page.click('[aria-label="Font"] button', 'Hand');
    s = await scene(page);
    assert.equal(s.elements[0].font, undefined, 'the handwriting font is the default and is not stored');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('several drawings, elbow arrows, exporting only the selection, resizing on the grid', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('r');
    await page.drag(at(-200, -40), at(-100, 40));
    // An elbow arrow, chosen in the panel before drawing it.
    await page.press('a');
    await page.click('[aria-label="Route"] button', 'Elbow');
    await page.drag(at(0, -80), at(150, 60));
    let s = await scene(page);
    assert.equal(s.elements.find((e) => e.type === 'arrow').route, 'elbow');

    // Export only the selection: the SVG holds the box's paths and not the arrow's.
    await page.eval('window.__blobs = []; URL.createObjectURL = (b) => { window.__blobs.push(b); return "blob:x"; }; HTMLAnchorElement.prototype.click = function () {}');
    await page.press('v');
    await page.mouseClick(at(-200, 0));
    await page.click('#menu-button');
    await page.click('#only-selection');
    await page.click('#svg');
    const svg = await page.eval('window.__blobs[0].text()');
    assert.ok(svg.includes('<path'), 'an SVG was made');
    const box = s.elements.find((e) => e.type === 'rectangle');
    assert.ok(svg.includes(`viewBox="${box.x - 20}`), `the SVG frames the box only: ${svg.slice(0, 120)}`);
    await page.press('Escape');

    // Several drawings: a new one, back to the first, rename, delete.
    await page.click('#menu-button');
    await page.click('#new');
    await page.waitFor('JSON.parse(localStorage.getItem("sketch.drawings")).list.length === 2');
    s = await scene(page);
    assert.equal(s.elements.length, 0, 'the new drawing is empty');
    await page.click('#menu-button');
    await page.click('#drawings button', 'Drawing 1');
    s = await scene(page);
    assert.equal(s.elements.length, 2, 'the first drawing is back');
    await page.eval('window.prompt = () => "Architecture"; window.confirm = () => true');
    await page.click('#menu-button');
    await page.click('#rename');
    assert.equal(await page.eval('document.querySelector("#drawings [aria-current=true]").textContent'), 'Architecture');
    await page.click('#delete');
    await page.waitFor('JSON.parse(localStorage.getItem("sketch.drawings")).list.length === 1 && !document.getElementById("canvas").inert');
    await page.press('Escape');

    // Resizing on the grid: the dragged edge lands on it.
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('g');
    await page.press('r');
    await page.drag(at(20, 20), at(100, 80));
    s = await scene(page);
    const r = s.elements[s.elements.length - 1];
    await page.press('v');
    await page.mouseClick(at(r.x + r.w / 2, r.y));
    await page.drag(at(r.x + r.w + 5, r.y + r.h / 2), at(r.x + r.w + 37, r.y + r.h / 2));
    s = await scene(page);
    const r2 = s.elements.find((e) => e.id === r.id);
    assert.equal((r2.x + r2.w) % 20, 0, `the right edge is on the grid: ${r2.x + r2.w}`);
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('the interface in Spanish, chosen in the menu', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    await page.click('#menu-button');
    await page.click('input[name="lang"][value="es"]');
    await page.waitFor('document.documentElement.lang === "es" && !!document.querySelector(".sk-canvas")');
    await page.waitFor('!!document.querySelector(\'.sk-toolbar button[aria-label="Rectángulo"]\')');
    assert.equal(await page.eval('document.getElementById("new").textContent.trim()'), 'Dibujo nuevo');
    assert.equal(await page.eval('document.querySelector(".sk-panel").getAttribute("aria-label")'), 'Estilo');
    assert.equal(await page.eval('document.getElementById("menu-button").title'), 'Menú');
    assert.equal(JSON.parse(await page.eval('localStorage.getItem("sketch.prefs")')).lang, 'es');
    // Every label, title and button text of the interface is in Spanish (keys and symbols aside).
    const english = await page.eval(`[...document.querySelectorAll('button, label, legend, h2, h3, [aria-label], [title]')]
      .flatMap((n) => [n.getAttribute('aria-label'), n.getAttribute('title'), n.children.length ? '' : n.textContent])
      .map((x) => (x || '').trim()).filter((x) => /\b(the|and|Select|Rectangle|Drawing|Undo|Save|Open|Export|Menu|Grid|Fill|Stroke)\b/.test(x))`);
    assert.deepEqual(english, [], `still in English: ${english.join(' | ')}`);
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('a drawing with 2,000 elements pans smoothly', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await page.goto(base);
    await page.eval(`(() => {
      const els = [];
      for (let i = 0; i < 2000; i++) {
        const x = (i % 50) * 120;
        const y = Math.floor(i / 50) * 90;
        const type = ['rectangle', 'ellipse', 'diamond', 'arrow', 'text'][i % 5];
        const e = { id: 'e' + i, type, x, y, w: 100, h: 60, seed: i, stroke: '#1e1e1e', fill: i % 3 ? '#a5d8ff' : 'transparent', fillStyle: 'hachure', width: 2, dashed: false, roughness: 1, opacity: 1, fontSize: 20 };
        if (type === 'arrow') e.points = [{ x: 0, y: 0 }, { x: 100, y: 40 }];
        if (type === 'text') e.text = 'Text ' + i;
        els.push(e);
      }
      localStorage.setItem('sketch.current', JSON.stringify({ type: 'sketch', version: 1, background: '#ffffff', elements: els }));
    })()`);
    await open(page);
    // At 100% (part of it visible) and fitting it all: average time per frame while panning.
    const frame = (zoomAll) => page.eval(`(async () => {
      const c = document.querySelector('.sk-canvas');
      if (${zoomAll}) document.querySelector('button[aria-label="Fit the whole drawing"]').click();
      else document.querySelector('button[aria-label="Reset to 100%"]').click();
      const raf = () => new Promise((r) => requestAnimationFrame(r));
      await raf(); await raf();
      const t0 = performance.now();
      for (let i = 0; i < 20; i++) {
        c.dispatchEvent(new WheelEvent('wheel', { deltaX: 7, deltaY: 5, bubbles: true, cancelable: true }));
        await raf();
      }
      return (performance.now() - t0) / 20;
    })()`);
    const near = await frame(false);
    const all = await frame(true);
    console.log(`2,000 elements: ${near.toFixed(1)} ms per frame at 100%, ${all.toFixed(1)} ms fitting it all`);
    assert.ok(near < 60, `at 100%: ${near} ms`);
    assert.ok(all < 250, `all: ${all} ms`);
  } finally {
    await page.close();
  }
});

test('a drawing saved by an older version is kept', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await page.goto(base);
    await page.eval(`localStorage.setItem('sketch.actual', JSON.stringify({ type: 'sketch', version: 1, background: '#ffffff', elements: [{ id: 'old', type: 'rectangle', x: 0, y: 0, w: 50, h: 50 }] }))`);
    await open(page);
    await page.press('a', { ctrl: true });
    await page.press('ArrowRight');
    const s = await scene(page);
    assert.deepEqual(s.elements.map((e) => e.id), ['old']);
    assert.equal(await page.eval('localStorage.getItem("sketch.actual")'), null, 'the old key is removed');
  } finally {
    await page.close();
  }
});

test('opening an .excalidraw file from the computer', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const dir = await mkdtemp(join(tmpdir(), 'sketch-e2e-'));
    const file = join(dir, 'plan.excalidraw');
    await writeFile(file, JSON.stringify({
      type: 'excalidraw',
      elements: [
        { id: 'r', type: 'rectangle', x: 0, y: 0, width: 160, height: 80, strokeColor: '#1971c2', opacity: 100 },
        { id: 't', type: 'text', x: 10, y: 10, width: 60, height: 25, text: 'Database', containerId: 'r', fontSize: 20, opacity: 100 },
      ],
    }));
    const { root } = await page.send('DOM.getDocument', {});
    const { nodeId } = await page.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#file' });
    await page.send('DOM.setFileInputFiles', { nodeId, files: [file] });
    await page.waitFor('document.querySelector("#status").textContent.includes("2 elements")');
    const s = await scene(page);
    assert.equal(s.elements[1].containerId, 'r');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('opens offline once it has loaded', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    await page.eval('navigator.serviceWorker.ready.then(() => true)');
    await page.reload(); // the second load already goes through the service worker
    await page.waitFor('navigator.serviceWorker.controller !== null');
    serverDown = true;
    await page.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await page.reload();
    await page.waitFor('!!document.querySelector(".sk-canvas")');
    assert.ok(await page.eval('document.fonts.check(\'24px "Sketch Hand"\')'), 'the font too');
    // Another page opened in the tab while online does not take the site's place offline.
    serverDown = false;
    await page.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await page.goto(`${base}icon.svg`);
    serverDown = true;
    await page.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await page.goto(`${base}?again`); // another address, so it does not come back from the page cache
    await page.waitFor('!!document.querySelector(".sk-canvas")');
  } finally {
    serverDown = false;
    await page.close();
  }
});

test('on a phone nothing overflows the screen', { skip }, async () => {
  const page = await browser.newPage({ width: 390, height: 844, mobile: true });
  try {
    await open(page);
    const overflow = await page.eval('[...document.querySelectorAll(".sk-toolbar, .header, .sk-bottom")].map((e) => e.getBoundingClientRect()).some((r) => r.right > innerWidth + 1 || r.left < -1)');
    assert.equal(overflow, false);
    const hiddenTools = await page.eval('(() => { const t = document.querySelector(".sk-toolbar"); return t.scrollWidth > t.clientWidth + 1; })()');
    assert.equal(hiddenTools, false, 'all tools fit without scrolling');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('the portable version opens with a double click and works offline', { skip }, async () => {
  const { execFileSync } = await import('node:child_process');
  const dir = await mkdtemp(join(tmpdir(), 'bsketch-portable-'));
  const file = join(dir, 'bsketch-portable.html');
  execFileSync(process.execPath, [join(ROOT, 'scripts/build-portable.mjs'), file]);
  const page = await browser.newPage();
  try {
    await page.goto(`file://${file}`);
    await page.waitFor('!!document.querySelector(".sk-canvas")');
    await page.waitFor('document.fonts.check(\'24px "Sketch Hand"\')');
    const at = await screen(page);
    await page.press('r');
    await page.drag(at(-100, -50), at(100, 50));
    await page.mouseClick(at(0, 0), { count: 2 });
    await page.waitFor('!document.querySelector(".sk-textbox").hidden');
    await page.type('Offline');
    await page.press('Escape');
    const s = await scene(page);
    assert.deepEqual(s.elements.map((e) => e.type), ['rectangle', 'text']);
    assert.ok(await page.eval('document.fonts.check(\'24px "Sketch Hand"\')'), 'the font is inside');
    assert.deepEqual(page.requests.filter((u) => !/^(file|data|blob):/.test(u)), [], 'requests nothing outside');
    assert.deepEqual(page.errors, []);
    // Its CSP is the only one the desktop app has ("csp": null in tauri.conf.json): no network, no outside script.
    const csp = await page.eval('document.querySelector(\'meta[http-equiv="Content-Security-Policy"]\').content');
    for (const d of ["default-src 'none'", "connect-src 'none'", "require-trusted-types-for 'script'", "base-uri 'none'", "form-action 'none'"]) {
      assert.ok(csp.includes(d), `CSP has ${d}`);
    }
    assert.match(csp, /script-src 'sha256-[A-Za-z0-9+/=]+'(;|$)/, 'only the script it carries, by hash');
    assert.equal(await page.eval('fetch("https://example.com/").then(() => "sent", () => "blocked")'), 'blocked', 'a request is refused');
  } finally {
    await page.close();
  }
});

test('pictures, frames and the library', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');
    // A picture from the computer (the toolbar's button opens this input).
    const { root } = await page.send('DOM.getDocument', {});
    const { nodeId } = await page.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.sk-editor input[type=file][accept^="image/"]' });
    await page.send('DOM.setFileInputFiles', { nodeId, files: [join(ROOT, 'docs/images/banner.png')] });
    await page.waitFor('document.querySelector(".sk-sr[aria-live]").textContent.includes("image")');
    let s = await scene(page);
    const img = s.elements.find((e) => e.type === 'image');
    assert.ok(img && s.files[img.fileId].startsWith('data:image/png;base64,'), 'the picture is kept with the drawing');
    assert.ok(Math.abs(img.w / img.h - 2560 / 800) < 0.01, 'with its proportions');
    assert.ok(await page.eval('new Promise((r) => requestAnimationFrame(() => r(true)))'));

    // A frame around a box: moving the frame moves the box.
    await page.press('Escape');
    await page.press('r');
    await page.drag(at(260, 220), at(320, 270));
    await page.press('f');
    await page.drag(at(240, 200), at(380, 320));
    s = await scene(page);
    const frame = s.elements[0];
    assert.equal(frame.type, 'frame', 'frames go behind');
    assert.equal(frame.name, 'Frame 1');
    const box = s.elements.find((e) => e.type === 'rectangle');
    await page.press('v');
    await page.mouseClick(at(-450, 300));
    await page.drag(at(250, 200), at(250, 240)); // by its top border
    s = await scene(page);
    assert.equal(s.elements.find((e) => e.id === box.id).y, box.y + 40, 'what is inside moves with the frame');
    // Rename it (double click on its border).
    await page.eval('window.prompt = () => "Login"');
    await page.mouseClick(at(240, 280), { count: 2 });
    s = await scene(page);
    assert.equal(s.elements[0].name, 'Login');

    // Exporting only a selected frame: its area, without its border.
    await page.eval('window.__blobs = []; URL.createObjectURL = (b) => { window.__blobs.push(b); return "blob:x"; }; HTMLAnchorElement.prototype.click = function () {}');
    await page.mouseClick(at(240, 290));
    await page.click('#menu-button');
    await page.click('#only-selection');
    await page.click('#svg');
    const svg = await page.eval('window.__blobs[0].text()');
    const f = s.elements[0];
    assert.ok(svg.includes(`viewBox="${f.x} ${f.y} ${f.w} ${f.h}"`), svg.slice(0, 160));
    assert.ok(!svg.includes('Login'), 'without the frame\'s title');
    await page.press('Escape');

    // The library: keep the box, insert it again.
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.mouseClick(at(-450, 300));
    await page.mouseClick(at(260, 280));
    await page.press('L', { shift: true });
    await page.waitFor('!document.querySelector(".sk-library").hidden');
    await page.click('.sk-library .sk-textbtn');
    await page.waitFor('document.querySelectorAll(".sk-libitem").length === 1');
    const before = (await scene(page)).elements.length;
    await page.click('.sk-libitem');
    s = await scene(page);
    assert.equal(s.elements.length, before + 1, 'the kept piece goes in as a copy');
    // It is kept in the browser: after a reload it is still there.
    await page.reload();
    await page.waitFor('!!document.querySelector(".sk-canvas") && !document.getElementById("canvas").inert');
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('L', { shift: true });
    await page.waitFor('document.querySelectorAll(".sk-libitem").length === 1');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('text to diagram: from the menu, by pasting text, and copying between tabs', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    // From the menu: an example, the live count, Insert.
    await page.click('#menu-button');
    await page.click('#text-diagram');
    await page.waitFor('document.getElementById("td-dialog").open');
    assert.equal(await page.eval('document.getElementById("td-insert").disabled'), true, 'nothing to insert yet');
    await page.click('.td-example', 'Mermaid');
    assert.match(await page.eval('document.getElementById("td-count").textContent'), /5 boxes, 4 arrows/);
    await page.click('#td-insert');
    await page.waitFor('!document.getElementById("td-dialog").open');
    let s = await scene(page);
    assert.equal(s.elements.filter((e) => e.type === 'arrow').length, 4);
    assert.equal(s.elements[0].type, 'frame', 'the subgraph becomes a frame');
    assert.ok(s.elements.filter((e) => e.type === 'arrow').every((a) => a.startId && a.endId), 'attached');
    assert.ok(s.elements.some((e) => e.type === 'diamond'));

    // Pasting text on the canvas.
    const paste = (text) => page.eval(`(() => {
      const dt = new DataTransfer();
      dt.setData('text/plain', ${JSON.stringify(text)});
      document.querySelector('.sk-editor').focus();
      document.querySelector('.sk-editor').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      return true;
    })()`);
    const before = s.elements.length;
    await paste('Home\n  Docs\n  Blog\n    Post');
    s = await scene(page);
    assert.equal(s.elements.length, before + 4 * 2 + 3, 'four boxes with their texts and three arrows');
    await paste('just a note');
    s = await scene(page);
    assert.ok(s.elements.some((e) => e.type === 'text' && e.text === 'just a note' && !e.containerId), 'one line stays text');

    // Copying a selection puts it on the clipboard; another tab pastes it.
    const copied = await page.eval(`(() => {
      const dt = new DataTransfer();
      document.querySelector('.sk-editor').dispatchEvent(new ClipboardEvent('copy', { clipboardData: dt, bubbles: true, cancelable: true }));
      return dt.getData('text/plain');
    })()`);
    assert.match(copied, /"bsketch-clipboard"/);
    const other = await browser.newPage();
    try {
      await open(other);
      await other.eval(`(() => {
        const dt = new DataTransfer();
        dt.setData('text/plain', ${JSON.stringify(copied)});
        document.querySelector('.sk-editor').focus();
        document.querySelector('.sk-editor').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
        return true;
      })()`);
      const s2 = await scene(other);
      assert.ok(s2.elements.some((e) => e.type === 'text' && e.text === 'just a note'), 'pasted in the other tab');
      assert.deepEqual(other.errors, []);
    } finally {
      await other.close();
    }
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('quick diagrams: Ctrl+arrow keys chain the next shape; a template opens as a new drawing', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('r');
    await page.drag(at(-300, -40), at(-160, 30));
    // Ctrl+→: the next box on the right, joined by an arrow, its text open.
    await page.press('ArrowRight', { ctrl: true });
    await page.waitFor('!document.querySelector(".sk-textbox").hidden');
    await page.type('Second');
    await page.press('Escape');
    await page.press('ArrowDown', { ctrl: true });
    await page.waitFor('!document.querySelector(".sk-textbox").hidden');
    await page.type('Third');
    await page.press('Escape');
    let s = await scene(page);
    const boxes = s.elements.filter((e) => e.type === 'rectangle');
    const arrows = s.elements.filter((e) => e.type === 'arrow');
    assert.equal(boxes.length, 3);
    assert.equal(arrows.length, 2);
    assert.ok(arrows.every((a) => a.startId && a.endId), 'attached at both ends');
    assert.ok(boxes[1].x > boxes[0].x + boxes[0].w && Math.abs(boxes[1].y - boxes[0].y) < 1, 'to the right');
    assert.ok(boxes[2].y > boxes[1].y + boxes[1].h && Math.abs(boxes[2].x - boxes[1].x) < 1, 'below');
    assert.deepEqual(s.elements.filter((e) => e.containerId).map((e) => e.text), ['Second', 'Third']);
    // From the first box again to the right: that place is taken, so it slides beside it.
    await page.press('v');
    await page.mouseClick(at(-230, -40));
    await page.press('ArrowRight', { ctrl: true });
    await page.press('Escape');
    s = await scene(page);
    const all = s.elements.filter((e) => e.type === 'rectangle');
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i];
      const b = all[j];
      assert.ok(!(a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h), 'no box on top of another');
    }
    // One undo removes the box and its arrow together.
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('z', { ctrl: true });
    s = await scene(page);
    assert.equal(s.elements.filter((e) => e.type === 'rectangle').length, 3);
    assert.equal(s.elements.filter((e) => e.type === 'arrow').length, 2);

    // A template: a new drawing named after it.
    await page.click('#menu-button');
    await page.click('#templates button', 'Org chart');
    await page.waitFor('JSON.parse(localStorage.getItem("sketch.drawings")).list.length === 2');
    s = await scene(page);
    assert.ok(s.elements.filter((e) => e.type === 'rectangle').length >= 8);
    const idx = JSON.parse(await page.eval('localStorage.getItem("sketch.drawings")'));
    assert.equal(idx.list.find((d) => d.id === idx.active).name, 'Org chart');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('animated arrows: chosen in the panel, moving on screen, still with reduced motion', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('a');
    await page.click('[aria-label="Flow"] button', 'Animated');
    await page.drag(at(-150, 0), at(150, 0));
    let s = await scene(page);
    assert.equal(s.elements[0].animated, true, 'drawn animated');
    // The canvas changes on its own while it flows.
    const pixels = () => page.eval('(() => { const c = document.querySelector(".sk-canvas"); return c.toDataURL().length + ":" + c.toDataURL().slice(-200); })()');
    const a = await pixels();
    await new Promise((r) => setTimeout(r, 250));
    assert.notEqual(await pixels(), a, 'the dashes move');
    // With reduced motion, it stays still.
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await page.eval('window.dispatchEvent(new Event("resize")); true');
    await new Promise((r) => setTimeout(r, 200));
    const b = await pixels();
    await new Promise((r) => setTimeout(r, 250));
    assert.equal(await pixels(), b, 'still for reduced motion');
    // Still: the property goes.
    await page.press('v');
    await page.mouseClick(at(0, 0));
    await page.click('[aria-label="Flow"] button', 'Still');
    s = await scene(page);
    assert.equal(s.elements[0].animated, undefined);
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('export to .excalidraw from the menu, and open it again', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    await page.click('#menu-button');
    await page.click('#templates button', 'Flowchart');
    await page.waitFor('JSON.parse(localStorage.getItem("sketch.drawings")).list.length === 2');
    await page.eval('window.__blobs = []; URL.createObjectURL = (b) => { window.__blobs.push(b); return "blob:x"; }; HTMLAnchorElement.prototype.click = function () { window.__name = this.download; }');
    await page.click('#menu-button');
    await page.click('#excalidraw');
    const text = await page.eval('window.__blobs[0].text()');
    const data = JSON.parse(text);
    assert.equal(data.type, 'excalidraw');
    assert.equal(await page.eval('window.__name'), 'Flowchart.excalidraw');
    const arrows = data.elements.filter((e) => e.type === 'arrow');
    assert.ok(arrows.length >= 6 && arrows.every((a) => a.startBinding && a.endBinding), 'attached arrows');
    assert.ok(data.elements.some((e) => e.type === 'diamond'));
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('lock, search and more styles', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    await page.click('#menu-button');
    await page.click('#text-diagram');
    await page.fill('#td-text', 'graph LR\nA[Acción] --> B[Plan]\nB --> C[Acción final]');
    await page.click('#td-insert');
    // The diagram goes in on the dialog's close event, a moment after it closes: the text box empties then.
    await page.waitFor('!document.getElementById("td-dialog").open && document.getElementById("td-text").value === ""');
    await page.eval('document.querySelector(".sk-editor").focus()');
    // Search: accents and case don't matter; Enter goes to the next match.
    await page.press('f', { ctrl: true });
    await page.waitFor('!document.querySelector(".sk-search").hidden');
    await page.fill('.sk-searchinput', 'ACCION');
    assert.equal(await page.eval('document.querySelector(".sk-searchcount").textContent'), '1 of 2');
    await page.eval('document.querySelector(".sk-searchinput").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); true');
    assert.equal(await page.eval('document.querySelector(".sk-searchcount").textContent'), '2 of 2');
    let s = await scene(page);
    const second = s.elements.find((e) => e.text === 'Acción final').containerId;
    assert.match(await page.eval('document.querySelector(".sk-sr[aria-live]").textContent'), /rectangle/);
    await page.eval('document.querySelector(".sk-searchinput").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); true');
    assert.equal(await page.eval('document.querySelector(".sk-search").hidden'), true);
    // Styles on the selected box: dotted, cross-hatch, round corners.
    await page.click('[aria-label="Line style"] button', 'Dotted');
    await page.click('[aria-label="Fill style"] button', 'Cross-hatch');
    await page.click('[aria-label="Corners"] button', 'Round');
    s = await scene(page);
    const box = s.elements.find((e) => e.id === second);
    assert.deepEqual([box.dotted, box.dashed, box.fillStyle, box.rounded], [true, true, 'cross-hatch', true]);
    // Lock it: it can't be selected any more, Ctrl+A skips it; Unlock all brings it back.
    await page.press('L', { ctrl: true, shift: true });
    s = await scene(page);
    assert.equal(s.elements.find((e) => e.id === second).locked, true);
    await page.press('a', { ctrl: true });
    assert.match(await page.eval('document.querySelector(".sk-sr[aria-live]").textContent'), /Selected: 4 elements/, 'two boxes and two arrows, not the locked one');
    assert.equal(await page.eval('document.querySelector("[aria-label=\\"Unlock all\\"]").hidden'), false);
    await page.click('[aria-label="Unlock all"]');
    s = await scene(page);
    assert.equal(s.elements.find((e) => e.id === second).locked, undefined);
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('frames clip what lies on them, on screen', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('f');
    await page.drag(at(-200, -120), at(100, 120));
    // A solid box whose right part sticks out of the frame.
    await page.press('r');
    await page.click('.sk-row[data-prop="fill"] .sk-swatch[data-color="#a5d8ff"]');
    await page.click('[aria-label="Fill style"] button', 'Solid');
    await page.drag(at(0, -30), at(180, 30));
    await page.press('Escape');
    await page.press('v');
    await page.mouseClick(at(-400, 300));
    await new Promise((r) => setTimeout(r, 300));
    // A pixel of the box inside the frame is blue; one outside the frame's border is the background.
    const px = (x, y) => page.eval(`(() => { const c = document.querySelector('.sk-canvas'); const r = c.getBoundingClientRect(); const k = c.width / r.width; const p = c.getContext('2d').getImageData(Math.round((r.width / 2 + ${x}) * k), Math.round((r.height / 2 + ${y}) * k), 1, 1).data; return [p[0], p[1], p[2]]; })()`);
    const inside = await px(60, 0);
    const outside = await px(150, 0);
    assert.ok(inside[2] > 200 && inside[0] < 200, `inside the frame the box shows: ${inside}`);
    assert.deepEqual(outside, [255, 255, 255], `outside the frame it is cut: ${outside}`);
    // Moving the frame carries the box.
    const before = (await scene(page)).elements.find((e) => e.type === 'rectangle').x;
    await page.drag(at(-200, -60), at(-150, -60));
    const after = (await scene(page)).elements.find((e) => e.type === 'rectangle').x;
    assert.equal(after, before + 50);
    // (Reading pixels back makes Chrome suggest willReadFrequently: that note comes from this test, not the page.)
    assert.deepEqual(page.errors.filter((e) => !e.includes('willReadFrequently')), []);
  } finally {
    await page.close();
  }
});

test('presentation mode: frames one by one, the laser changes nothing, Escape puts things back', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    // Two frames side by side, each with a box; the second one written first, so reading order matters.
    await page.click('#menu-button');
    await page.click('#text-diagram');
    await page.fill('#td-text', 'graph LR\nB[Two] --> A[One]\nsubgraph S2 [Second]\nA\nend\nsubgraph S1 [First]\nB\nend');
    await page.click('#td-insert');
    await page.waitFor('!document.getElementById("td-dialog").open && document.getElementById("td-text").value === ""');
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('Escape');
    const before = await scene(page);
    const zoom0 = await page.eval('document.querySelector(".sk-zoomlabel").textContent');
    await page.press('P', { shift: true });
    await page.waitFor('document.querySelector(".sk-editor").classList.contains("sk-presenting")');
    assert.equal(await page.eval('document.querySelector(".sk-slidecount").textContent'), '1 / 2');
    assert.equal(await page.eval('getComputedStyle(document.querySelector(".sk-toolbar")).display'), 'none', 'the toolbar is hidden');
    // The laser: dragging over the slide draws and changes nothing.
    const at = await screen(page);
    await page.drag(at(-100, 0), at(100, 40));
    assert.deepEqual((await scene(page)).elements, before.elements, 'nothing changed');
    await page.press('ArrowRight');
    assert.equal(await page.eval('document.querySelector(".sk-slidecount").textContent'), '2 / 2');
    await page.press('ArrowRight');
    assert.equal(await page.eval('document.querySelector(".sk-slidecount").textContent'), '2 / 2', 'it stops at the last');
    await page.press('ArrowLeft');
    assert.equal(await page.eval('document.querySelector(".sk-slidecount").textContent'), '1 / 2');
    await page.press('Escape');
    assert.equal(await page.eval('document.querySelector(".sk-editor").classList.contains("sk-presenting")'), false);
    assert.equal(await page.eval('document.querySelector(".sk-zoomlabel").textContent'), zoom0, 'the view is put back');
    // Without frames, the whole drawing is one slide.
    await page.press('a', { ctrl: true });
    await page.press('Delete');
    await page.press('r');
    await page.drag(at(-50, -20), at(50, 20));
    await page.press('P', { shift: true });
    await page.waitFor('document.querySelector(".sk-editor").classList.contains("sk-presenting")');
    assert.equal(await page.eval('document.querySelector(".sk-slidecount").textContent'), '1 / 1');
    await page.click('.sk-present [aria-label="End the presentation"]');
    assert.equal(await page.eval('document.querySelector(".sk-editor").classList.contains("sk-presenting")'), false);
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('bend an arrow by dragging its middle; back near the line it is straight again', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('a');
    await page.drag(at(-150, 0), at(150, 0));
    // The arrow is selected: drag the handle in its middle down.
    await page.drag(at(0, 0), at(0, 80));
    let s = await scene(page);
    let arrow = s.elements[0];
    assert.equal(arrow.route, 'curve');
    const ends = [arrow.x + arrow.points[0].x, arrow.x + arrow.points[1].x];
    const mid = { x: (ends[0] + ends[1]) / 2, y: arrow.y };
    // The curve's middle sits where it was dropped (80 px below, at 100%).
    const zoom = parseFloat(await page.eval('document.querySelector(".sk-zoomlabel").textContent')) / 100;
    const k = arrow.bend ?? 0.25;
    const len = Math.abs(ends[1] - ends[0]);
    assert.ok(Math.abs(k * len / 2 - 80 / zoom) < 3, `bent through the pointer: ${k * len / 2} vs ${80 / zoom}`);
    // Undo puts it straight; redo bends it again.
    await page.press('z', { ctrl: true });
    s = await scene(page);
    assert.equal(s.elements[0].route, undefined);
    await page.press('y', { ctrl: true });
    // Dragging the middle back onto the line makes it straight.
    await page.press('a', { ctrl: true });
    await page.drag(at(0, 80), at(0, 1));
    s = await scene(page);
    arrow = s.elements[0];
    assert.equal(arrow.route, undefined, `straight again: ${JSON.stringify({ route: arrow.route, bend: arrow.bend })}`);
    assert.equal(mid.y, arrow.y);
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

for (const [lang, newDrawing, style] of [['ca', 'Dibuix nou', 'Estil'], ['fr', 'Nouveau dessin', 'Style'], ['pt', 'Novo desenho', 'Estilo']]) {
  test(`the interface in ${lang}, chosen in the menu`, { skip }, async () => {
    const page = await browser.newPage();
    try {
      await open(page);
      await page.click('#menu-button');
      await page.click(`input[name="lang"][value="${lang}"]`);
      await page.waitFor(`document.documentElement.lang === "${lang}" && !!document.querySelector(".sk-canvas")`);
      assert.equal(await page.eval('document.getElementById("new").textContent.trim()'), newDrawing);
      assert.equal(await page.eval('document.querySelector(".sk-panel").getAttribute("aria-label")'), style);
      // No English left (words that are the same in these languages, like "Rectangle" or "Menu", aside).
      // (Drawing names are the user's, not the interface's.)
      const english = await page.eval(`[...document.querySelectorAll('button, label, legend, h2, h3, [aria-label], [title]')].filter((n) => !n.closest('#drawings'))
        .flatMap((n) => [n.getAttribute('aria-label'), n.getAttribute('title'), n.children.length ? '' : n.textContent])
        .map((x) => (x || '').trim()).filter((x) => /\\b(the|and|Select|Drawing|Undo|Save|Open|Export|Grid|Fill|Stroke)\\b/.test(x))`);
      assert.deepEqual(english, [], `still in English: ${english.join(' | ')}`);
      // A template comes in the same language.
      await page.click('#menu-button');
      await page.waitFor('document.getElementById("menu").open');
      const names = await page.eval('[...document.querySelectorAll("#templates button")].map((b) => b.textContent).join("|")');
      assert.ok(!/Flowchart|Org chart|Mind map/.test(names), `templates translated: ${names}`);
      assert.deepEqual(page.errors, []);
    } finally {
      await page.close();
    }
  });
}

test('speaker notes: written in the frame panel, shown with N while presenting; a timer runs', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('f');
    await page.drag(at(-200, -120), at(200, 120));
    // The new frame is selected: its panel shows; write notes and leave the field.
    await page.waitFor('!document.querySelector(".sk-framepanel").hidden');
    await page.fill('.sk-framenotes', 'Welcome everyone.\nThen the plan.');
    await page.eval('document.querySelector(".sk-framenotes").dispatchEvent(new Event("change")); true');
    let s = await scene(page);
    assert.equal(s.elements[0].notes, 'Welcome everyone.\nThen the plan.');
    // Undo takes them away in one step; redo brings them back.
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('z', { ctrl: true });
    assert.equal((await scene(page)).elements[0].notes, undefined);
    await page.press('y', { ctrl: true });
    // Presenting: the notes are hidden until N.
    await page.press('P', { shift: true });
    await page.waitFor('document.querySelector(".sk-editor").classList.contains("sk-presenting")');
    assert.equal(await page.eval('document.querySelector(".sk-notesview").hidden'), true);
    await page.press('n');
    assert.equal(await page.eval('document.querySelector(".sk-notesview").hidden'), false);
    assert.equal(await page.eval('document.querySelector(".sk-notesview").textContent'), 'Welcome everyone.\nThen the plan.');
    assert.equal(await page.eval('getComputedStyle(document.querySelector(".sk-notesview")).display'), 'block');
    await new Promise((r) => setTimeout(r, 1200));
    assert.match(await page.eval('document.querySelector(".sk-timer").textContent'), /^0:0[1-9]$/, 'the timer runs');
    await page.press('Escape');
    assert.equal(await page.eval('document.querySelector(".sk-notesview").hidden'), true, 'hidden again after');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});
