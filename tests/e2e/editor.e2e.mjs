// Recorridos del editor en un Chrome de verdad (sin cabeza): dibujar, pegar flechas, escribir
// dentro de las formas, girar, agrupar, alinear, deshacer, abrir un .excalidraw y abrir sin red.
// Se ejecutan con `npm run test:e2e` y en la CI. Si no hay Chrome, se saltan.

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
const skip = chrome ? false : 'No hay Chrome (pon CHROME_BIN)';
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

// El dibujo guardado en el navegador (se escribe 400 ms después de cada cambio).
async function scene(page) {
  await new Promise((r) => setTimeout(r, 500));
  return JSON.parse(await page.eval('localStorage.getItem("sketch.actual")'));
}

// De coordenadas del dibujo a la pantalla: lienzo vacío al 100 %, con el 0,0 en el centro.
async function screen(page) {
  const r = await page.eval('(() => { const r = document.querySelector(".sk-canvas").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()');
  return (x, y) => ({ x: r.x + x, y: r.y + y });
}

async function open(page) {
  await page.goto(base);
  await page.waitFor('!!document.querySelector(".sk-canvas")');
  await page.waitFor('document.fonts.check(\'24px "Sketch Mano"\')');
}

test('flechas pegadas, texto dentro, giro, grupos y alinear', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const at = await screen(page);
    await page.press('r');
    await page.drag(at(-300, -50), at(-150, 50));
    await page.press('o');
    await page.drag(at(150, -50), at(300, 50));
    await page.press('a');
    await page.drag(at(-220, 0), at(220, 0)); // de dentro de la caja a dentro de la elipse
    let s = await scene(page);
    const [rect, ell, arrow] = s.elements;
    assert.deepEqual(s.elements.map((e) => e.type), ['rectangle', 'ellipse', 'arrow']);
    assert.equal(arrow.startId, rect.id, 'pegada a la caja');
    assert.equal(arrow.endId, ell.id, 'pegada a la elipse');
    assert.ok(Math.abs(arrow.x - (-150 + 6)) < 1, `sale del borde de la caja: ${arrow.x}`);

    // Mover la caja: la flecha la sigue.
    await page.press('v');
    await page.drag(at(-300, 0), at(-300, 150));
    s = await scene(page);
    const moved = s.elements.find((e) => e.type === 'arrow');
    assert.ok(moved.y > 50, `la flecha sigue a la caja: ${moved.y}`);
    assert.equal(moved.startId, rect.id);

    // Doble clic dentro de la caja: escribir dentro.
    await page.mouseClick(at(-225, 150), { count: 2 });
    await page.waitFor('!document.querySelector(".sk-textbox").hidden');
    await page.type('Servidor web');
    await page.press('Escape');
    s = await scene(page);
    const text = s.elements.find((e) => e.type === 'text');
    assert.equal(text.text, 'Servidor web');
    assert.equal(text.containerId, rect.id);
    const tc = text.x + text.w / 2;
    assert.ok(Math.abs(tc - -225) < 1, `centrado en la caja: ${tc}`);

    // Girar la caja con su tirador (encima del lado de arriba).
    await page.mouseClick(at(-300, 150));
    await page.drag(at(-225, 100 - 6 - 22), at(-100, 150), { steps: 12 });
    s = await scene(page);
    const turned = s.elements.find((e) => e.id === rect.id);
    assert.ok(Math.abs(turned.angle - Math.PI / 2) < 0.15, `girada unos 90°: ${turned.angle}`);
    assert.equal(s.elements.find((e) => e.type === 'text').angle, turned.angle, 'el texto gira con ella');

    // Deshacer el giro.
    await page.press('z', { ctrl: true });
    s = await scene(page);
    assert.equal(s.elements.find((e) => e.id === rect.id).angle, undefined);

    // Seleccionar todo, agrupar, alinear arriba y desagrupar.
    await page.press('a', { ctrl: true });
    await page.press('g', { ctrl: true });
    s = await scene(page);
    const groups = new Set(s.elements.filter((e) => e.type !== 'text').map((e) => e.group));
    assert.equal(groups.size, 1);
    assert.ok([...groups][0]);
    await page.press('g', { ctrl: true, shift: true });
    s = await scene(page);
    assert.ok(s.elements.every((e) => !e.group));
    await page.click('button[aria-label="Alinear arriba"]');
    s = await scene(page);
    const r2 = s.elements.find((e) => e.id === rect.id);
    const e2 = s.elements.find((e) => e.id === ell.id);
    assert.ok(Math.abs(r2.y - e2.y) < 1, `arriba del todo los dos: ${r2.y} ${e2.y}`);

    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('todo con el teclado', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    assert.match(await page.eval('document.getElementById(document.querySelector(".sk-editor").getAttribute("aria-describedby")).textContent'), /Tab/);
    await page.eval('document.querySelector(".sk-editor").focus()');
    await page.press('r');
    await page.press('Enter'); // rectángulo en el centro
    await page.press('ArrowRight', { alt: true }); // 10 px más ancho
    await page.press(']'); // 15° de giro
    let s = await scene(page);
    assert.equal(s.elements.length, 1);
    assert.equal(s.elements[0].w, 170);
    assert.ok(Math.abs(s.elements[0].angle - Math.PI / 12) < 1e-9);
    await page.press('Enter'); // escribir dentro
    await page.waitFor('!document.querySelector(".sk-textbox").hidden');
    await page.type('Hola');
    await page.press('Escape');
    await page.press('Escape'); // nada seleccionado
    await page.press('o');
    await page.press('Enter');
    s = await scene(page);
    assert.deepEqual(s.elements.map((e) => e.type), ['rectangle', 'text', 'ellipse']);
    assert.equal(s.elements[1].containerId, s.elements[0].id);
    await page.press('Tab');
    assert.equal(await page.eval('document.querySelector(".sk-sr[aria-live]").textContent'), 'Seleccionado: rectángulo');
    await page.press('Delete');
    s = await scene(page);
    assert.deepEqual(s.elements.map((e) => e.type), ['ellipse'], 'se borra con su texto');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('un dibujo de 2.000 elementos se mueve con soltura', { skip }, async () => {
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
        if (type === 'text') e.text = 'Texto ' + i;
        els.push(e);
      }
      localStorage.setItem('sketch.actual', JSON.stringify({ type: 'sketch', version: 1, background: '#ffffff', elements: els }));
    })()`);
    await open(page);
    // Al 100 % (se ve una parte) y viéndolo todo: tiempo medio por fotograma al desplazar.
    const frame = (zoomAll) => page.eval(`(async () => {
      const c = document.querySelector('.sk-canvas');
      if (${zoomAll}) document.querySelector('button[aria-label="Ver todo el dibujo"]').click();
      else document.querySelector('button[aria-label="Volver al 100 %"]').click();
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
    console.log(`2.000 elementos: ${near.toFixed(1)} ms por fotograma al 100 %, ${all.toFixed(1)} ms viéndolo todo`);
    assert.ok(near < 60, `al 100 %: ${near} ms`);
    assert.ok(all < 250, `todo: ${all} ms`);
  } finally {
    await page.close();
  }
});

