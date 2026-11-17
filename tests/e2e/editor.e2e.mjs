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
let browser;

before(async () => {
  if (skip) return;
  server = createServer(async (req, res) => {
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

// The drawing kept in the browser (written 400 ms after each change).
async function scene(page) {
  await new Promise((r) => setTimeout(r, 500));
  return JSON.parse(await page.eval('localStorage.getItem("sketch.current")'));
}

// From drawing coordinates to the screen: an empty canvas at 100%, with 0,0 in the center.
async function screen(page) {
  const r = await page.eval('(() => { const r = document.querySelector(".sk-canvas").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()');
  return (x, y) => ({ x: r.x + x, y: r.y + y });
}

async function open(page) {
  await page.goto(base);
  await page.waitFor('!!document.querySelector(".sk-canvas")');
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
    await page.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await page.reload();
    await page.waitFor('!!document.querySelector(".sk-canvas")');
    assert.ok(await page.eval('document.fonts.check(\'24px "Sketch Hand"\')'), 'the font too');
  } finally {
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
  const dir = await mkdtemp(join(tmpdir(), 'sketch-portable-'));
  const file = join(dir, 'sketch-portable.html');
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
  } finally {
    await page.close();
  }
});