test('abrir un .excalidraw desde el ordenador', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    const dir = await mkdtemp(join(tmpdir(), 'sketch-e2e-'));
    const file = join(dir, 'plano.excalidraw');
    await writeFile(file, JSON.stringify({
      type: 'excalidraw',
      elements: [
        { id: 'r', type: 'rectangle', x: 0, y: 0, width: 160, height: 80, strokeColor: '#1971c2', opacity: 100 },
        { id: 't', type: 'text', x: 10, y: 10, width: 60, height: 25, text: 'Base de datos', containerId: 'r', fontSize: 20, opacity: 100 },
      ],
    }));
    const { root } = await page.send('DOM.getDocument', {});
    const { nodeId } = await page.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#fichero' });
    await page.send('DOM.setFileInputFiles', { nodeId, files: [file] });
    await page.waitFor('document.querySelector("#estado").textContent.includes("2 elementos")');
    const s = await scene(page);
    assert.equal(s.elements[1].containerId, 'r');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});

test('se abre sin conexión una vez cargada', { skip }, async () => {
  const page = await browser.newPage();
  try {
    await open(page);
    await page.eval('navigator.serviceWorker.ready.then(() => true)');
    await page.reload(); // la segunda carga ya pasa por el service worker
    await page.waitFor('navigator.serviceWorker.controller !== null');
    await page.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await page.reload();
    await page.waitFor('!!document.querySelector(".sk-canvas")');
    assert.ok(await page.eval('document.fonts.check(\'24px "Sketch Mano"\')'), 'también la letra');
  } finally {
    await page.close();
  }
});

test('en el móvil no se sale nada de la pantalla', { skip }, async () => {
  const page = await browser.newPage({ width: 390, height: 844, mobile: true });
  try {
    await open(page);
    const overflow = await page.eval('[...document.querySelectorAll(".sk-toolbar, .cabecera, .sk-bottom")].map((e) => e.getBoundingClientRect()).some((r) => r.right > innerWidth + 1 || r.left < -1)');
    assert.equal(overflow, false);
    const hiddenTools = await page.eval('(() => { const t = document.querySelector(".sk-toolbar"); return t.scrollWidth > t.clientWidth + 1; })()');
    assert.equal(hiddenTools, false, 'caben todas las herramientas sin desplazar');
    assert.deepEqual(page.errors, []);
  } finally {
    await page.close();
  }
});
